from answer_similarity import batch_llm_answer_similarity
from answer_rating import batch_llm_answer_rating
from llm_judge import batch_llm_judge

import pandas as pd
import json
import configparser

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
    ## Read the data for btach processing 
    data_df = pd.DataFrame()
    if '.xlsx' in input_file:
        data_df = pd.read_excel(input_file)
    elif '.csv' in input_file:
        data_df =pd.read_csv(input_file)
    return data_df

def write_data(data_df):
    ## save the output
    if '.xlsx' in output_file_name:
        data_df.to_excel(output_file_name)
    elif '.csv' in output_file_name:
        data_df.to_csv(output_file_name)
    print("file save")


def batch_llm_judge_caller(input_file):
    input_data = read_data(input_file)
    output_data = batch_llm_judge(model_id, input_data)
    write_data(output_data)
    return output_data

def batch_answer_similarity_caller(input_file):
    input_data = read_data(input_file)
    output_data = batch_llm_answer_similarity(input_data)
    write_data(output_data)
    return output_data

def batch_answer_rating_caller(input_file):
    input_data = read_data(input_file)
    output_data = batch_llm_answer_rating(input_data)
    write_data(output_data)
    return output_data

def processing(judge_type):
    if judge_type == 'llm_judge':
        batch_llm_judge_caller(input_file)
    elif judge_type == 'answer_similarity':
        batch_answer_similarity_caller(input_file)
    elif judge_type == 'answer_rating':
        batch_answer_rating_caller(input_file)
    



processing(judge_type)
## all options basis of tabs
#processing('rating','batch')
# processing('rating','simple')
#processing('similarity','batch')
#processing('similarity','simple')
#processing('multi_turn')