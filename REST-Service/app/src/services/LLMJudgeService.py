from langchain_ibm import WatsonxLLM
from app.src.services.answer_similarity import build_query_similarity_prompt
from app.src.services.answer_rating import build_query_rating_prompt
import json
from app.src.services.single_turn_eval import build_single_turn_prompt
from app.src.services.mult_turn_with_conversation_eval import build_multi_turn_prompt

class LLMJudgeService:

    def __init__(self) -> None:
        pass

    def simple_processing_rating(self, golden_text: str, generated_text:str, llm_model: WatsonxLLM):
        
        prompt, prompt_data = build_query_rating_prompt(row={
            "golden_text": golden_text,
            "generated_text": generated_text
        })

        llm_chain = prompt | llm_model
        prompt_results = llm_chain.invoke(prompt_data)
        return json.loads(prompt_results)
    
    def simple_processing_similarity_answer(self, golden_text: str, generated_text:str, llm_model: WatsonxLLM):

        prompt, prompt_data = build_query_similarity_prompt(row={
            "golden_text": golden_text,
            "generated_text": generated_text
        })

        llm_chain = prompt | llm_model

        prompt_results = llm_chain.invoke(prompt_data)
        prompt_results = prompt_results.replace("\"1\" or \"0\"", "\"0\"")
        return json.loads(prompt_results)
    
    def single_trun_llm_judge(self,
        previous_question: str,
        previous_answer: str,
        current_question: str,
        golden_rewritten_question: str,
        rewritten_question: str,
        llm_model: WatsonxLLM):

        prompt, prompt_data = build_single_turn_prompt(row={
            "previous_question": previous_question,
            "previous_answer": previous_answer,
            "current_question": current_question,
            "golden_rewritten_question": golden_rewritten_question,
            "rewritten_question": rewritten_question
        })
        llm_chain = prompt | llm_model
        prompt_results = {"Grade": None}
        try:
            prompt_results = json.loads(llm_chain.invoke(prompt_data))
        except:
            prompt_results = prompt_results = {
                "Grade": "Error"
            }

        return prompt_results
    
    def multi_trun_llm_judge(self,
        conversation_history: str,
        follow_up_query: str,
        golden_query: str,
        rewritten_query: str,
        llm_model: WatsonxLLM):

        prompt, prompt_data = build_multi_turn_prompt(row={
            "conversation_history": conversation_history,
            "follow_up_query": follow_up_query,
            "golden_query": golden_query,
            "rewritten_query": rewritten_query
        })
        llm_chain = prompt | llm_model
        prompt_results = {"Grade": None}
        try:
            prompt_results = json.loads(llm_chain.invoke(prompt_data))
        except:
            prompt_results = prompt_results = {
                "Grade": "Error"
            }

        return prompt_results

