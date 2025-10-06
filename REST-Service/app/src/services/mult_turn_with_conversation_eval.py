import json
import requests, sys
from nltk.translate.bleu_score import sentence_bleu
from rouge import Rouge
from sklearn.metrics import accuracy_score
from langchain_core.prompts import PromptTemplate

from app.src.services.WatsonXService import WatsonXService

LLM_JUDGE_PROMPT = """Follow these below structured steps to accurately assess query transformations and ensure alignment with provided criteria.
1. **Role and Task**: Assume the role of an impartial assistant and judge. Your task is to evaluate query transformations using the provided information. You will receive a Conversation History, New Query, Golden Rewritten Query, and a Rewritten New Query for evaluation.
2. **Initial Setup**: Begin by reviewing the Conversation History to understand the context. Then, introduce the New Query that requires transformation.
3. **Golden Rewritten Query**: Examine the Golden Rewritten Query, which serves as the correct reference for adding context to the New Query based on the entities from the Conversation History, if necessary. Ensure that the Golden Rewritten Query is fully correct and comprehensive.
4. **Evaluation Criteria**: Evaluate the Rewritten New Query based on the following criteria:
   - Output {{"Grade": "1"}} if the Rewritten New Query matches the Golden Rewritten Query in terms of entities and intents and with the Conversation History.
   - Output {{"Grade": "0"}} if the Rewritten New Query contains additional information not present in the Golden Rewritten Query.
   - Output {{"Grade": "0"}} if the Rewritten New Query is missing information that is present in the Golden Rewritten Query.
5. **Output Format**: Format your evaluation output strictly as {{"Grade": "evaluated grade"}} to ensure clarity and consistency in assessment.

Input:
[Conversation History]:
User: What is an action in watsonx Assistant?
Agent: An action in watsonx Assistant is a task that the assistant helps the user with, consisting of a series of steps that represent individual exchanges with the user. It's essentially the building block of a conversation that the assistant has with the user. 
[New Query]: How to create one?
[Golden Rewritten Query]: How to create an action in watsonx Assistant?
[Rewritten New Query]: How to create an action in watsonx Assistant?
Output:
{{"Grade": "1"}}

Input:
[Conversation History]:
User: What is an action?
Agent: I'm afraid I don't understand. Please rephrase your question. 
[New Query]: What is a skill?
[Golden Rewritten Query]: What is a skill?
[Rewritten New Query]: What is the difference between a skill and an action?
Output:
{{"Grade": "0"}}

Input:
[Conversation History]:
User: How to integrate my assistant with SMS?
Agent: To integrate your assistant with SMS, you need to set up the SMS integration. This involves providing your SMS provider's authentication token information, which serves as your API access credentials. Once the integration is set up, your assistant can exchange messages with your customers. The Short Messaging Service (SMS) supports text-only messages, while the Multimedia Messaging Service (MMS) supports sending images and text messages that are over 160 characters in length. When you create a phone number with Twilio, MMS message support is included automatically. 
[New query]: I want to use Twilio.
[Golden Rewritten Query]: How to integrate my assistant with Twilio SMS?
[Rewritten New Query]: How Twilio is used to integrate assistant with SMS?
Output:
{{"Grade": "1"}}

Input:
[Conversation History]:
User: What is an action in watsonx Assistant?
Agent: An action in watsonx Assistant is a task that the assistant helps the user with, consisting of a series of steps that represent individual exchanges with the user. It's essentially the building block of a conversation that the assistant has with the user. 
User: How to create one?
Agent: To create an action in watsonx Assistant, you need to follow these steps: 1. Go to Home > Actions > Editor. 2. In Assistant says, type the response that you want to display for the user input that starts the action. 3. Click Define customer response and select Free text. 4. Click Add examples icon, which opens an 'Examples' window. 5. In the 'Examples' window, type any customer relevant topic in Customer says and give a variable name in Variable value. 6. Click Apply to save your changes. 7. You can add only three examples in the 'Examples' window. 8. After defining the customer response and adding examples, click Save to create the action. Note: You don't need to specify an example of typical user input that starts the action initially. You can add more examples later. 
[New Query]: What if I want to add more than three examples?
[Golden Rewritten Query]: How can I add more than three examples when creating an action in watsonx Assistant?
[Rewritten New Query]: How can I add more than three examples when creating an action in watsonx Assistant?
Output:
{{"Grade": "0"}}

Input:
[Conversation History]:
User: Who are IBM's competitors?
Agent: IBM's competitors are: Hewlett Packard Enterprise Company with 62,008 employees, sales revenue of 29,135,000,000 USD and issued share capital amount of 18,277.155 USD. Microsoft Corporation with 221,000 employees, sales revenue of 211,915,000,000 USD and issued share capital amount of 181,744.7895 USD. ACCENTURE PUBLIC LIMITED COMPANY with unspecified number of employees, sales revenue and issued share capital amount.
[New query]: What is Apple's ESG score?
[Golden Rewritten Query]: What is Apple's ESG score?
[Rewritten New Query]: What is Apple's ESG score?
Output:
{{"Grade": "1"}}

Input:
[Conversation History]:
User: Tell me about IBM
Agent: International Business Machines Corporation, also known as IBM, is a publicly traded company with its headquarters located in Armonk, New York, United States. The company was established in 1911. IBM's primary industry code is US SIC V4 3571, which stands for Mfg electronic computers. The headquarters occupies approximately 18,300 square feet. IBM has a workforce of 290,900 employees consolidated and 850 employees at the headquarters. The company's website address is www.ibm.com, and their telephone number is (914) 499-1900. IBM's registration numbers include a Federal Taxpayer Identification Number (US) - 13-0871985 and a Business Registration Number (US) - 30059. They are registered as the parent or headquarters in the family tree roles played.
[New Query]: What about Microsoft?
[Golden Rewritten Query]: Tell me about Microsoft
[Rewritten New Query]: What about Microsoft?
Output:
{{"Grade": "0"}}

Input:
[Conversation History]:
{prompt_parameter_1}
[New Query]: {prompt_parameter_2}
[Golden Rewritten Query]: {prompt_parameter_3}
[Rewritten New Query]: {prompt_parameter_4}
[Output]:
"""

def build_multi_turn_prompt(row):
    input_variables = [
        'conversation_history', 
        'follow_up_query', 
        'golden_query', 
        'rewritten_query']
    prompt = PromptTemplate(input_variables=input_variables, template=LLM_JUDGE_PROMPT)
    # create invoke parameter which is a dictionary of your prompt parameters
    prompt_data = {'prompt_parameter_1': row['conversation_history'],
                'prompt_parameter_2': row['follow_up_query'],
                'prompt_parameter_3': row['golden_query'],
                'prompt_parameter_4': row['rewritten_query']}
    
    return prompt, prompt_data