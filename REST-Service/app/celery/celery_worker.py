import json
from dotenv import load_dotenv
import pandas as pd
from app.src.services.answer_similarity import build_query_similarity_prompt
from app.src.services.answer_rating import build_query_rating_prompt
from app.src.services.multi_turn_eval import build_query_rewrite_prompt
from app.src.services.WatsonXService import WatsonXService
from celery import Celery
import time
import os

load_dotenv()

celery = Celery(__name__)
celery.conf.broker_url = os.environ.get("CELERY_BROKER_URL")
celery.conf.result_backend = os.environ.get("CELERY_RESULT_BACKEND")

### Environmental variables
IBM_CLOUD_API_KEY = os.environ.get("IBM_CLOUD_API_KEY")
WX_PROJECT_ID = os.environ.get("WX_PROJECT_ID")
WX_URL = os.environ.get("WATSONX_URL")
wx_platform: str  = os.environ.get("WX_PLATFORM")
wx_user_onpremise = os.environ.get("WX_USER")

@celery.task(bind=True, name="rating_batch_task")
def rating_batch_task(self, json_data, model_id="meta-llama/llama-3-70b-instruct"):

    try:
        ## Create langchain watsonx LLM service
        watsonx_service = WatsonXService(
                ibm_cloud_url=WX_URL,
                api_key=IBM_CLOUD_API_KEY,
                project_id=WX_PROJECT_ID,
                llm_model_id=model_id,
                platform=wx_platform,
                wx_user_onpremise=wx_user_onpremise
            )
        
        llm_model = watsonx_service.get_wml_llm_services()

        data_df=pd.read_json(json_data)
        tatal_record = len(data_df)
        
        # Iterate over each row in the DataFrame
        for index, row in data_df.iterrows():
            print(index)
            self.update_state(state='PROGRESS', meta={'current': index, 'total': tatal_record})

            prompt, prompt_data = build_query_rating_prompt(row)
            llm_chain = prompt | llm_model

            prompt_results={
                "Grade": None,
                "Explanation": None
            }

            try:
                prompt_results = json.loads(llm_chain.invoke(prompt_data))
            except Exception as e:
                print(f"error in generating ratings, {str(e)}")
        
            data_df.loc[index,"Grade"] = prompt_results["Grade"]

            if 'Explanation' in prompt_results:
                data_df.loc[index,"Explanation"] = prompt_results["Explanation"]
            else:
                data_df.loc[index,"Explanation"] = None

        #self.update_state(state='SUCCESS', meta={'current': tatal_record, 'total': tatal_record})
        return data_df.to_json()
    except Exception as e:
        self.update_state(state='ERROR', meta={'current': None, 'total': tatal_record})
        
        print(str(e))
        return {
            "status": "ERROR",
            "msg": "error in processing multi-turn batch request"
        }
    
@celery.task(bind=True, name="similarity_batch_task")
def similarity_batch_task(self, json_data, model_id="meta-llama/llama-3-70b-instruct"):

    try:
        ## Create langchain watsonx LLM service
        watsonx_service = WatsonXService(
                api_key=IBM_CLOUD_API_KEY,
                project_id=WX_PROJECT_ID,
                llm_model_id=model_id
            )
        
        llm_model = watsonx_service.get_wml_llm_services()

        data_df=pd.read_json(json_data)
        tatal_record = len(data_df)
        
        # Iterate over each row in the DataFrame
        for index, row in data_df.iterrows():
            print(index)
            self.update_state(state='PROGRESS', meta={'current': index, 'total': tatal_record})

            prompt, prompt_data = build_query_similarity_prompt(row)
            llm_chain = prompt | llm_model

            prompt_results={
                "Grade": None,
                "Explanation": None
            }

            try:
                prompt_results = json.loads(llm_chain.invoke(prompt_data))
            except Exception as e:
                print(f"error in generating ratings, {str(e)}")
            
            data_df.loc[index,"Grade"] = prompt_results["Grade"]

            if 'Explanation' in prompt_results:
                data_df.loc[index,"Explanation"] = prompt_results["Explanation"]
            else:
                data_df.loc[index,"Explanation"] = None
                
        return data_df.to_json()
    except Exception as e:
        self.update_state(state='ERROR', meta={'current': None, 'total': tatal_record})
        return {
            "status": "ERROR",
            "msg": "error in processing multi-turn batch request"
        }
    

@celery.task(bind=True, name="multi_turn_batch_task")
def multi_turn_batch_task(self, json_data, model_id="meta-llama/llama-3-70b-instruct"):
    try:
        ## Create langchain watsonx LLM service
        watsonx_service = WatsonXService(
                api_key=IBM_CLOUD_API_KEY,
                project_id=WX_PROJECT_ID,
                llm_model_id=model_id
            )
        
        llm_model = watsonx_service.get_wml_llm_services()
        
        data_df=pd.read_json(json_data)
        tatal_record = len(data_df)

        for index, row in data_df.iterrows():
            print(index)
            self.update_state(state='PROGRESS', meta={'current': index, 'total': tatal_record})

            prompt, prompt_data = build_query_rewrite_prompt(row)
            llm_chain = prompt | llm_model
            prompt_results = None
            try:
                prompt_results = json.loads(llm_chain.invoke(prompt_data))['Grade']
            except:
                prompt_results = 'Error generating grade'
            # Update the DataFrame with the extracted values
            data_df.loc[index,"Grade"] = prompt_results

        return data_df.to_json()
        
    except:
        self.update_state(state='ERROR', meta={'current': None, 'total': tatal_record})
        return {
            "status": "ERROR",
            "msg": "error in processing multi-turn batch request"
        }