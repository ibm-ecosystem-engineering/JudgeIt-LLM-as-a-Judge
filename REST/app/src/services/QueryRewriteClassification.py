import json
import requests, sys
from nltk.translate.bleu_score import sentence_bleu
from rouge import Rouge
from sklearn.metrics import accuracy_score

from app.src.services.WatsonXService import WatsonXService

def compute_bleu(reference_list, candidate_list):
    total_bleu_score = 0.0
    for reference, candidate in zip(reference_list, candidate_list):
        bleu_score = sentence_bleu([reference], candidate)
        total_bleu_score += bleu_score
    return total_bleu_score / len(reference_list)

def compute_rouge(reference_list, candidate_list):
    rouge = Rouge()
    # total_rouge_score = {"rouge-1": 0.0, "rouge-2": 0.0, "rouge-l": 0.0}
    total_rouge_score = {"rouge-l": 0.0}

    for reference, candidate in zip(reference_list, candidate_list):
        rouge_scores = rouge.get_scores(candidate, reference)
        for metric in total_rouge_score.keys():
            total_rouge_score[metric] += rouge_scores[0][metric]["f"]
    avg_rouge_score = {metric: score / len(reference_list) for metric, score in total_rouge_score.items()}
    return avg_rouge_score


prompt_rewriting = """[INST]
Given the following conversation history please reword the final utterance from the user into an single utterance that doesn't need the history to understand the user's intent. If the final utterance is a clear and standalone question, just RETURN THE FINAL UTTERANCE. Output in proper json format.
[/INST]

Final utterance:
What about Microsoft?
Previous utterance:
What is their Paydex score?
Output:
{"reasoning": "The last utterance is related to the previous one but about a different a company", "class":"non-standalone", "reworded_version": "What is Microsoft's Paydex score?"}

Final utterance:
Are there any Public Filings tied to this supplier?
Previous utterance:
Can you provide insights into the financial stability and health of TD SYNNEX?
Output:
{"reasoning": "The last utterance is about the same company but with different intent", "class":"non-standalone", "reworded_version": "Are there any Public Filings tied to TD SYNNEX?"}

Final utterance:
Is 2 a good score
Previous utterance:
What is the ESG score
Output:
{"reasoning": "The last utterance is a follow up question to the previous one", "class":"non-standalone", "reworded_version": "Is 2 a good ESG score?"}

Final utterance:
Which filing period does that data relate to?
Previous utterance:
Can you show Walmart's detailed balance sheet?
Output:
{"reasoning": "The last utterance is a follow up question to the previous one", "class":"non-standalone", "reworded_version": "Which filing period does the balance sheet for Walmart relate to?"}

Final utterance:
What about for UPS?
Previous utterance:
What is the geographical coverage for DHL?
Output:
{"reasoning": "The last utterance is related to the previous one but about a different a company", "reworded_version": "What is the geographical coverage for UPS?"}

Final utterance:
How does it compare to NVIDIA's
Previous utterance:
What is the ESG score for Intel?
Output:
{"reasoning": "The last utterance is related to the previous one about comparison", "class":"non-standalone", "reworded_version": "How does Intel's ESG score compare to NVIDIA's?"}

Final utterance:
How about for 00-699-7142?
Previous utterance:
ESG report for Home Depot
Output:
{"reasoning": "The last utterance is related to the previous one but about a different a company", "class":"non-standalone", "reworded_version": "ESG report for 00-699-7142?"}

Final utterance:
How has Delta Airlines been performing financially for past 5 years?
Previous utterance:
Does company has any known suppliers under sanctions?
Output:
{"reasoning": "The last utterance is a clear and standalone question therefore just return it", "class":"standalone", "reworded_version": "How has Delta Airlines been performing financially for past 5 years?"}

Final utterance:
Is 1 TRADE FWDNG INC a diverse supplier?
Previous utterance:
What is Cyber risk score? How do calculate it?
Output:
{"reasoning": "The last utterance is a clear and standalone question therefore just return it", "class":"standalone", "reworded_version": "Is 1 TRADE FWDNG INC a diverse supplier?"}

Final utterance:
Tell me about  001326495
Previous utterance:
List out all UBO's tied to Pfizer inc
Output:
{"reasoning": "The last utterance is a clear and standalone question therefore just return it", "class":"standalone", "reworded_version": "Tell me about  001326495"}

Final utterance:
Are there any OSHA violations reported?
Previous utterance:
How long has McDonalds been operating
Output:
{"reasoning": "The last utterance is about the same company but with different intent", "class":"non-standalone", "reworded_version": "Are there any OSHA violations reported for McDonalds?"}

Final utterance:
from Jacksonville
Previous utterance:
What is the HQ address for D&B?
Output:
{"reasoning": "The last utterance is a follow up question to the previous one", "class":"non-standalone", "reworded_version": "What is the HQ address for D&B from Jacksonville?"}

Final utterance:
Location of Coca-Cola
Previous utterance:
Name CocaCola's Competitors
Output:
{"reasoning": "The last utterance is a clear and standalone question therefore just return it", "class":"standalone", "reworded_version": "Location of Coca-Cola"}

Final utterance:
Flag the major risks with CVS Health in Rhode Island?
Previous utterance:
Who are the top UBOs for them?
Output:
{"reasoning": "The last utterance is a clear and standalone question therefore just return it", "class":"standalone", "reworded_version": "Flag the major risks with CVS Health in Rhode Island?"}

Final utterance:
What information about the IBM financial situation you can provide?
Previous utterance:
what else can you tell me about IBM ?
Output:
{"reasoning": "The last utterance is a clear and standalone question therefore just return it", "class":"standalone", "reworded_version": "What information about the IBM financial situation you can provide?"}

Final utterance:
Does company has any known suppliers under sanctions?
Previous utterance:
what is the SSI for Bristol-Myers Squibb Company
Output:
{"reasoning": "The last utterance is about the same company but with different intent", "class":"non-standalone", "reworded_version": "Does Bristol-Myers Squibb Company has any known suppliers under sanctions?"}

Final utterance:
{{current_question}}
Previous utterance:
{{previous_question}}
Output:
"""

prompt_with_agent_turn = """Given the following conversation, please reword the final utterance from the user into an single utterance that doesn't need the history to understand the user's intent. If the final utterance is a clear and standalone question, just RETURN THE FINAL UTTERANCE. Output in proper json format indicating the class (standalone or nonstandalone) and the reworded version of the last utterance.

Here are some examples:

#Example 1
User: How may some sections of a document in Discovery be deleted and replaced with new content?
Agent response: To delete and replace some sections of a document in Discovery, you can update the segmented document using the Update document method. First, you need to upload the updated document using the POST method of the /environments/{environment_id}/collections/{collection_id}/documents/{document\\_id} API, specifying the contents of the parent\\_id field of one of the current segments as the {document\\_id} path variable. When updating, all segments are overwritten, unless the updated version of the document has fewer total sections than the original. In this case, the older segments will remain in the index and might be individually deleted using the API. Keep in mind that if any of the segments of the document you intend to update are ranked for relevancy training, you must first delete all the segments of that document and then ingest the updated document as a new document. This results in a new document\\_id for each segment and any trained segments must be retrained.
User: How do I know how many segments were created in that process?
ASSISTANT: {"reasoning": "The last user utterance is not standalone, and refers to a process explained in the previous agent response", "class": "non-standalone", "reworded version": "How do I know how many segments were created while updating a segmented document in Discovery?"}

#Example 2
User: How may some sections of a document in Discovery be deleted and replaced with new content?"
Agent response: To delete and replace some sections of a document in Discovery, you can update the segmented document using the Update document method. First, you need to upload the updated document using the POST method of the /environments/{environment_id}/collections/{collection_id}/documents/{document\\_id} API, specifying the contents of the parent\\_id field of one of the current segments as the {document\\_id} path variable. When updating, all segments are overwritten, unless the updated version of the document has fewer total sections than the original. In this case, the older segments will remain in the index and might be individually deleted using the API. Keep in mind that if any of the segments of the document you intend to update are ranked for relevancy training, you must first delete all the segments of that document and then ingest the updated document as a new document. This results in a new document\\_id for each segment and any trained segments must be retrained.
User: How do I know how many segments were created while updating a segmented document in Discovery?
ASSISTANT: {"reasoning": "The last user utterance is a clear and standalone question therefore just return it", "class": "standalone", "reworded version": How do I know how many segments were created while updating a segmented document in Discovery?"}

#Example 3
User: What is IBM Cloudant Query?
Agent response: IBM Cloudant Query is an API for querying slices of data based on the values of a database's document attributes. It is a flexible API that must be used carefully to ensure that database performance can be maintained as the data size grows over time. It is accessed through the POST /{db}/_find API endpoint where the JSON specification of the query is passed in the HTTP POST body.
User: What distinguishes this API from other methods used in these systems?
ASSISTANT: {"reasoning": "The last user utterance is not standalone and it needs context from the previous agent response to be fully understood", "class": "non-standalone", "reworded version": "What distinguishes IBM Cloudant Query from other methods used in database systems?"}

#Example 4
User: What is IBM Cloudant Query?
Agent response: IBM Cloudant Query is an API for querying slices of data based on the values of a database's document attributes. It is a flexible API that must be used carefully to ensure that database performance can be maintained as the data size grows over time. It is accessed through the POST /{db}/_find API endpoint where the JSON specification of the query is passed in the HTTP POST body.
User: What distinguishes IBM Cloudant Query from other methods used in database systems?
ASSISTANT: {"reasoning": "The last user utterance is a clear and standalone question therefore just return it", "class": "standalone", "reworded version": "What distinguishes IBM Cloudant Query from other methods used in database systems?"}

#Example 5
User: Can you guide me through the process of creating a simple dialog with an example using Watson Assistant?
Agent response: Certainly! Here's a step-by-step guide to creating a simple dialog with an example in Watson Assistant:\n\n1. **Create a new dialog skill**: From the Watson Assistant main page, click on "Create a skill" and give it a name, such as "My First Dialog Skill".\n\n2. **Add intents**: Intents represent what the user wants to do. For this example, let's add two intents: "greet" and "goodbye". To add intents, go to the "Intents" tab in your skill, click "Create new intent", and follow the prompts. For the "greet" intent, add examples like "hello", "hi", and "hey". For the "goodbye" intent, add examples like "bye", "goodbye", and "see you later".\n\n3. **Add a dialog**: Go to the "Dialog" tab in your skill. Here, you'll define the conversation flow. \n\n4. **Create a welcome node**: This node will be triggered when the user starts a conversation. Click "Create new dialog node", set the condition to "welcome", and add a response.
User: and for a creating a complex one?
ASSISTANT: {"reasoning": "The last user utterance is related to the previous user question but asking for a different type", "class": "non-standalone", "reworded version": "Can you guide me through the process of creating a complex dialog with an example using Watson Assistant?"}

#Example 6
User: Can you guide me through the process of creating a simple dialog with an example using Watson Assistant?
Agent response: Certainly! Here's a step-by-step guide to creating a simple dialog with an example in Watson Assistant:\n\n1. **Create a new dialog skill**: From the Watson Assistant main page, click on "Create a skill" and give it a name, such as "My First Dialog Skill".\n\n2. **Add intents**: Intents represent what the user wants to do. For this example, let's add two intents: "greet" and "goodbye". To add intents, go to the "Intents" tab in your skill, click "Create new intent", and follow the prompts. For the "greet" intent, add examples like "hello", "hi", and "hey". For the "goodbye" intent, add examples like "bye", "goodbye", and "see you later".\n\n3. **Add a dialog**: Go to the "Dialog" tab in your skill. Here, you'll define the conversation flow. \n\n4. **Create a welcome node**: This node will be triggered when the user starts a conversation. Click "Create new dialog node", set the condition to "welcome", and add a response.
User: Can you guide me through the process of creating a complex dialog with an example using Watson Assistant?
ASSISTANT: {"reasoning": "The last user utterance is a clear and standalone question therefore just return it", "class": "standalone", "reworded version": "Can you guide me through the process of creating a complex dialog with an example using Watson Assistant?"}

Now, answer the following:
{{conversation}}
ASSISTANT:"""


def query_rewrite_and_classification_batch(data,model,output_folder,previous_question_col_name,previous_answer_col_name,current_question_col_name,gold_label_col_name,gold_rewrite_col_name, watsonx_service: WatsonXService):
    
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
            cur_statement = watsonx_service.send_to_watsonxai_multi_turn(filled_prompt,model)
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


def query_rewrite_and_classification(model,previous_question,previous_answer,current_question,gold_label,gold_rewrite, watsonx_service: WatsonXService):
    
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
            cur_statement = watsonx_service.send_to_watsonxai_multi_turn(filled_prompt,model)
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