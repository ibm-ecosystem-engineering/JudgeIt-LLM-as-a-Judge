import json
import configparser
from langchain_ibm import WatsonxLLM
from langchain_core.prompts import PromptTemplate
import sys

config = configparser.ConfigParser()
config.read('./config.ini')

MULTI_TURN_JUDGE_PROMPT = """Follow these below structured steps to accurately assess query transformations and ensure alignment with provided criteria.
1. **Role and Task**: Assume the role of an impartial assistant and judge. Your task is to evaluate query transformations using provided information. You will receive a Previous Query, Previous Answer, New Query, Golden Rewritten Query, and a Rewritten New Query for evaluation.
2. **Initial Setup**: Begin by reviewing the Previous Query and its corresponding Previous Answer to understand the context. Then, introduce the New Query that requires transformation.
3. **Golden Rewritten Query**: Examine the Golden Rewritten Query, which serves as the correct reference for adding context to the New Query based on the entities from the Previous Query and Previous Answer, if necessary. Ensure that the Golden Rewritten Query is fully correct and comprehensive.
4. **Evaluation Criteria**: Evaluate the Rewritten New Query based on the following criteria:
   - Output {{"Grade": "1"}} if the Rewritten New Query matches the Golden Rewritten Query in terms of entities and intents and with there Previous Answer.
   - Output {{"Grade": "0"}} if the Rewritten New Query contains additional information not present in the Golden Rewritten Query.
   - Output {{"Grade": "0"}} if the Rewritten New Query is missing information that is present in the Golden Rewritten Query.
5. **Output Format**: Format your evaluation output strictly as {{"Grade": "evaluated grade"}} to ensure clarity and consistency in assessment.

Input:
Previous Query: What is the SSI for Best Buy?
Previous Answer: The Supplier Stability Index (SSI) for Best Buy is 10. This indicates that Best Buy has a high likelihood of experiencing significant financial or operational instability over the next 3 months. This could manifest as the company ceasing operations, seeking legal relief from creditors, going into receivership or reorganization, making arrangements for the benefit of creditors, or becoming inactive due to merger or acquisition related activity.
New Query: Do they have any government indicators?
Golden Rewritten Query: Does Best Buy have any government indicators?
Rewritten New Query: Does Best Buy have any government indicators?

Output:
{{"Grade": "1"}}

Input:
Previous Query: What is the website for Adobe?
Previous Answer: The website for Adobe is www.adobe.com.
New query: What is the SSI for Pfizer?
Golden Rewritten Query: What is the SSI for Pfizer?
Rewritten New Query: What is the website for Pfizer?

Output:
{{"Grade": "0"}}

Input:
Previous Query: Who are IBM's competitors?
Previous Answer: IBM's competitors are: Hewlett Packard Enterprise Company with 62,008 employees, sales revenue of 29,135,000,000 USD and issued share capital amount of 18,277.155 USD. Microsoft Corporation with 221,000 employees, sales revenue of 211,915,000,000 USD and issued share capital amount of 181,744.7895 USD. ACCENTURE PUBLIC LIMITED COMPANY with unspecified number of employees, sales revenue and issued share capital amount.
New query: What is Apple's ESG score?
Golden Rewritten Query: What is Apple's ESG score?
Rewritten New Query: What is Apple's ESG score?

Output:
{{"Grade": "1"}}

Input:
Previous Query: Tell me about IBM
Previous Answer: International Business Machines Corporation, also known as IBM, is a publicly traded company with its headquarters located in Armonk, New York, United States. The company was established in 1911. IBM's primary industry code is US SIC V4 3571, which stands for Mfg electronic computers. The headquarters occupies approximately 18,300 square feet. IBM has a workforce of 290,900 employees consolidated and 850 employees at the headquarters. The company's website address is www.ibm.com, and their telephone number is (914) 499-1900. IBM's registration numbers include a Federal Taxpayer Identification Number (US) - 13-0871985 and a Business Registration Number (US) - 30059. They are registered as the parent or headquarters in the family tree roles played.
New Query: What about Microsoft?
Golden Rewritten Query: Tell me about Microsoft
Rewritten New Query: What about Microsoft?

Output:
{{"Grade": "0"}}

Input:
Previous Query: What is the ssi score for 060704780?
Previous Answer: The Supplier Stability Index (SSI) for Apple Inc. (D-U-N-S® number 060704780) is 1. This score is a numeric value between 0 and 10 that succinctly expresses the likelihood of risk by specifying in which risk group this organization belongs. 0 being the lowest risk level, 10 the highest. In other words, it specifies where this organization falls in a statistical distribution of all businesses (e.g., a bell curve, a half-normal distribution). The insight level for this data is robust prediction. The score date is July 8, 2024.
The score commentary provides additional context:
Proportion of trade payment experiences that have a negative payment comment
D&B composite credit appraisal rating is fair or limited
The number of enquiries suggests potential higher risk
Business belongs to an industry with above average risk of ceasing operations or becoming inactive
Ranks within the lower third of the businesses in the global supply base for risk of ceasing operations or filing for bankruptcy
Ranks within the lower third of the businesses in the same country for risk of ceasing operations or filing for bankruptcy
Ranks within the lower third of the businesses in the same primary industry in the US for risk of ceasing operations or filing for bankruptcy
The data depth for this assessment is financials with trade.
New Query: What about Microsoft?
Golden Rewritten Query: What is the SSI score for Microsoft?
Rewritten New Query: What about Microsoft?

Output:
{{"Grade": "0"}}

Input:
Previous Query: What is the paydex and ser for 12-081-4733
Previous Answer: For the company with D-U-N-S¬Æ number 120814733, also known as OLD BREWERY TAVERN, the Paydex Score is not available as the summary object in the businessTrading section is empty. The Supplier Evaluation Risk (SER) Score is 8. This score is a predictor of the likelihood that the risk defined by the Score Model Code will occur. It is based on a scale of 1 to 9, where 1 represents the lowest risk level and 9 represents the highest risk level. The score date for this SER Score is November 28, 2022. The SER Score is derived from the Failure Score. The description for the SER Score indicates that there are limited payment experiences reported, limited business activity signals reported in the past 12 months, limited time in business, and the business belongs to an industry with above average risk of ceasing operations or becoming inactive.
New Query: is duns 82-690-7354 out of business
Golden Rewritten Query: is duns 82-690-7354 out of business
Rewritten New Query: Is the company with D-U-N-S number 82-690-7354 out of business?

Output:
{{"Grade": "1"}}

Input:
Previous Query: {prompt_parameter_1}
Previous Answer: {prompt_parameter_2}
New Query: {prompt_parameter_3}
Golden Rewritten Query: {prompt_parameter_4}
Rewritten New Query: {prompt_parameter_5}

Output:
"""

def batch_llm_multi_turn_eval(model_id, input_data):
    # watsonx.ai credentials for llm judge

    # instantiate wml connection
    wml_credentials = {
        "url": config['WML_CRED']['wml_url'],
        "apikey": config['WML_CRED']['api_key']
    }

    project_id = config['WML_CRED']['project_id']

    llm_model_id = model_id

    # llm parameters
    generate_parameters_1 = {
        "decoding_method": "greedy",
        "min_new_tokens": 1,
        "max_new_tokens": 10,
        "repetition_penalty": 1,
        "stop_sequences": ['}']
    }

    platform = config['WML_CRED']['wml_platform']
    if platform == "saas":
        # instatiate llm
        llm_model = WatsonxLLM(apikey=wml_credentials['apikey'],
                                url=wml_credentials['url'],
                                project_id=project_id,
                                model_id=llm_model_id,
                                params=generate_parameters_1)
    elif platform == "onpremise":
        wml_user = config['WML_CRED']['wml_user']
        llm_model = WatsonxLLM(apikey=wml_credentials['apikey'],
                            url=wml_credentials['url'],
                            model_id=llm_model_id,
                            username=wml_user,
                            instance_id='openshift',
                            project_id=project_id,
                            version="5.0",
                            params=generate_parameters_1)
    else:
        raise Exception("Please set a correct value in config.ini [WML_CRED][wml_platform], correct values are `onpremise` or `saas` ")

    input_data['Grade'] = None

    for index, row in input_data.iterrows():
        input_variables = ['prompt_parameter_1', 'prompt_parameter_2', 'prompt_parameter_3', 'prompt_parameter_4', 'prompt_parameter_5']
        prompt = PromptTemplate(input_variables=input_variables, template=MULTI_TURN_JUDGE_PROMPT)
        llm_chain = prompt | llm_model
        # create invoke parameter which is a dictionary of your prompt parameters
        try:
            prompt_data = {'prompt_parameter_1': row['previous_question'],
                        'prompt_parameter_2': row['previous_answer'],
                        'prompt_parameter_3': row['current_question'],
                        'prompt_parameter_4': row['golden_rewritten_question'],
                        'prompt_parameter_5': row['rewritten_question']}
        except KeyError as e:
            print(f"Error: Missing required column - {e}")
            print("Input file requires the following columns:")
            print("1) previous_question")
            print("2) previous_answer")
            print("3) current_question")
            print("4) golden_rewritten_question")
            print("5) rewritten_question")
            sys.exit(1)

        try:
            prompt_results = json.loads(llm_chain.invoke(prompt_data))
        except:
            prompt_results = 'Error generating results'
        
        if prompt_results == 'Error generating results':
                input_data.at[index,'Grade'] = 'Error'
        else:
            input_data.at[index,'Grade'] = int(prompt_results['Grade'])

        input_string = f"Previous Question: {prompt_data['prompt_parameter_1']}\n\nPrevious Answer: {prompt_data['prompt_parameter_2']}\n\nCurrent Question: {prompt_data['prompt_parameter_3']}\n\nGolden Rewritten Question: {prompt_data['prompt_parameter_4']}\n\nRewritten Question: {prompt_data['prompt_parameter_5']}"
        print(f'-------------testing input {index + 1}-------------\n')
        print(f'1) Input:\n\n{input_string}\n\n')
        print(f'2) Output:\n\n{prompt_results}\n\n')
    return input_data