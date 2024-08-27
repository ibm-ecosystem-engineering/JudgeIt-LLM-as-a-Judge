from answer_similarity import batch_llm_answer_similarity
from answer_rating import batch_llm_answer_rating
from multi_turn_eval import batch_llm_multi_turn_eval

import pandas as pd
import json
import configparser

import chardet 

config = configparser.ConfigParser()
config.read('./../config.ini')

## Setup the filename and values
home_dir = config['Default']['home_dir']
input_file_name = config['Default']['input_file_name']
output_file_name = config['Default']['output_file_name']
model_id = config['Default']['model_id']
judge_type = config['Default']['judge_type']

input_file = home_dir + input_file_name

def read_data(input_file):
    ## Read the data for batch processing
    data_df = pd.DataFrame()
    if '.xlsx' in input_file:
        data_df = pd.read_excel(input_file)
    elif '.csv' in input_file:
        with open(input_file, 'rb') as f:
            result = chardet.detect(f.read())
        data_df = pd.read_csv(input_file, encoding=result['encoding'])
    return data_df

def write_data(data_df):
    ## save the output
    if '.xlsx' in output_file_name:
        data_df.to_excel(output_file_name)
    elif '.csv' in output_file_name:
        data_df.to_csv(output_file_name)
    print("file save")


def batch_llm_multi_turn_eval_caller(input_file):
    input_data = read_data(input_file)
    output_data = batch_llm_multi_turn_eval(model_id, input_data)
    write_data(output_data)
    return output_data

def batch_llm_answer_similarity_caller(input_file):
    input_data = read_data(input_file)
    output_data = batch_llm_answer_similarity(model_id, input_data)
    write_data(output_data)
    return output_data

def batch_llm_answer_rating_caller(input_file):
    input_data = read_data(input_file)
    output_data = batch_llm_answer_rating(model_id, input_data)
    write_data(output_data)
    return output_data

def processing(judge_type):
    if judge_type == 'multi_turn_eval':
        batch_llm_multi_turn_eval_caller(input_file)
    elif judge_type == 'rag_eval_answer_similarity':
        batch_llm_answer_similarity_caller(input_file)
    elif judge_type == 'rag_eval_answer_rating':
        batch_llm_answer_rating_caller(input_file)
    



processing(judge_type)
## all options basis of tabs
#processing('rating','batch')
# processing('rating','simple')
#processing('similarity','batch')
#processing('similarity','simple')
#processing('multi_turn')