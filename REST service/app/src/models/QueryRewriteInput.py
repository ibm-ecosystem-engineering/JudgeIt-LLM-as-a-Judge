from typing import Union
from pydantic import BaseModel

class QueryRewriteInput(BaseModel):
    previous_question: str
    previous_answer: str
    current_question: str
    current_question: str
    gold_label: str
    gold_rewrite: str
    model: str = "LLAMA3"