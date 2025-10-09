from typing import Union
from pydantic import BaseModel, Field

class LLMInput(BaseModel):
    question: str
    golden_text: str
    generated_text: str
    model: str = "meta-llama/llama-3-70b-instruct"


