from dotenv import load_dotenv
from fastapi import APIRouter, File, HTTPException, Header, Security, requests as request
from fastapi.security import APIKeyHeader
from app.src.models.Experiment import Experiment
from app.src.models.RequestHistory import RequestHistory
from app.src.services.ManagementService import ManagementService
from starlette.status import HTTP_403_FORBIDDEN, HTTP_409_CONFLICT
import os
from app.src.services.MongoService import MongoService
from fastapi.responses import JSONResponse

load_dotenv()

mongo_db = MongoService()
management_service = ManagementService(mongo_db)


judge_management_api_route = APIRouter(
    prefix="/api/v1/manage",
    tags=["LLM Judge management API"]
)

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

##### Experiment section #####################################################################

@judge_management_api_route.get(path='/experiments', description="Returns list of experiments")
def get_experiment_list(user_id: str = Header(...), api_key: str = Security(get_api_key)):
    experiments = management_service.get_experiments(user_id)
    return JSONResponse(content=experiments)

@judge_management_api_route.get(path='/experiments/type/{type}', description="Returns list of experiments by type")
def get_experiment_list_by_type(type: str, user_id: str = Header(...), api_key: str = Security(get_api_key)):
    experiments = management_service.get_experiments_by_type(user_id, type)
    return JSONResponse(content=experiments)

@judge_management_api_route.post(path='/experiment', description="Add a new experiment")
def add_new_experiment(experiment_input: Experiment, user_id: str = Header(...), api_key: str = Security(get_api_key)):
    
    experiment_exist = management_service.get_experiment_by_name_and_type(user_id, experiment_input.name,experiment_input.type)

    if experiment_exist is None:
        insert_id = management_service.add_experiment(experiment_input)
        return JSONResponse(content={
            "insert_id": insert_id
        })
    
    raise HTTPException(
            status_code=HTTP_409_CONFLICT, detail="Experiment name is already exist."
        )

@judge_management_api_route.delete(path='/experiment/{doc_id}', description="Delete an experiment by id")
def delete_experiment(doc_id: str, api_key: str = Security(get_api_key), user_id: str = Header(...)):
    del_count = management_service.delete_experiment(doc_id)
    res = "success" if del_count > 0 else "failed"
    return JSONResponse(content={
        "status": res
    })    

@judge_management_api_route.delete(path='/experiment/name/{experiment_name}', description="Delete an experiment by experiment name")
def delete_experiment_by_experiment_name(experiment_name: str, api_key: str = Security(get_api_key), user_id: str = Header(...)):
    del_count =  management_service.delete_experiment_by_name(experiment_name, user_id)
    res = "success" if del_count > 0 else "failed"
    return JSONResponse(content={
        "status": res
    })   

##### History section #####################################################################

@judge_management_api_route.get(path='/histories', description="Returns list of request history")
def get_request_histories(user_id: str = Header(...), api_key: str = Security(get_api_key)):
    histories = management_service.get_histories(user_id)
    return JSONResponse(content=histories)

@judge_management_api_route.get(path='/histories/{doc_id}', description="Get request history by id")
def get_request_histories_by_doc_id(doc_id: str, user_id: str = Header(...), api_key: str = Security(get_api_key)):
    histories = management_service.get_history_by_id(user_id, doc_id)
    return JSONResponse(content=histories)

@judge_management_api_route.get(path='/histories/name/{experiment_name}', description="Returns list of request history by experiment name")
def get_request_histories_by_experiment_name(experiment_name: str, user_id: str = Header(...), api_key: str = Security(get_api_key)):
    histories = management_service.get_histories_by_experiment_name(user_id, experiment_name)
    return JSONResponse(content=histories)

@judge_management_api_route.get(path='/histories/name/{experiment_name}/type/{type}', description="Returns list of request history by experiment name and type")
def get_request_histories_by_experiment_name(experiment_name: str, type: str, user_id: str = Header(...), api_key: str = Security(get_api_key)):
    histories = management_service.get_histories_by_experiment_name_type(user_id, experiment_name, type)
    return JSONResponse(content=histories)

@judge_management_api_route.get(path='/histories/type/{type}', description="Returns list of request history by experiment name")
def get_request_histories_by_type(type: str, user_id: str = Header(...), api_key: str = Security(get_api_key)):
    histories = management_service.get_histories_by_type(user_id, type)
    return JSONResponse(content=histories)

@judge_management_api_route.post(path='/history', description="Add a new request history")
def add_new_request_history(history_input: RequestHistory, api_key: str = Security(get_api_key)):
    insert_id = management_service.add_history(history_input)
    return JSONResponse(content={
        "insert_id": insert_id
    })

@judge_management_api_route.delete(path='/history/{doc_id}', description="Delete a request history by document id")
def delete_request_history(doc_id: str, api_key: str = Security(get_api_key), user_id: str = Header(...)):
    del_count = management_service.delete_history(doc_id, user_id)
    res = "success" if del_count > 0 else "failed"
    return JSONResponse(content={
        "status": res
    })   
