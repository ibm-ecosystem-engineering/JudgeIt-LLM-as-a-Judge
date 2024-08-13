from answer_similarity_llm import build_prompt_response_sim_answer
from query_rating_llm import build_prompt_response_rating_question
from wml_setup import send_to_watsonxai
from query_rewrite_and_classification_llm import query_rewrite_and_classification ,query_rewrite_and_classification_batch
import pandas as pd
import json
import re

def batch_processing_rating(data_df,question_col_name,golden_answer_col_name,respone_col_name,output_rating_col_name,output_feedback_col_name,model):
    # Iterate over each row in the DataFrame
    for index, row in data_df.iterrows():
        print(index)
        question = row[question_col_name]
        golden_answer = row[golden_answer_col_name]
        response_1 = row[respone_col_name]
        
        # Build the LLM input prompt
        llm_input = build_prompt_response_rating_question(question, golden_answer, response_1, model)
        
        try:
            llm_response = send_to_watsonxai(llm_input, model)
            print(llm_response)

            # Extract the JSON part using regex
            # Replace escaped backslashes
            llm_response = llm_response.replace("\\_", "_")
            match = re.search(r'\{.*\}', llm_response, re.DOTALL)

            if match:
                valid_json_data = match.group(0)
                # Parse the JSON string into a Python dictionary
                data = json.loads(valid_json_data.strip())
                    
                # Access the values
                rating = data["Rating"]
                feedback = data["Feedback"]
                    
                # Print the values
                print(f"Rating: {rating}")
                print(f"Feedback: {feedback}")
            else:#
                rating = None
                feedback = "Error"

        except Exception as e:
            print(f"Error processing question: {question}. Error: {str(e)}")
            rating = None
            feedback = "Error"

        # Update the DataFrame with the extracted values
        data_df.loc[index,output_rating_col_name] = rating
        data_df.loc[index,output_feedback_col_name] = feedback
    return data_df

def batch_processing_sim_answer(data_df,question_col_name,golden_answer_col_name,respone_col_name,output_rating_col_name,output_feedback_col_name,model):
    # Iterate over each row in the DataFrame
    for index, row in data_df.iterrows():
        question = row[question_col_name]
        golden_answer = row[golden_answer_col_name]
        response_1 = row[respone_col_name]
        
        ## build the llm input for sim
        llm_input = build_prompt_response_sim_answer(question, golden_answer, response_1, model)
        
        try:
            llm_response = send_to_watsonxai(llm_input, model)
            print(llm_response)

            llm_response = llm_response.replace("\\_", "_")
            match = re.search(r'\{.*\}', llm_response, re.DOTALL)

            if match:
                valid_json_data = match.group(0)
                # Parse the JSON string into a Python dictionary
                data = json.loads(valid_json_data.strip())
                    
                # Access the values
                rating = data["Change"]
                feedback = data["Feedback"]
                    
                # Print the values
                print(f"Rating: {rating}")
                print(f"Feedback: {feedback}")
            else:
                rating = None
                feedback = "Error"
        except Exception as e:
            print(f"Error processing question: {question}. Error: {str(e)}")
            rating = None
            feedback = "Error"

        # Update the DataFrame with the extracted values
        data_df.loc[index,output_rating_col_name] = rating
        data_df.loc[index,output_feedback_col_name] = feedback
    return data_df

def simple_processing_rating(question,golden_answer,response_1,model):
     # Build the LLM input prompt
    llm_input = build_prompt_response_rating_question(question, golden_answer, response_1, model)
    try:
            llm_response = send_to_watsonxai(llm_input, model)
            # Replace escaped backslashes
            print(llm_response)
            corrected_string = llm_response.replace("\\_", "_")
            json_response = json.loads(corrected_string)
            rating=json_response['Rating']
            feedback =json_response['Feedback']
    except Exception as e:
            print(f"Error processing question: {question}. Error: {str(e)}")
            rating = None
            feedback = "Error"
    return rating,feedback


def simple_processing_sim_answer(question,golden_answer,response_1,model):
     # Build the LLM input prompt
    llm_input = build_prompt_response_sim_answer(question, golden_answer, response_1, model)
    try:
            llm_response = send_to_watsonxai(llm_input, model)
            print(llm_response)
            # Replace escaped backslashes
            llm_response = llm_response.replace("\\_", "_")
            match = re.search(r'\{.*\}', llm_response, re.DOTALL)
            if match:
                valid_json_data = match.group(0)
                # Parse the JSON string into a Python dictionary
                data = json.loads(valid_json_data.strip())
                    
                # Access the values
                rating = data["Change"]
                feedback = data["Feedback"]
                    
                # Print the values
                print(f"Rating: {rating}")
                print(f"Feedback: {feedback}")
            else:
                rating = None
                feedback = "Error"
    except Exception as e:
            print(f"Error processing question: {question}. Error: {str(e)}")
            rating = None
            feedback = "Error"
    return rating,feedback


def read_data(file_name):
    ## Read the data for btach processing 
    data_df = pd.DataFrame()
    if '.xlsx' in file_name:
        data_df = pd.read_excel(file_name)
    elif '.csv' in file_name:
        data_df =pd.read_csv(file_name)
    return data_df

def write_data(data_df,output_file_name):
    ## save the output
    if '.xlsx' in output_file_name:
        data_df.to_excel(output_file_name)
    elif '.csv' in output_file_name:
        data_df.to_csv(output_file_name)
    print("file save")

def processing_batch(case,file_name,output_file_name,question_col_name,golden_answer_col_name,respone_col_name,output_rating_col_name,output_feedback_col_name,model):
      if case == 'rating':
          data_df = read_data(file_name)
          data_df = batch_processing_rating(data_df,question_col_name,golden_answer_col_name,respone_col_name,output_rating_col_name,output_feedback_col_name,model)
          write_data(data_df,output_file_name)
      elif case == 'similarity':
          data_df = read_data(file_name)
          data_df = batch_processing_sim_answer(data_df,question_col_name,golden_answer_col_name,respone_col_name,output_rating_col_name,output_feedback_col_name,model)
          write_data(data_df,output_file_name)
       
def processing(case,question,golden_answer,response_1,model):
        if case == 'rating':
          rating,feedback = simple_processing_rating(question,golden_answer,response_1,model)
          print("rating----",rating)
          print("feedback---",feedback)
        elif case == 'similarity':
          change,feedback = simple_processing_sim_answer(question,golden_answer,response_1,model)
          print("change----",change)
          print("feedback---",feedback)

# case options = similarity/rating
case = 'similarity'
question = "how to prevent loops in switching enviroment?"
golden_answer = "To prevent loops in a switching environment with Juniper Networks, you can use several features and techniques. Here are some of them 1. Spanning Tree Protocol (STP) STP is a standard protocol that helps prevent loops in a Layer 2 network. Juniper Networks devices support multiple variants of STP, including Rapid Spanning Tree Protocol (RSTP) and Multiple Spanning Tree Protocol (MSTP). You can configure STP to block redundant paths and prevent loops. 2. Loop Prevention Protocol (LPP) LPP is a proprietary protocol developed by Juniper Networks to prevent loops in a network. LPP uses a combination of techniques, including hold-down timers, flood guards, and message aging, to prevent the propagation of invalid or duplicate MAC addresses. 3. Link Aggregation Control Protocol (LACP) LACP is a protocol that allows you to bundle multiple physical links into a single logical link. LACP can help prevent loops by ensuring that all links in the bundle are used in a consistent and predictable manner. 4. Virtual Chassis (VC) VC is a feature that allows you to combine multiple Juniper Networks devices into a single logical device. VC can help prevent loops by ensuring that all devices in the virtual chassis are configured consistently and that traffic is forwarded in a predictable manner. 5. Ingress Replication: Ingress Replication is a feature that allows you to replicate incoming traffic to multiple destinations. Ingress Replication can help prevent loops by ensuring that traffic is forwarded in a predictable and controlled manner. 6. Unicast Reverse Path Forwarding (uRPF): uRPF is a feature that helps prevent IP address spoofing and other types of network attacks. uRPF can also help prevent loops by ensuring that traffic is forwarded in a predictable and controlled manner. To implement these features and techniques, you should follow Juniper Networks best practices for loop prevention and consult the relevant Juniper Networks documentation."
response_1 = "To prevent loops in a switching environment, you can use the following methods: - Enable MAC pinning on an interface in a bridge domain or VPLS domain to prevent MAC addresses from being re-learned on any other interface in the same bridge domain or VPLS domain until the MAC address either ages out on the first interface or is cleared from the MAC table. - Configure Rapid Spanning Tree Protocol (RSTP) to prevent loops in Layer 2 networks, resulting in shorter convergence times than those provided by basic Spanning Tree Protocol (STP). - Use duplicate MAC address loop detection to detect and resolve loops within the same broadcast domain in an EVPN fabric or between EVPN fabrics."
model = "LLAMA3"

#processing(case,question,golden_answer,response_1,model)

## Batch
file_name = "/Users/abhilashamangal/Documents/GitHub/LLM-JUDGE/data/input/MistAI POC Mist_questions_IBM Watsonx POC 5.0_with_4.8_thumbsup-2.xlsx"
question_col_name = "Question"
golden_answer_col_name = "WatsonX Rag (c)_Answer"
respone_col_name =  "V4_Dense_Answer"
model = "LLAMA3"
output_rating_col_name = "Rating"
output_feedback_col_name = "Feedback"
output_file_name = "/Users/abhilashamangal/Documents/GitHub/LLM-JUDGE/data/output/MistAI POC Mist_questions_IBM Watsonx POC 5.0_with_4.8_thumbsup-2_with_similarity.xlsx"

#processing_batch(case,file_name,output_file_name,question_col_name,golden_answer_col_name,respone_col_name,output_rating_col_name,output_feedback_col_name,model)

## for Batch rewrite process
multi_turn_file_name = '/Users/abhilashamangal/Documents/GitHub/LLM-JUDGE/data/input/dnb_multiturn_eval_dataset.csv'
previous_question_col_name = 'previous_question'
previous_answer_col_name = 'previous_answer'
current_question_col_name = 'current_question'
gold_label_col_name = 'Standalone_Status'
gold_rewrite_col_name = 'query_rewritten'
output_folder = '/Users/abhilashamangal/Documents/GitHub/LLM-JUDGE/data/output/'
data_df = read_data(multi_turn_file_name)
#query_rewrite_and_classification_batch(data_df,model,output_folder,previous_question_col_name,previous_answer_col_name,current_question_col_name,gold_label_col_name,gold_rewrite_col_name)

## simple query rewrite
previous_question ='Tell me about 241458061'
previous_answer ='''Supplier 241458061 is Ben and Jerry's Ice Cream Inc., located in Kingston, Ontario, Canada with the postal code K7M 7H4. Their primary industry code is US SIC V4 5451, which stands for Retail Dairy Products. The company is privately owned and has 5 employees, according to the consolidated and individual scopes. Their telephone number is 613-389-5412, and they have no former primary names or trade style names. Their industry codes include NAICS Canada 2022 Version 1.0 445298 (All Other Specialty Food Retailers), D&B Standard Industry Code 54519903 (Ice Cream (Packaged)), NACE Revision 2 4729 (Other Retail Sale of Food in Specialised Stores), US Standard Industry Code 1987 - 4 digit 5451 (Retail Dairy Products), D&B Hoovers Industry Classification 73 (Grocery Stores), NAICS Canada 2022 Version 1.0 445298 (All Other Specialty Food Retailers), Canada Standard Industry Code 1977 54510004 (Retails Ice Cream (Packaged)), D&B Standard Major Industry Code G (Retail Sale), and ISIC Revision 4 4721 (Retail Sale of Food in Specialised Stores)'''
current_question ='Where is Baidu, Inc. headquartered?'
gold_label ='Standalone'
gold_rewrite ='Where is Baidu, Inc. headquartered?'
#query_rewrite_and_classification(model,previous_question,previous_answer,current_question,gold_label,gold_rewrite)
