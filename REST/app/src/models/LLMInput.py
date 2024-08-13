from typing import Union
from pydantic import BaseModel

class LLMInput(BaseModel):
    question: str
    golden_answer: str
    llm_response: str
    model: str = "LLAMA3"


