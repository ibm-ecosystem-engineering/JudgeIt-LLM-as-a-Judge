import json
import configparser
from langchain_ibm import WatsonxLLM
from langchain_core.prompts import PromptTemplate

config = configparser.ConfigParser()
config.read('./config.ini')

## Grading a generated text compared to a golden text
SIMILARITY_PROMPT= """Follow these structured steps to accurately assess the similarity between a Golden Text and a Generated Text:
1. **Role and Task**: Assume the role of an impartial assistant and evaluator. Your task is to assess the similarity between a Golden Text and a Generated Text using the provided information.
2. **Initial Setup**: Begin by carefully reviewing the Golden Text to understand the key information, entities, and intents it contains. The Golden Text is considered fully correct and comprehensive. Then, examine the Generated Text that needs evaluation.
3. **Evaluation Criteria**: Evaluate the Generated Text based on the following criteria:
    - Output {{"Grade": "1"}} if:
      a) The Generated Text matches the Golden Text closely in terms of key entities and intents. Note that these may be worded differently but convey the same meaning.
      b) The Generated Text contains all the essential information from the Golden Text, even if presented in a different order or with slight variations in phrasing.
      c) The Generated Text includes the core information from the Golden Text and may contain additional relevant details or expansions that don't contradict the original.
    - Output {{"Grade": "0"}} if:
      a) The Generated Text is missing critical entities or intents that are present in the Golden Text.
      b) The Generated Text contains significant factual errors or contradictions when compared to the Golden Text.
      c) The overall meaning or intent of the Generated Text substantially differs from the Golden Text.
4. **Tolerance for Minor Differences**: Allow for minor differences in numerical values, slight variations in proper nouns, and small discrepancies in less critical details, as long as the core meaning and primary facts remain intact.
5. **Explanation**: After providing the grade, explain your reasoning in 1 sentence, highlighting key similarities or differences that influenced your decision.
6. **Output Format**: Format your evaluation output strictly as {{"Grade": "evaluated grade", "Explanation": "explanation for grade"}} to ensure clarity and consistency in assessment.
Remember, the goal is to identify substantive similarity rather than expecting word-for-word matches. Focus on the core information, key facts, and overall intent when making your assessment.

Input:
Golden Text: {prompt_parameter_1}
Generated Text: {prompt_parameter_2}

Output:
"""

def batch_llm_answer_similarity(model_id, input_data):
    # watsonx.ai credentials for llm judge

    # instantiate wml connection
    wml_credentials = {
        "url": "https://us-south.ml.cloud.ibm.com",
        "apikey": config['WML_CRED']['api_key']
    }

    project_id = config['WML_CRED']['project_id']

    llm_model_id = model_id

    # llm parameters
    generate_parameters_1 = {
        "decoding_method": "greedy",
        "min_new_tokens": 1,
        "max_new_tokens": 200,
        "repetition_penalty": 1,
        "stop_sequences": ['}']
    }

    # instatiate llm
    llm_model = WatsonxLLM(apikey=wml_credentials['apikey'],
                            url=wml_credentials['url'],
                            project_id=project_id,
                            model_id=llm_model_id,
                            params=generate_parameters_1)

    input_data['Grade'] = None
    input_data['Explanation'] = None

    for index, row in input_data.iterrows():
        input_variables = ['prompt_parameter_1', 'prompt_parameter_2']
        prompt = PromptTemplate(input_variables=input_variables, template=SIMILARITY_PROMPT)
        llm_chain = prompt | llm_model
        # create invoke parameter which is a dictionary of your prompt parameters
        prompt_data = {'prompt_parameter_1': row['golden_text'],
                    'prompt_parameter_2': row['generated_text']}
        try:
            prompt_results = json.loads(llm_chain.invoke(prompt_data))
        except:
            prompt_results = 'Error generating results'
        
        if prompt_results == 'Error generating results':
                input_data.at[index,'Grade'] = 'Error'
                input_data.at[index,'Explanation'] = 'Error'
        else:
            input_data.at[index,'Grade'] = int(prompt_results['Grade'])
            input_data.at[index,'Explanation'] = prompt_results['Explanation']

    return input_data
