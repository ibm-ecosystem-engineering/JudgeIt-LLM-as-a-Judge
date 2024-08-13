from app.src.services.AnswerSimilarityService import build_prompt_response_sim_answer
from app.src.services.QueryRatingService import build_prompt_response_rating_question
import json
from app.src.services.WatsonXService import WatsonXService
import pandas as pd
import re

class LLMJudgeService:

    def __init__(self, api_key, project_id) -> None:
        #self.query_rating_service = QueryRatingService()
        #self.query_similarity_service = AnswerSimilarityService()
        self.watsonx_service = WatsonXService(
             api_key=api_key,
             project_id=project_id
        )

    def simple_processing_rating(self, question,golden_answer,response_1,model):
        # Build the LLM input prompt
        llm_input = build_prompt_response_rating_question(question, golden_answer, response_1, model)
        #try:
        llm_response = self.watsonx_service.send_to_watsonxai(llm_input, model)
        print("=================================================================================")
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

        return rating,feedback
    
    def simple_processing_similarity_answer(self, question,golden_answer,response_1,model):
        # Build the LLM input prompt
        llm_input = build_prompt_response_sim_answer(question, golden_answer, response_1, model)
        #try:

        llm_response = self.watsonx_service.send_to_watsonxai(llm_input, model)
        print("==================================row===========================================")
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
            
        return rating,feedback
    
    def batch_processing_rating(self, data_df, model):
        # Iterate over each row in the DataFrame
        for index, row in data_df.iterrows():
            print(index)
            question = row["Question"]
            golden_answer = row["golden_answer"]
            llm_response = row["llm_response"]
            
            llm_input = self.simple_processing_rating(question, golden_answer, llm_response, model)
            # Build the LLM input prompt
            
            # Update the DataFrame with the extracted values
            data_df.loc[index,"rating"] = llm_input[0]
            data_df.loc[index,"feedback"] = llm_input[1]
        return data_df
    
    def batch_processing_similarity(self, data_df, model):
        # Iterate over each row in the DataFrame
        for index, row in data_df.iterrows():
            print(index)
            question = row["Question"]
            golden_answer = row["golden_answer"]
            llm_response = row["llm_response"]
            
            llm_input = self.simple_processing_similarity_answer(question, golden_answer, llm_response, model)
            # Build the LLM input prompt
            
            # Update the DataFrame with the extracted values
            data_df.loc[index,"Change"] = llm_input[0]
            data_df.loc[index,"Feedback"] = llm_input[1]
        return data_df
