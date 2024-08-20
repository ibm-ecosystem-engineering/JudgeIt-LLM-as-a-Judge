from ibm_watson_machine_learning.foundation_models import Model
from ibm_watson_machine_learning.metanames import GenTextParamsMetaNames as GenParams

from ibm_watsonx_ai.foundation_models import Model
from langchain_ibm import WatsonxLLM
from langchain_core.prompts import PromptTemplate

class WatsonXService:

    def __init__(self,
                 api_key, 
                 project_id, 
                 llm_model_id) -> None:
        self.api_key        = api_key  
        self.ibm_cloud_url  = 'https://us-south.ml.cloud.ibm.com'
        self.project_id     = project_id
        self.llm_model_id   = llm_model_id

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
        llm_model = WatsonxLLM(apikey=self.api_key,
                            url=self.ibm_cloud_url,
                            project_id=self.project_id,
                            model_id=self.llm_model_id,
                            params=generate_parameters)
        return llm_model

    ## using watsonx machine learning api
    def send_to_watsonxai(
                        self,
                        prompts,
                        model_id="meta-llama/llama-3-70b-instruct",
                        decoding_method="greedy",
                        max_new_tokens=500,
                        min_new_tokens=30,
                        temperature=1.0,
                        repetition_penalty=1.0
                        ):
        
        # Instantiate parameters for text generation
        model_params = {
            GenParams.DECODING_METHOD: decoding_method,
            GenParams.MIN_NEW_TOKENS: min_new_tokens,
            GenParams.MAX_NEW_TOKENS: max_new_tokens,
            GenParams.RANDOM_SEED: 42,
            GenParams.TEMPERATURE: temperature,
            GenParams.REPETITION_PENALTY: repetition_penalty,
        }

        model = Model(
            model_id=model_id,
            params=model_params,
            credentials={
            "url" : self.ibm_cloud_url,
            "apikey" : self.api_key
                },
            project_id=self.project_id)

        response=model.generate_text(prompts)
        return response
    