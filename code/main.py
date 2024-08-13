from answer_similarity_llm import build_prompt_response_sim_answer
from query_rating_llm import build_prompt_response_rating_question
from wml_setup import send_to_watsonxai
from query_rewrite_and_classification_llm import query_rewrite_and_classification
import pandas as pd
import json
import configparser

config = configparser.ConfigParser()
config.read('./../config.ini')

home_dir = config['Default']['home_dir']
## Setup the filename and values
question_col_name = config['Batch_porceesing']['question_col_name'] 
golden_answer_col_name = config['Batch_porceesing']['golden_answer_col_name'] 
respone_col_name = config['Batch_porceesing']['respone_col_name'] 
model = config['Batch_porceesing']['model']
output_feedback_col_name = config['Batch_porceesing']['output_feedback_col_name']
output_rating_col_name= config['Batch_porceesing']['output_rating_col_name']
output_file_name = home_dir + config['Batch_porceesing']['output_file_name']

def batch_processing_rating(data_df):
    # Iterate over each row in the DataFrame
    for index, row in data_df[0:2].iterrows():
        print(index)
        question = row[question_col_name]
        golden_answer = row[golden_answer_col_name]
        response_1 = row[respone_col_name]
        
        # Build the LLM input prompt
        llm_input = build_prompt_response_rating_question(question, golden_answer, response_1, model)
        
        try:
            llm_response = send_to_watsonxai(llm_input, model)
            print(llm_response)

            # Replace escaped backslashes
            corrected_string = llm_response.split("<JSON_END>")[0]
            corrected_string = corrected_string.replace("<JSON_STRAT>","")

            # Convert the corrected string to a JSON object
            json_response = json.loads(corrected_string)

            # Print the JSON object
            print(json.dumps(corrected_string, indent=4))
            
            # Extract values from JSON response
            rating=json_response['result']['Rating']
            feedback =json_response['result']['Feedback']   
        except Exception as e:
            print(f"Error processing question: {question}. Error: {str(e)}")
            rating = None
            feedback = "Error"

        # Update the DataFrame with the extracted values
        data_df.loc[index,output_rating_col_name] = rating
        data_df.loc[index,output_feedback_col_name] = feedback
    return data_df

def batch_processing_sim_answer(data_df):
    # Iterate over each row in the DataFrame
    for index, row in data_df[0:2].iterrows():
        print(index)
        question = row[question_col_name]
        golden_answer = row[golden_answer_col_name]
        response_1 = row[respone_col_name]
        
        ## build the llm input for sim
        llm_input = build_prompt_response_sim_answer(question, golden_answer, response_1, model)
        
        try:
            llm_response = send_to_watsonxai(llm_input, model)
            print(llm_response)

            # Replace escaped backslashes
            corrected_string = llm_response.split("<JSON_END>")[0]
            corrected_string = corrected_string.replace("<JSON_STRAT>","")

            # Convert the corrected string to a JSON object
            json_response = json.loads(corrected_string)

            # Print the JSON object
            print(json.dumps(corrected_string, indent=4))
            
            # Extract values from JSON response
            rating=json_response['result']['Change']
            feedback =json_response['result']['Feedback']
        
            
        except Exception as e:
            print(f"Error processing question: {question}. Error: {str(e)}")
            rating = None
            feedback = "Error"

        # Update the DataFrame with the extracted values
        data_df.loc[index,output_rating_col_name] = rating
        data_df.loc[index,output_feedback_col_name] = feedback
    return data_df

def simple_processing_rating():
    question = config['Simple_processing']['question'] 
    golden_answer = config['Simple_processing']['golden_answer'] 
    response_1 = config['Simple_processing']['response'] 
    model = config['Simple_processing']['model']
     # Build the LLM input prompt
    llm_input = build_prompt_response_rating_question(question, golden_answer, response_1, model)
    try:
            llm_response = send_to_watsonxai(llm_input, model)
            # Replace escaped backslashes
            corrected_string = llm_response.split("<JSON_END}")[0]
            corrected_string = corrected_string.replace("<JSON_START>","")
            if 'result' in corrected_string:
                corrected_string = corrected_string+'}'
                # Convert the corrected string to a JSON object
                json_response = json.loads(corrected_string)

                # Extract values from JSON response
                rating=json_response['result']['Rating']
                feedback =json_response['result']['Feedback']
            else:
                 # Convert the corrected string to a JSON object
                 corrected_string = corrected_string+'}'
                 json_response = json.loads(corrected_string)
                 rating=json_response['Rating']
                 feedback =json_response['Feedback']
    except Exception as e:
            print(f"Error processing question: {question}. Error: {str(e)}")
            rating = None
            feedback = "Error"
    return rating,feedback


def simple_processing_sim_answer():
    # Iterate over each row in the DataFrame
    question = config['Simple_processing']['question'] 
    golden_answer = config['Simple_processing']['golden_answer'] 
    response_1 = config['Simple_processing']['response'] 
    model = config['Simple_processing']['model']
     # Build the LLM input prompt
    llm_input = build_prompt_response_sim_answer(question, golden_answer, response_1, model)
    try:
            llm_response = send_to_watsonxai(llm_input, model)
            print(llm_response)
            # Replace escaped backslashes
            corrected_string = llm_response.split("<JSON_END}")[0]
            corrected_string = corrected_string.replace("<JSON_START>","")
            if 'result' in corrected_string:
                corrected_string = corrected_string+'}'
                print(corrected_string)

                # Convert the corrected string to a JSON object
                json_response = json.loads(corrected_string)

                # Print the JSON object
                print(json.dumps(corrected_string, indent=4))
                
                # Extract values from JSON response
                rating=json_response['result']['Change']
                feedback =json_response['result']['Feedback']
            else:
                 print(corrected_string)
                    # Convert the corrected string to a JSON object
                 json_response = json.loads(corrected_string)
                 rating=json_response['Change']
                 feedback =json_response['Feedback']
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

def write_data(data_df):
    ## save the output
    if '.xlsx' in output_file_name:
        data_df.to_excel(output_file_name)
    elif '.csv' in file_name:
        data_df.to_csv(output_file_name)
    print("file save")

       
def processing(case,processing_status):
     if case == 'rating' and processing_status == 'batch':
          file_name = home_dir+ config['Batch_porceesing']['file_name']   
          data_df = read_data(file_name)
          data_df = batch_processing_rating(data_df)
          write_data(data_df)
     elif case == 'similarity' and processing_status == 'batch':
          file_name = home_dir+ config['Batch_porceesing']['file_name']   
          data_df = read_data(file_name)
          data_df = batch_processing_sim_answer(data_df)
          write_data(data_df)
     elif case == 'rating' and processing_status == 'simple':
          rating,feedback = simple_processing_rating()
          print("rating----",rating)
          print("feedback---",feedback)
     elif case == 'similarity' and processing_status == 'simple':
          change,feedback = simple_processing_sim_answer()
          print("change----",change)
          print("feedback---",feedback)
     elif case == 'multi_turn':
          file_name = home_dir+config['Multi_turn']['file_name']
          data_df = read_data(file_name)
          query_rewrite_and_classification(data_df)


## all options basis of tabs
#processing('rating','batch')
processing('rating','simple')
#processing('similarity','batch')
#processing('similarity','simple')
#processing('multi_turn')