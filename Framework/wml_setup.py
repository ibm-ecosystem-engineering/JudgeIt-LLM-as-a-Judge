from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams
from ibm_watsonx_ai.foundation_models import Model

#config Watsonx.ai environment
api_key = ''    
ibm_cloud_url = 'https://us-south.ml.cloud.ibm.com'
project_id = ''

def send_to_watsonxai(prompts,
                    model_id="MIXTRAL",
                    decoding_method="greedy",
                    max_new_tokens=500,
                    min_new_tokens=30,
                    temperature=1.0,
                    repetition_penalty=1.0
                    ):
    if  model_id == "MIXTRAL":
         model_name = "mistralai/mixtral-8x7b-instruct-v01"
    elif model_id == "LLAMA3":
         model_name="meta-llama/llama-3-70b-instruct"
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
        model_id=model_name,
        params=model_params,
        credentials={
		"url" : ibm_cloud_url,
		"apikey" : api_key
            },
        project_id=project_id)

    response=model.generate_text(prompts)
    return response


def send_to_watsonxai_multi_turn(prompts,
                    model_id="MIXTRAL",
                    decoding_method="greedy",
                    max_new_tokens=128,
                    temperature=0.7,
                    repetition_penalty=1.0
                    ):
    if  model_id == "MIXTRAL":
         model_name = "mistralai/mixtral-8x7b-instruct-v01"
    elif model_id == "LLAMA3":
         model_name="meta-llama/llama-3-70b-instruct"
    # Instantiate parameters for text generation
    model_params = {
        GenParams.DECODING_METHOD: decoding_method,
        GenParams.MAX_NEW_TOKENS: max_new_tokens,
        GenParams.RANDOM_SEED: 42,
        GenParams.TEMPERATURE: temperature,
        GenParams.REPETITION_PENALTY: repetition_penalty,
    }
    model = Model(
        model_id=model_name,
        params=model_params,
        credentials={
		"url" : ibm_cloud_url,
		"apikey" : api_key
            },
        project_id=project_id)

    response=model.generate_text(prompts)
    return response