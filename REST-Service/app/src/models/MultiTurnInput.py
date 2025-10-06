from typing import Union
from pydantic import BaseModel

class MultiTurnInput(BaseModel):
    conversation_history: str
    follow_up_query: str
    golden_query: str
    rewritten_query: str
    model: str = "meta-llama/llama-3-70b-instruct"