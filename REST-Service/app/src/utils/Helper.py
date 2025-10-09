import io
from fastapi import UploadFile
import pandas as pd

class Helper:

    def __init__(self) -> None:
        pass

    def read_data(self, file_name: str, file_content: bytes) -> pd.DataFrame: 

        file_extension = file_name.split(".")[-1].lower()
        if file_extension not in ['xls', 'xlsx', 'csv']:
            raise Exception("Bad file types, accepted file types are xls, xlsx, and csv") 

        ## Read the data for btach processing 
        data_df = pd.DataFrame()
        file_stream = io.BytesIO(file_content)
        if '.xlsx' in file_name:
            data_df = pd.read_excel(file_stream)
        elif '.csv' in file_name:
            data_df =pd.read_csv(file_stream)
        return data_df
    

    def validate_single_turn_fields(self, data_df: pd.DataFrame):
        
        # Normalize the column names to lowercase
        data_df.columns = map(str.lower, data_df.columns)
        
        required_columns = ["previous_question", "previous_answer", "current_question", "golden_rewritten_question", "rewritten_question"]

        if all(column in data_df.columns for column in required_columns):
            return True
        
        columns = ", ".join(required_columns)

        raise Exception("Required columns are missing, valid columns are ## " + columns) 
    
    def validate_multi_turn_with_conversation_fields(self, data_df: pd.DataFrame):
        
        # Normalize the column names to lowercase
        data_df.columns = map(str.lower, data_df.columns)
        
        required_columns = ["conversation_history", "follow_up_query", "golden_query", "rewritten_query"]

        if all(column in data_df.columns for column in required_columns):
            return True
        
        columns = ", ".join(required_columns)

        raise Exception("Required columns are missing, valid columns are ## " + columns) 
    
    def validate_rating_and_similarity_fields(self, data_df: pd.DataFrame):
        # Normalize the column names to lowercase
        data_df.columns = map(str.lower, data_df.columns)

        # Define required columns in lowercase
        required_columns = ["question", "golden_text", "generated_text"]

        # Check if all required columns are present (case-insensitive)
        if all(column in data_df.columns for column in required_columns):
            return True

        columns = ", ".join(required_columns)

        raise Exception("Required columns are missing, valid columns are ## " + columns)


    def is_valid_file(file: UploadFile):
        filename = file.filename
        file_extension = filename.split(".")[-1].lower()
        
        if file_extension == 'csv' or file_extension in ['xls', 'xlsx']:
            return True
        else:
            return False

# This code was added to handle the case when the columns produced by langfuse script had lower case o in the
# Chrono Agent output field; This is not needed because we'll change all columns to title formant before sending 
# to whitebox eval       
    def validate_wbox_eval_fields(self, data_df: pd.DataFrame):

        ## Data provided has it as "Chrono Agent output" instead of "Chrono Agent Output" so made that change here..
        
        required_columns = ["Chrono Agent output", "Product Agent Output", "Research Agent Output", "Comms Agent Output"]

        if all(column in data_df.columns for column in required_columns):
            return True
        
        columns = ", ".join(required_columns)
 
        raise Exception("Required columns are missing, valid columns are ## " + columns)



#    def validate_wbox_eval_fields(self, data_df: pd.DataFrame):
        
#        required_columns = ["Chrono Agent Output", "Product Agent Output", "Research Agent Output", "Comms Agent Output"]

#        if all(column in data_df.columns for column in required_columns):
#            return True
        
#        columns = ", ".join(required_columns)

#        raise Exception("Required columns are missing, valid columns are ## " + columns)

    def validate_bbox_eval_fields(self, data_df: pd.DataFrame):
        
        required_columns = ["Chrono Agent Output", "Product Agent Output", "Research Agent Output", "Comms Agent Output"]

        for col in required_columns:
            colfound = col in data_df.columns
            print(f"col {col} found: {colfound}")

        if all(column in data_df.columns for column in required_columns):
            return True
        
        columns = ", ".join(required_columns)

        raise Exception("Required columns are missing, valid columns are ## " + columns)


    def validate_neg_test_eval_fields(self, data_df: pd.DataFrame):
        
        required_columns = ["Research Agent Output", "Comms Agent Output"]


        if all(column in data_df.columns for column in required_columns):
            return True
        
        columns = ", ".join(required_columns)

        raise Exception("Required columns are missing, valid columns are ## " + columns) 


    def validate_agent_eval_fields(self, data_df: pd.DataFrame):
        
        required_columns = ["Chrono Agent Output", "Product Agent Output", "Research Agent Output", "Comms Agent Output"]

        for col in required_columns:
            colfound = col in data_df.columns
            print(f"col {col} found: {colfound}")

        if all(column in data_df.columns for column in required_columns):
            return True
        
        columns = ", ".join(required_columns)

        raise Exception("Required columns are missing, valid columns are ## " + columns)
