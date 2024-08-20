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
    

    def validate_multi_turn_fields(self, data_df: pd.DataFrame):
        
        required_columns = ["previous_question", "previous_answer", "current_question", "golden_rewritten_question", "rewritten_question"]

        if all(column in data_df.columns for column in required_columns):
            return True
        
        columns = ", ".join(required_columns)

        raise Exception("Required columns are missing, valid columns are ## " + columns) 
    
    def validate_rating_and_similarity_fields(self, data_df: pd.DataFrame):
        
        required_columns = ["golden_text", "generated_text"]

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