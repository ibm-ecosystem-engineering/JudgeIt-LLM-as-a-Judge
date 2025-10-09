from typing import Union
from pydantic import BaseModel

class SingleTurnInput(BaseModel):
    previous_question: str
    previous_answer: str
    current_question: str
    golden_rewritten_question: str
    rewritten_question: str
    model: str = "meta-llama/llama-3-70b-instruct"