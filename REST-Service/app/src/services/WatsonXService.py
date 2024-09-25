import os
from ibm_watson_machine_learning.foundation_models import Model
from ibm_watson_machine_learning.metanames import GenTextParamsMetaNames as GenParams
from ibm_watsonx_ai.foundation_models import Model
from langchain_ibm import WatsonxLLM
from langchain_core.prompts import PromptTemplate

class WatsonXService:

    def __init__(self,
                 ibm_cloud_url,
                 api_key, 
                 project_id, 
                 llm_model_id,
                 platform,
                 wx_user_onpremise) -> None:
        self.api_key        = api_key  
        self.ibm_cloud_url  = ibm_cloud_url
        self.project_id     = project_id
        self.llm_model_id   = llm_model_id
        self.platform       = platform
        self.wx_user_onpremise = wx_user_onpremise

    def get_wml_llm_services(self,
            decoding_method="greedy",
            min_new_tokens=1,
            max_new_tokens=200,
            repetition_penalty=1,
            stop_sequences=['}']) -> WatsonxLLM:
        
         # llm parameters
        generate_parameters = {
            "decoding_method": decoding_method,
            "min_new_tokens": min_new_tokens,
            "max_new_tokens": max_new_tokens,
            "repetition_penalty": repetition_penalty,
            "stop_sequences": stop_sequences
        }

        # instatiate llm
        if self.platform == "saas":
            return WatsonxLLM(apikey=self.api_key,
                            url=self.ibm_cloud_url,
                            project_id=self.project_id,
                            model_id=self.llm_model_id,
                            params=generate_parameters)
            return llm_model
        elif self.platform == "onpremise":
            return WatsonxLLM(apikey=self.api_key,
                            url=self.ibm_cloud_url,
                            model_id=self.llm_model_id,
                            username=self.wx_user_onpremise,
                            instance_id='openshift',
                            project_id=self.project_id,
                            version="5.0",
                            params=generate_parameters)
        else:
            raise Exception("Please set a correct environment variable for WX_PLATFORM, correct values are `onpremise` or `saas` ")

    