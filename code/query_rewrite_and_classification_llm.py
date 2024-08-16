import json
import requests, sys
from nltk.translate.bleu_score import sentence_bleu
from rouge import Rouge
from sklearn.metrics import accuracy_score
from wml_setup import send_to_watsonxai_multi_turn

# replace shots with generic info
prompt_rewriting = """[INST]
Given the following conversation history please reword the final question from the user into a single question that doesn't need the history to understand the user's intent and the company the user is referring to. The company can either be given as a company name or a nine-digit D-U-N-S (DUNS) Number. If the current question is a clear and standalone question, just RETURN THE CURRENT QUESTION. Ignore terms like "Inc" or "Corp".

[/INST]
previous_question: Tell me more about Apple
previous_answer: Apple Inc., headquartered at 1 Apple Park Way, Cupertino, CA 95014-0642, United States, is a publicly traded company with the ticker symbol NASDAQ:AAPL. It operates in the Communications Equipment Manufacturing industry under D&B Hoovers Industry Classification. The company was established in 1977 and has a primary industry code of US SIC V4 3663, which stands for Mfg radio/tv communication equipment. Apple Inc. also operates in several other industries, including Electronic Computer Manufacturing, Computer Terminal and Other Computer Peripheral Equipment Manufacturing, Audio and Video Equipment Manufacturing, and Software Publishers. As of the most recent data, Apple Inc. has approximately 161,000 employees globally and 1,310 employees at its individual locations. The company's primary address is located within the Santa Clara county in California, and it falls under the congressional district 17.
current_question: What is their Paydex score?
Reworded Input: {"reasoning": "The current question is about the same company but with different intent therefore copy current question and substitute in the previous company", "reworded_input":"What is Apple's Paydex score?"}

previous_question: What is the ESG score for Amazon?
previous_answer: The ESG score for Amazon.com, Inc. is 2 out of 5, as of June 4, 2024. This score is based on their environmental, social, and governance risk factors, with 1 being low risk and 5 being high risk.
current_question: Is 2 a good score?
Reworded Input: {"reasoning": "The current question is a follow up to the previous question and previous answer therefore combine them", "reworded_input":"Is 2 a good ESG score for Amazon?"}

previous_question: Tell me about Pfizer
previous_answer: Pfizer Inc. is a company based in New York, New York, United States with the postal code 10001-2192. It was established in 1942. The company operates in the pharmaceutical industry with the primary US SIC V4 code 2834, which stands for Mfg pharmaceutical preparations. Pfizer has 83,000 employees in total, with 2,500 of them working at the headquarters. The company's website address is www.pfizer.com and their telephone number is 8008793477. Pfizer is publicly traded with the ticker symbol NYSE:PFE on the NYSE stock exchange. They also trade on various other international exchanges. The company's primary industry is pharmaceutical preparations manufacturing. Pfizer operates in North America and is registered with several identification numbers, including a Commercial and Government Entity Code of 86491, Federal Taxpayer Identification Number (US) 13-5315170, Business Registration Number (US) 383418, and US General Services Administration Unique Entity Identifier MHBQULRMEEJ5.
current_question: Tell me more about IBM
Reworded Input: {"reasoning": "The current question is a clear and standalone question therefore just return it", "reworded_input":"Tell me more about IBM"}

previous_question: what is the cyber risk rating for snowflake?
previous_answer: The cyber risk score for Snowflake Inc. is 66. This score reflects the company's performance related to the topic of cyber risk, where 100 is the best performance and 0 is the worst performance. The score date for this information is May 7, 2024.
current_question: how about for databricks?
Reworded Input: {"reasoning": "The current question has the same intent as the previous question but with a different company therefore copy the previous question and substitute in the new company", "reworded_input":"what is the cyber risk rating for databricks?"}

previous_question: What is the ESG score for 047897855?
previous_answer: The ESG score for Intel is 2. This score is calculated based on various factors including environmental, social, and governance rankings. The lower the score, the better the ESG performance.
current_question: How does it compare to NVIDIA's
Reworded Input: {"reasoning": "The current question is a follow up to the previous question therefore combine them", "reworded_input":"How does 047897855 ESG score compare to NVIDIA's"}

previous_question: Who are Meta's competitors?
previous_answer: 1. Snap Inc. with 5,289 employees, sales revenue of $4,606,115,000, and issued share capital amount of $97,623.56. 2. Google LLC with 47,756 employees, sales revenue of $38,686,109,260, and no information on issued share capital amount. 3. Twitter, Inc. with 1,500 employees, sales revenue of $5,077,482,000, and issued share capital amount of $57,487.90. These are the competitors of Meta Platforms, Inc. according to the provided data.
current_question: Compare it with its competitors in table
Reworded Input: {"reasoning": "The current question is a follow up to the previous question and previous answer therefore combine them", "reworded_input":"Compare Meta with Snap, Google and Twitter in table"}

previous_question: what is the revenue for 003141970 in 2021?
previous_answer: For the D-U-N-S® number 003141970, which corresponds to FedEx Corporation, the financial statement for the period from May 31, 2021 to May 31, 2022 does not provide sales revenue information. Therefore, I am unable to provide the revenue for 003141970 in 2021 based on the given data.
current_question: what about 05-109-9661 in 2023
Reworded Input: {"reasoning": "The current question has the same intent as the previous question but with a different company therefore copy the previous question and substitute in the new company", "reworded_input":"what is the revenue for 05-109-9661 in 2023"}

previous_question: what's Kroger social score
previous_answer: Kroger's Social Score, as per the ESG Ranking, is 83 for the topic Social-related Certifications. This score indicates the company's performance in this area, with 100 being the best performance and 0 being the worst performance
current_question: What's their performance
Reworded Input: {"reasoning": "The current question is about the same company but with different intent therefore copy current question and substitute in the previous company", "reworded_input":" What's Kroger performance?"}

previous_question: what about Cardinal Health
previous_answer: For Cardinal Health, Inc., the Supplier Stability Index Score is 6, which indicates a moderate risk level. The Supplier Evaluation Risk Score is 4, which also indicates a moderate risk level. These scores are based on various factors including payment history, industry risk, and financial health. The data was last updated on May 24, 2024, for the Supplier Stability Index Score and on June 4, 2024, for the Supplier Evaluation Risk Score.
current_question: Compare both of them
Reworded Input: {"reasoning": "The current question is a follow up to the previous question and previous answer therefore combine them", "reworded_input":" Compare Cardinal Health and another company"}

previous_question: who is 055169452 ceo?
previous_answer: The CEO of Bank of America Corporation, which has the D-U-N-S® number 055169452, is Brian T Moynihan.
current_question: is it good?
Reworded Input: {"reasoning": "The current question is about the same company but with different intent therefore copy current question and substitute in the previous company", "reworded_input":"is 055169452 good?"}

previous_question: How many offices does 144356508 have in the US?
previous_answer: QUALCOMM Incorporated with D-U-N-S® number 144356508 has 32 branches in the United States.
current_question: how long has it been operating?
Reworded Input: {"reasoning": "The current question is about the same company but with different intent therefore copy current question and substitute in the previous company", "reworded_input":"how long has 144356508 been operating?"}

previous_question: List the subsidiaries for Nike
previous_answer: 1.Nike IHM, Inc. (D-U-N-S®: 006322655) 2.Converse Inc. (D-U-N-S®: 018105341) 3.TRIAX INSURANCE, INC. (D-U-N-S®: 024187388) 4.NIKE INTERNATIONAL, LTD. (D-U-N-S®: 054324207) 5.Nike Impact Inc. (D-U-N-S®: 068687608) 6.Nike Spiridon, Inc. (D-U-N-S®: 079260104) 7.Traceme Inc. (D-U-N-S®: 080599481) 8.Nike Magista, Inc. (D-U-N-S®: 081167278) 9.Celect, Inc. (D-U-N-S®: 082381056) 10.York64 LLC (D-U-N-S®: 117111424) 11.NIKE Amplify LLC (D-U-N-S®: 117278844) 12.NIKE Roshe, Inc. (D-U-N-S®: 117278847) 13.NIKE Terra LLC (D-U-N-S®: 117278848) 14.RTFKT Inc. (D-U-N-S®: 117666401) 15.Nike Vision, Timing And Techlab, LP (D-U-N-S®: 148224418) 16.Exeter Brands Group LLC (D-U-N-S®: 198434313) 17.Nike Air Force LP (D-U-N-S®: 204154210) 18.Nike Canada Corp (D-U-N-S®: 204255707) 19.CONVERSE FRANCE S.A.S (D-U-N-S®: 267186543) 20.CONVERSE IBERIA INC SUCURSAL EN ESPAÑA (D-U-N-S®: 513180778)
current_question: Display the full family tree for adidas
Reworded Input: {"reasoning": "The current question is a clear and standalone question therefore just return it", "reworded_input":"Display the full family tree for adidas"}

previous_question: what's the ssi score for JPMorgan Chase
previous_answer: The Supplier Stability Index (SSI) score for JPMorgan Chase & Co. is 1. This score is recorded on May 24, 2024. The SSI score predicts the likelihood that an organization will experience significant financial or operational instability over the next 3 months. A score of 1 indicates a robust prediction of stability. The SSI score is based on several factors, including the organization's financials, trade data, industry risk, country risk, and primary industry risk in the US. According to the data, JPMorgan Chase & Co. ranks within the lower third of businesses in the global supply base, the same country, and the same primary industry in the US for risk of ceasing operations or filing for bankruptcy. The number of enquiries also suggests potential higher risk. However, the organization belongs to an industry with above-average risk of ceasing operations or becoming inactive.
current_question: is it safe to do business with?
Reworded Input: {"reasoning": "The current question is about the same company but with different intent therefore copy current question and substitute in the previous company", "reworded_input":" is JPMorgan Chase safe to do business with?"}

previous_question: Display the full ubo for them
previous_answer: I'm sorry, I've run into an error processing your request. Please try the same question again.
current_question: do you have the company's SSI and SER score?
Reworded Input: {"reasoning": "There is no supplier mentioned therefore just return it", "reworded_input":"do you have the company's SSI and SER score?"}

previous_question: {{previous_question}}
previous_answer: {{previous_answer}}
current_question: {{current_question}}
Reworded Input:"""

prompt_with_agent_turn = """Given the following conversation, please reword the final utterance from the user into a single utterance that does not need the history to understand the user's intent. Output in proper json format indicating the "class" (standalone or non-standalone) and the "reworded version" of the last utterance. Use this format: {"class": "type of last utterance", "reworded version": "the last utterance rewritten into a standalone question, IF NEEDED"}. 

In your rewording of the last utterance, do not do any unnecessary rephrasing or introduction of new terms or concepts that were not mentioned in the prior part of the conversation. Be minimal, by staying as close as possible to the shape and meaning of the last user utterance. If the last user utterance is already clear and standalone, the reworded version should be exactly THE SAME as the last user utterance, and the class should be 'standalone'. 

{{conversation}}
ASSISTANT:"""

LLM_JUDGE_PROMPT = """Follow these below structured steps to accurately assess query transformations and ensure alignment with provided criteria.
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
Previous Query: {prompt_parameter_1}
Previous Answer: {prompt_parameter_2}
New Query: {prompt_parameter_3}
Golden Rewritten Query: {prompt_parameter_4}
Rewritten New Query: {prompt_parameter_5}

Output:
"""


def query_rewrite_and_classification_batch(data,model,output_folder,previous_question_col_name,previous_answer_col_name,current_question_col_name,gold_label_col_name,gold_rewrite_col_name):
    
    output = []
    all_predicted_classes = []
    all_gold_classes = []
    all_predicted_questions = []
    all_gold_questions = []
    num_failed_outputs = 0
    parsed_data = []

    for index, ex in data.iterrows():
        input = []
        print(f"Index: {index}")
        prev_question = ex[previous_question_col_name]
        answer = ex[previous_answer_col_name]
        speaker = 'User'
        agent ='Agent'
        input.append(f'{speaker}: {prev_question}')
        input.append(f'{agent}: {answer}')
        current_question = ex[current_question_col_name]
        gold_label = ex[gold_label_col_name]
        gold_rewording = ex[gold_rewrite_col_name]
        
        non_standalone_input = input +[f"User: " + current_question]

        parsed_data.append(
            (current_question, prev_question, gold_label, gold_rewording, non_standalone_input)
        )
        
    failed_examples = []
    print('parsed_data',len(parsed_data))
    for (current_question, prev_question, gold_label, gold_rewording, input) in parsed_data:
        
        filled_prompt = prompt_with_agent_turn.replace('{{conversation}}', '\n'.join(input))
        print('conversation:\n', '\n'.join(input))
        # print(filled_prompt)
        #TODO: compute ROUGE & BELU on standalone only, check if no unneccessary rewriting is done
        #TODO: agent response (agent response)?
        #TODO: fine tuning with part of the data (80/20 randomized)
        try:
            cur_statement = send_to_watsonxai_multi_turn(filled_prompt,model)
            print(cur_statement)
            if "reworded_version" in json.loads(cur_statement):
                rewritten_question = json.loads(cur_statement)['reworded_version']
            else:
                rewritten_question = json.loads(cur_statement)['reworded version']
            classification = json.loads(cur_statement)['class']
            reasoning = json.loads(cur_statement)['reasoning']

        except:
            num_failed_outputs += 1
            # failed_examples.append()
            print('error')
            continue
        print('gold label: ', gold_label)
        print('pred label:', classification)

        print('gold question: ', gold_rewording)
        print('pred question:', rewritten_question)


        print('-'*20)
        output.append({
            'input': filled_prompt,
            'reasoning': reasoning,
            'pred_label': classification,
            'gold_label': gold_label,
            'pred_rewording': rewritten_question,
            'gold_rewording': gold_rewording,
        })
        all_predicted_classes.append(classification)
        all_gold_classes.append(gold_label)
        all_predicted_questions.append(rewritten_question)
        all_gold_questions.append(gold_rewording)

    all_gold_classes_ch =[]
    for gold in all_gold_classes:
        gold = gold.replace("Standalone","standalone")
        all_gold_classes_ch.append(gold)

    all_predicted_classes_ch =[]
    for gold in all_predicted_classes:
        gold = gold.replace("non-standalone","Not standalone")
        all_predicted_classes_ch.append(gold)


    accuracy_classification = accuracy_score(all_gold_classes_ch,all_predicted_classes_ch)

    avg_rouge_l = compute_rouge(all_gold_questions, all_predicted_questions)
    avg_bleu =compute_bleu(all_gold_questions, all_predicted_questions)

    print('accuracy_classification: ', accuracy_classification)
    print('avg_rouge_l: ', avg_rouge_l)
    print('avg_bleu: ', avg_bleu)

    output_json = {}
    output_json['predictions'] = output

    with open(f'{output_folder}Query_expansion_data_without_human_label_removeduplicate_{model.split("/")[-1]}.json', 'w') as file:
        json.dump(output_json, file, indent=4)
    output_json['metrics'] = {
        'accuracy_classification': accuracy_classification,
        'avg_rouge_l': avg_rouge_l,
        'avg_bleu': avg_bleu,
        'num_failed_outputs': num_failed_outputs,
        'total_num_examples': len(all_predicted_classes)
    }

    with open(f'{output_folder}Query_expansion_data_withoutICL_w_agent_removeduplicate_{model.split("/")[-1]}.json', 'w') as file:
        json.dump(output_json, file, indent=4)


def query_rewrite_and_classification(model,previous_question,previous_answer,current_question,gold_label,gold_rewrite):
    
    output = []
    all_predicted_classes = []
    all_gold_classes = []
    all_predicted_questions = []
    all_gold_questions = []
    num_failed_outputs = 0
    parsed_data = []

    input = []
    speaker = 'User'
    agent ='Agent'
    input.append(f'{speaker}: {previous_question}')
    input.append(f'{agent}: {previous_answer}')
    non_standalone_input = input +[f"User: " + current_question]
    parsed_data.append(
            (current_question, previous_question, gold_label, gold_rewrite, non_standalone_input)
        )
    print('parsed_data',len(parsed_data))
    for (current_question, previous_question, gold_label, gold_rewrite, input) in parsed_data:
        
        filled_prompt = prompt_with_agent_turn.replace('{{conversation}}', '\n'.join(input))
        print('conversation:\n', '\n'.join(input))
        # print(filled_prompt)
        #TODO: compute ROUGE & BELU on standalone only, check if no unneccessary rewriting is done
        #TODO: agent response (agent response)?
        #TODO: fine tuning with part of the data (80/20 randomized)
        try:
            cur_statement = send_to_watsonxai_multi_turn(filled_prompt,model)
            print(cur_statement)
            if "reworded_version" in json.loads(cur_statement):
                rewritten_question = json.loads(cur_statement)['reworded_version']
            else:
                rewritten_question = json.loads(cur_statement)['reworded version']
            classification = json.loads(cur_statement)['class']
            reasoning = json.loads(cur_statement)['reasoning']

        except:
            num_failed_outputs += 1
            # failed_examples.append()
            print('error')
            continue
        print('gold label: ', gold_label)
        print('pred label:', classification)

        print('gold question: ', gold_rewrite)
        print('pred question:', rewritten_question)


        print('-'*20)
        output.append({
            'input': filled_prompt,
            'reasoning': reasoning,
            'pred_label': classification,
            'gold_label': gold_label,
            'pred_rewording': rewritten_question,
            'gold_rewording': gold_rewrite,
        })
        all_predicted_classes.append(classification)
        all_gold_classes.append(gold_label)
        all_predicted_questions.append(rewritten_question)
        all_gold_questions.append(gold_rewrite)

    all_gold_classes_ch =[]
    for gold in all_gold_classes:
        gold = gold.replace("Standalone","standalone")
        all_gold_classes_ch.append(gold)

    all_predicted_classes_ch =[]
    for gold in all_predicted_classes:
        gold = gold.replace("non-standalone","Not standalone")
        all_predicted_classes_ch.append(gold)


    accuracy_classification = accuracy_score(all_gold_classes_ch,all_predicted_classes_ch)

    avg_rouge_l = compute_rouge(all_gold_questions, all_predicted_questions)
    avg_bleu =compute_bleu(all_gold_questions, all_predicted_questions)

    print('accuracy_classification: ', accuracy_classification)
    print('avg_rouge_l: ', avg_rouge_l)
    print('avg_bleu: ', avg_bleu)

    output_json = {}
    output_json['predictions'] = output
    output_json['metrics'] = {
        'accuracy_classification': accuracy_classification,
        'avg_rouge_l': avg_rouge_l,
        'avg_bleu': avg_bleu,
        'num_failed_outputs': num_failed_outputs,
        'total_num_examples': len(all_predicted_classes)
    }
    return output_json
