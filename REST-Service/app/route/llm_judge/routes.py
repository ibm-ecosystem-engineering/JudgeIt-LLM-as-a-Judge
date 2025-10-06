import asyncio
import io
from dotenv import load_dotenv
from fastapi import APIRouter, File, HTTPException, Query, Request, Security, UploadFile, WebSocket, WebSocketDisconnect, requests as request
from fastapi.security import APIKeyHeader
from app.celery.celery_worker import single_turn_batch_task, multi_turn_with_conversation_batch_task, rating_batch_task, similarity_batch_task
from app.celery.celery_worker import wbox_sdrflow_batch_task, bbox_sdrflow_batch_task, agent_sdrflow_batch_task
from app.src.models.SingleTurnInput import SingleTurnInput
from app.src.models.MultiTurnInput import MultiTurnInput
from app.src.services.LLMJudgeService import LLMJudgeService
from app.src.models.LLMInput import LLMInput
from starlette.status import HTTP_403_FORBIDDEN, HTTP_500_INTERNAL_SERVER_ERROR
import os
from fastapi.responses import JSONResponse, StreamingResponse
from app.src.services.WatsonXService import WatsonXService
from app.src.utils.Helper import Helper
import pandas as pd
from celery.result import AsyncResult
import json

load_dotenv()

judge_api_route = APIRouter(
    prefix="/api/v1/judge",
    tags=["LLM Judge route"]
)

### Environmental variables
IBM_CLOUD_API_KEY = os.environ.get("IBM_CLOUD_API_KEY")
WX_URL = os.environ.get("WATSONX_URL")
WX_PROJECT_ID = os.environ.get("WX_PROJECT_ID")
wx_platform: str  = os.environ.get("WX_PLATFORM")
wx_user_onpremise = os.environ.get("WX_USER")
wx_gov = os.environ.get("WX_GOV_REGION")

# RAG APP Security
API_KEY_NAME = "LLM_JUDGE_API_KEY"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

# Basic security for accessing the App
async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header == os.environ.get("LLM_JUDGE_API_KEY"):
        return api_key_header
    else:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN, detail="Could not validate RAG APP credentials. Please check your ENV."
        )

## This routes returns the text to SQL from a given context and a sql query
@judge_api_route.post(path='/rating', description="### default model name is meta-llama/llama-3-3-70b-instruct")
def rating(llm_input :LLMInput, api_key: str = Security(get_api_key)):
    if llm_input.golden_text is None:
        raise HTTPException(status_code=422, detail="Golden text is not found")
    
    if llm_input.generated_text is None:
        raise HTTPException(status_code=422, detail="Generated text is not found")
    
    llm_model = llm_input.model
    if llm_model is None:
        llm_model = "meta-llama/llama-3-3-70b-instruct"
    
    ## Create langchain watsonx LLM service
    watsonx_service = WatsonXService(
            api_key=IBM_CLOUD_API_KEY,
            project_id=WX_PROJECT_ID,
            llm_model_id=llm_model
    )
    llm_model_service = watsonx_service.get_wml_llm_services()
    ### LLM Judge service
    llm_judge = LLMJudgeService()

    llm_response = llm_judge.simple_processing_rating(
        golden_text=llm_input.golden_text,
        generated_text=llm_input.generated_text,
        llm_model=llm_model_service
    )

    return JSONResponse(content=llm_response)

rating_batch_file_format = """
# Runs a batch job to find LLM response ratings

## This is the execl/csv data format. Please make sure, files have these column name with correct case.

| question      |  golden_text   | generated_text      | 
| ------------- | -------------  | -----------------   | 
| question 1    |  Golen text 1  | generated text 1    |

"""

## This routes returns the text to SQL from a given context and a sql query
@judge_api_route.post(path='/rating/batch', description=rating_batch_file_format)
async def rating_batch(
    model_name: str = Query("meta-llama/llama-3-3-70b-instruct", description="### Default model name is meta-llama/llama-3-3-70b-instruct"), 
    file: UploadFile = File(...),
    api_key: str = Security(get_api_key)):
    
    file_content = await file.read()
    ##print(file_content)

    try:
        help = Helper()
        data_df: pd.DataFrame = help.read_data(file.filename, file_content)
    except Exception as ex:
        raise HTTPException(status_code=400, detail=str(ex))
    
    try:
        help.validate_rating_and_similarity_fields(data_df=data_df)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    df_json = data_df.to_json()
    task = rating_batch_task.delay(df_json, model_name)
    return JSONResponse({'task_id': task.id})

@judge_api_route.post('/similarity')
def similarity(llm_input :LLMInput, api_key: str = Security(get_api_key)):

    if llm_input.golden_text is None:
        raise HTTPException(status_code=422, detail="Golden text is not found")
    
    if llm_input.generated_text is None:
        raise HTTPException(status_code=422, detail="Generated text is not found")
    
    llm_model = llm_input.model
    if llm_model is None:
        llm_model = "meta-llama/llama-3-3-70b-instruct"

    ## Create langchain watsonx LLM service
    watsonx_service = WatsonXService(
            api_key=IBM_CLOUD_API_KEY,
            project_id=WX_PROJECT_ID,
            llm_model_id=llm_model
    )
    llm_model_service = watsonx_service.get_wml_llm_services()
    ### LLM Judge service
    llm_judge = LLMJudgeService()

    llm_response = llm_judge.simple_processing_similarity_answer(
        golden_text=llm_input.golden_text,
        generated_text=llm_input.generated_text,
        llm_model=llm_model_service
    )
    return JSONResponse(content=llm_response)

similarity_batch_file_format = """
# Runs a batch job to find LLM response similarity

## This is the execl/csv data format. Please make sure, files have these column name with correct case.

| question      |  golden_text   | generated_text      | 
| ------------- | -------------  | -----------------   | 
| question 1    |  Golen text 1  | generated text 1    |

"""

## This routes returns the text to SQL from a given context and a sql query
@judge_api_route.post(path='/similarity/batch', description=similarity_batch_file_format)
async def similarity_batch(
    model_name: str = Query("meta-llama/llama-3-3-70b-instruct", description="## Default model name is meta-llama/llama-3-3-70b-instruct"), 
    file: UploadFile = File(...),
    api_key: str = Security(get_api_key)):

    file_content = await file.read()
    ##print(file_content)

    try:
        help = Helper()
        data_df: pd.DataFrame = help.read_data(file.filename, file_content)
    except Exception as ex:
        raise HTTPException(status_code=400, detail=str(ex))
    
    try:
        help.validate_rating_and_similarity_fields(data_df=data_df)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    df_json = data_df.to_json()
    task = similarity_batch_task.delay(df_json, model_name)
    return JSONResponse({'task_id': task.id})


## This routes returns the text to SQL from a given context and a sql query
@judge_api_route.post('/singleturn')
def query_single_turn_evaluation(llm_input :SingleTurnInput, api_key: str = Security(get_api_key)):
    
    if llm_input.previous_question is None:
        raise HTTPException(status_code=422, detail="previous_question is not found")
    
    if llm_input.previous_answer is None:
        raise HTTPException(status_code=422, detail="previous_answer is not found")
    
    if llm_input.current_question is None:
        raise HTTPException(status_code=422, detail="current_question is not found")
    
    if llm_input.golden_rewritten_question is None:
        raise HTTPException(status_code=422, detail="golden_rewritten_question is not found")
    
    if llm_input.rewritten_question is None:
        raise HTTPException(status_code=422, detail="rewritten_question is not found")
    
    llm_model = llm_input.model
    if llm_model is None:
        llm_model = "meta-llama/llama-3-3-70b-instruct"

    ## Create langchain watsonx LLM service
    watsonx_service = WatsonXService(
            api_key=IBM_CLOUD_API_KEY,
            project_id=WX_PROJECT_ID,
            llm_model_id=llm_model
    )
    llm_model_service = watsonx_service.get_wml_llm_services()
    ### LLM Judge service
    llm_judge = LLMJudgeService()

    llm_response = llm_judge.single_trun_llm_judge(
        previous_question=llm_input.previous_question,
        previous_answer=llm_input.previous_answer,
        current_question=llm_input.current_question,
        golden_rewritten_question=llm_input.golden_rewritten_question,
        rewritten_question=llm_input.rewritten_question,
        llm_model=llm_model_service
    )

    return JSONResponse(content=llm_response)

## This routes returns the text to SQL from a given context and a sql query
@judge_api_route.post('/multiturn')
def query_multi_turn_evaluation(llm_input : MultiTurnInput, api_key: str = Security(get_api_key)):
    
    if llm_input.conversation_history is None:
        raise HTTPException(status_code=422, detail="Conversation history is not found")
    
    if llm_input.follow_up_query is None:
        raise HTTPException(status_code=422, detail="Follow up query is not found")
    
    if llm_input.golden_query is None:
        raise HTTPException(status_code=422, detail="Golden query is not found")
    
    if llm_input.rewritten_query is None:
        raise HTTPException(status_code=422, detail="Rewritten query is not found")
        
    llm_model = llm_input.model
    if llm_model is None:
        llm_model = "meta-llama/llama-3-3-70b-instruct"

    ## Create langchain watsonx LLM service
    watsonx_service = WatsonXService(
            api_key=IBM_CLOUD_API_KEY,
            project_id=WX_PROJECT_ID,
            llm_model_id=llm_model
    )
    llm_model_service = watsonx_service.get_wml_llm_services()
    ### LLM Judge service
    llm_judge = LLMJudgeService()

    llm_response = llm_judge.multi_trun_llm_judge(
        conversation_history=llm_input.conversation_history,
        follow_up_query=llm_input.follow_up_query,
        golden_query=llm_input.golden_query,
        rewritten_query=llm_input.rewritten_query,
        llm_model=llm_model_service
    )

    return JSONResponse(content=llm_response)


single_trun_batch_file_format = """
# Runs a batch job to find LLM single_turn

## This is the execl/csv data format. Please make sure, files have these column name with correct case.

| previous_question    | previous_answer  | current_question   | golden_rewritten_question   | rewritten_question    |
| -------------------- | ---------------- | ------------------ | --------------------------- | --------------------- |
| previous question 1  | Previous Answer1 | current question 1 | golden rewritten question 1 | rewritten question 1  |

"""

## This routes returns the text to SQL from a given context and a sql query
@judge_api_route.post('/singleturn/batch', description=single_trun_batch_file_format)
async def query_single_turn_batch(file: UploadFile = File(...), api_key: str = Security(get_api_key)):
    
    file_content = await file.read()
    ##print(file_content)

    try:
        help = Helper()
        data_df: pd.DataFrame = help.read_data(file.filename, file_content)
    except Exception as ex:
        raise HTTPException(status_code=400, detail=str(ex))

    try:
        help.validate_single_turn_fields(data_df=data_df)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

    df_json = data_df.to_json()
    task = single_turn_batch_task.delay(df_json)
    return JSONResponse({'task_id': task.id})


multi_trun_batch_file_format = """
# Runs a batch job to find LLM rating multi-turn

## This is the execl/csv data format. Please make sure, files have these column name with correct case.

| conversation_history    | follow_up_query  | golden_query    | rewritten_query             | 
| -------------------- | ---------------- | ------------------ | --------------------------- | 
| previous question 1  | Previous Answer1 | current question 1 | golden rewritten question 1 | 

"""

## This routes returns the text to SQL from a given context and a sql query
@judge_api_route.post('/multiturn/batch', description=multi_trun_batch_file_format)
async def query_multi_turn_batch(file: UploadFile = File(...), api_key: str = Security(get_api_key)):
    
    file_content = await file.read()
    ##print(file_content)

    try:
        help = Helper()
        data_df: pd.DataFrame = help.read_data(file.filename, file_content)
    except Exception as ex:
        raise HTTPException(status_code=400, detail=str(ex))

    try:
        help.validate_multi_turn_with_conversation_fields(data_df=data_df)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

    df_json = data_df.to_json()
    task = multi_turn_with_conversation_batch_task.delay(df_json)
    return JSONResponse({'task_id': task.id})



@judge_api_route.get(path="/status/{task_id}", description="Checks current status of the task using http request response")
async def get_status(task_id: str, request: Request, api_key: str = Security(get_api_key)):
    result = AsyncResult(task_id)
    if result.state == 'PENDING' and not result.result:
        return {"status": "ERROR", "msg": "Task not found."}
    elif result.state == 'PENDING':
        return {"status": "PENDING"}
    elif result.state == 'PROGRESS':
        return {"status": "PROGRESS", "current": result.info['current'], "total": result.info['total']}
    elif result.state == 'SUCCESS':
        base_url = request.base_url
        download_url = f"{base_url}api/v1/judge/download/{task_id}"
        return {"status": "SUCCESS", "result": result.result, "download_link": download_url }
    elif result.state == 'ERROR':
        return {"status": "ERROR", "msg": "error in processing batch request"}
    else:
        return {"status": "UNKNOWN"}

@judge_api_route.get(path="/events/{task_id}", description="Its a server sent event SSE, pushes real-time updates to the client.")
async def get_events(request: Request, task_id: str):
    async def event_generator():
        while True:
            result = AsyncResult(task_id)
            if result.state == 'PENDING' and not result.result:
                ## yield f'data: {{"status": "ERROR", "msg": "Task not found"}}\n\n'
                yield f'data: {{"status": "PENDING", "current": 0, "total": 1}}\n\n'
            elif result.state == 'PROGRESS':
                progress = result.info
                yield f'data: {{"status": "PROGRESS", "current": {progress["current"]}, "total": {progress["total"]}}}\n\n'
            elif result.state == 'SUCCESS':
                #progress = result.info
                # base_url = request.base_url
                # download_url = f"{base_url}api/v1/judge/download/{task_id}"
                yield f'data: {{"status": "SUCCESS" }}\n\n'
                break
            elif result.state == 'FAILURE':
                yield f'data: {{"status": "FAILURE"}}\n\n'
                break
            elif result.state == 'ERROR':
                yield f'data: {{"status": "ERROR", "msg": "Error in executing task"}}\n\n'
                break
            await asyncio.sleep(2)
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@judge_api_route.websocket("/ws/{task_id}")
async def websocket_endpoint(websocket: WebSocket, request: Request, task_id: str):
    await websocket.accept()
    try:
        while True:
            result = AsyncResult(task_id)
            if result.state == 'PENDING' and not result.result:
                await websocket.send_json({'status': 'PENDING', 'current': 0, 'total': 1})
            elif result.state == 'PROGRESS':
                progress = result.info
                await websocket.send_json({'status': 'PROGRESS', 'current': progress['current'], 'total': progress['total']})
            elif result.state == 'SUCCESS':
                base_url = request.base_url
                download_url = f"{base_url}api/v1/judge/download/{task_id}"
                await websocket.send_json({'status': 'SUCCESS', 'result': result.result, "download_link": download_url})
                break
            elif result.state == 'FAILURE':
                await websocket.send_json({'status': 'FAILURE', 'msg': 'Task execution failed'})
                break
            elif result.state == 'ERROR':
                await websocket.send_json({'status': 'ERROR', 'msg': 'Error in executing task'})
                break
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        print(f"Client disconnected from task {task_id}")

@judge_api_route.get(path="/download/{task_id}", description="Download the completed task")
async def download_file(task_id: str, api_key: str = Security(get_api_key)):
    result = AsyncResult(task_id)
    if result.state == 'SUCCESS':
        data = pd.read_json(result.result)
        df = pd.DataFrame(data)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='evaluation-result')
        output.seek(0)
        return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment; filename=data.xlsx"})
    
    if result.state == 'PENDING' and not result.result:
        return {"status": "ERROR", "msg": "Task not found."}
    
    return {"status": "ERROR", "msg": "Task not completed or file not found."}

@judge_api_route.get(path="/result/{task_id}", description="Get JSON version of result by task_id")
async def get_result(task_id: str, api_key: str = Security(get_api_key)):
    result = AsyncResult(task_id)
    if result.state == 'SUCCESS':
        json_object = json.loads(result.result)
        return JSONResponse(content=json_object)
    
    if result.state == 'PENDING' and not result.result:
        return {"status": "ERROR", "msg": "Task not found."}
    
    return {"status": "ERROR", "msg": "Task not completed or file not found."}

wbox_sdrflow_batch_file_format = """
# Runs a batch job for whitebox evaluation for sdr+ workflow

## This is the execl/csv data format. Please make sure, files have these column name with correct case.

| Query  | Agent Thought Trail    | 
| ------------- | -----------------   | 
| user query  | agent thought trail data   |

"""

@judge_api_route.post(path='/wbox/batch', description=wbox_sdrflow_batch_file_format)
async def wbox_sdrflow_batch(
    # model_name: str = Query("meta-llama/llama-3-3-70b-instruct", description="### Default model name is meta-llama/llama-3-3-70b-instruct"), 
    file: UploadFile = File(...),
    api_key: str = Security(get_api_key)):
    file_content = await file.read()
    ##print(file_content)

    model_name = "meta-llama/llama-3-3-70b-instruct"

    try:
        help = Helper()
        data_df: pd.DataFrame = help.read_data(file.filename, file_content)
    except Exception as ex:
        raise HTTPException(status_code=400, detail=str(ex))
    
    try:
        help.validate_wbox_eval_fields(data_df=data_df)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    df_json = data_df.to_json()
    task = wbox_sdrflow_batch_task.delay(df_json, model_name)
    return JSONResponse({'task_id': task.id})


bbox_sdrflow_batch_file_format = """
# Runs a batch job for blackbox evaluation for sdr+ workflow

## This is the execl/csv data format. Please make sure, files have these column name with correct case.

| Chrono Agent Output | Product Agent Output | Research Agent Output | Comms Agent Output| 
| ------------------- | -------------------- | --------------------- | ------------------|
| chrono output       | product output       | research output       | comms output      |

"""
@judge_api_route.post(path='/bbox/batch', description=bbox_sdrflow_batch_file_format)
async def bbox_sdrflow_batch(
    # model_name: str = Query("meta-llama/llama-3-3-70b-instruct", description="### Default model name is meta-llama/llama-3-3-70b-instruct"), 
    file: UploadFile = File(...),
    api_key: str = Security(get_api_key)):
    file_content = await file.read()
    ##print(file_content)

    ###print("file: ", file.filename)

    model_name = "meta-llama/llama-3-3-70b-instruct"

    try:
        help = Helper()
        data_df: pd.DataFrame = help.read_data(file.filename, file_content)
        data_df = data_df.rename(columns=lambda x: x.title())
        ##print(f"data df cols: {data_df.columns}")
        data_df = data_df[data_df["Status"] == "completed"]
    except Exception as ex:
        raise HTTPException(status_code=400, detail=str(ex))
    
    try:
        #help.validate_wbox_eval_fields(data_df=data_df)
        help.validate_bbox_eval_fields(data_df=data_df)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    df_json = data_df.to_json()
    #task = bbox_sdrflow_batch_task.delay(df_json, model_name)
    # no need to send json of data frame, send the data frame as is
    # Yes we need to send json or else celery complains for some reason
    ##print("in routes.py model name: ", model_name)
    task = bbox_sdrflow_batch_task.delay(df_json, model_name)
    return JSONResponse({'task_id': task.id})



agent_sdrflow_batch_file_format = """
# Runs a batch job for agent evaluation for sdr+ workflow

## This is the execl/csv data format. Please make sure, files have these column name with correct case.

| Chrono Agent Output | Product Agent Output | Research Agent Output | Comms Agent Output| 
| ------------------- | -------------------- | --------------------- | ------------------|
| chrono output       | product output       | research output       | comms output      |

"""
@judge_api_route.post(path='/agent/batch', description=agent_sdrflow_batch_file_format)
async def agent_sdrflow_batch(
    # model_name: str = Query("meta-llama/llama-3-3-70b-instruct", description="### Default model name is meta-llama/llama-3-3-70b-instruct"), 
    file: UploadFile = File(...),
    api_key: str = Security(get_api_key)):
    file_content = await file.read()
    ##print(file_content)

    ###print("file: ", file.filename)

    model_name = "meta-llama/llama-3-3-70b-instruct"

    try:
        help = Helper()
        data_df: pd.DataFrame = help.read_data(file.filename, file_content)
        data_df = data_df.rename(columns=lambda x: x.title())
        ##print(f"data df cols: {data_df.columns}")
        data_df = data_df[data_df["Status"] == "completed"]
    except Exception as ex:
        raise HTTPException(status_code=400, detail=str(ex))
    
    try:
        help.validate_agent_eval_fields(data_df=data_df)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    df_json = data_df.to_json()
    task = agent_sdrflow_batch_task.delay(df_json, model_name)
    return JSONResponse({'task_id': task.id})