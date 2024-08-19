import io
import pandas as pd

class Helper:

    def __init__(self) -> None:
        pass

    def read_data(self, file_name: str, file_content: bytes):
        ## Read the data for btach processing 
        data_df = pd.DataFrame()
        file_stream = io.BytesIO(file_content)
        if '.xlsx' in file_name:
            data_df = pd.read_excel(file_stream)
        elif '.csv' in file_name:
            data_df =pd.read_csv(file_stream)
        return data_df