import io
from dotenv import load_dotenv
from fastapi import APIRouter, File, Query, UploadFile, requests as request
from app.src.models.QueryRewriteInput import QueryRewriteInput
from app.src.services.LLMJudgeService import LLMJudgeService
from app.src.models.LLMInput import LLMInput
import os
from fastapi.responses import JSONResponse, StreamingResponse
import json
from app.src.services.QueryRewriteClassification import query_rewrite_and_classification
from app.src.services.WatsonXService import WatsonXService
from app.src.utils.Helper import Helper
import pandas as pd

load_dotenv()

judge_api_route = APIRouter()
API_PREFIX = "/api/v1/judge"

### Environmental variables
IBM_CLOUD_API_KEY = os.environ.get("IBM_CLOUD_API_KEY")
WX_PROJECT_ID = os.environ.get("WX_PROJECT_ID")

### LLM Judge service
llm_judge = LLMJudgeService(api_key=IBM_CLOUD_API_KEY, project_id=WX_PROJECT_ID)

## This routes returns the text to SQL from a given context and a sql query
@judge_api_route.post(path=API_PREFIX + '/rating', description="### Model name would be either LLAMA3 or MIXTRAL")
def rating(llm_input :LLMInput):
    
    llm_response = llm_judge.simple_processing_rating(
        golden_answer=llm_input.golden_answer,
        model=llm_input.model,
        question=llm_input.question,
        response_1=llm_input.llm_response
        )

    return JSONResponse(content=llm_response)

rating_batch_file_format = """
# Runs a batch job to find LLM response ratings

## This is the execl/csv data format. Please make sure, files have these column name with correct case.

| Question    | golden_answer | llm_response      | 
| ----------- | ------------- | ----------------- | 
| question1   | Golen anser 1 | llm response 1    |

"""

## This routes returns the text to SQL from a given context and a sql query
@judge_api_route.post(path=API_PREFIX + '/rating/batch', description=rating_batch_file_format)
async def rating_batch(
    model_name: str = Query("LLAMA3", description="### Model name would be either LLAMA3 or MIXTRAL"), 
    file: UploadFile = File(...)):

    file_content = await file.read()
    ##print(file_content)

    help = Helper()
    pandas_file = help.read_data(file.filename, file_content)

    data = llm_judge.batch_processing_rating(pandas_file, model_name)
    
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='batch_rating')
    output.seek(0)
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment; filename=data.xlsx"})

@judge_api_route.post(API_PREFIX + '/similarity')
def similarity(llm_input :LLMInput):

    llm_response = llm_judge.simple_processing_similarity_answer(
        golden_answer=llm_input.golden_answer,
        model=llm_input.model,
        question=llm_input.question,
        response_1=llm_input.llm_response
    )
    return JSONResponse(content=llm_response)

similarity_batch_file_format = """
# Runs a batch job to find LLM response similarity

## This is the execl/csv data format. Please make sure, files have these column name with correct case.

| Question    | golden_answer | llm_response      | 
| ----------- | ------------- | ----------------- | 
| question1   | Golen anser 1 | llm response 1    |

"""

## This routes returns the text to SQL from a given context and a sql query
@judge_api_route.post(path=API_PREFIX + '/similarity/batch', description=similarity_batch_file_format)
async def similarity_batch(
    model_name: str = Query("LLAMA3", description="## Model name would be either LLAMA3 or MIXTRAL"), 
    file: UploadFile = File(...)):

    file_content = await file.read()
    ##print(file_content)

    help = Helper()
    pandas_file = help.read_data(file.filename, file_content)

    data = llm_judge.batch_processing_similarity(pandas_file, model_name)
    
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='batch_rating')
    output.seek(0)
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment; filename=data.xlsx"})


## This routes returns the text to SQL from a given context and a sql query
@judge_api_route.post(API_PREFIX + '/multiturn')
def query_rewrite_classification(llm_input :QueryRewriteInput):
    
    watsonx_service = WatsonXService(
             api_key=IBM_CLOUD_API_KEY,
             project_id=WX_PROJECT_ID
        )
    response = query_rewrite_and_classification(
       model=llm_input.model,
       previous_question = llm_input.previous_question,
       previous_answer = llm_input.previous_answer,
       current_question = llm_input.current_question,
       gold_label = llm_input.gold_label,
       gold_rewrite = llm_input.gold_rewrite,
       watsonx_service=watsonx_service)

    return JSONResponse(content=response)
