from typing import Any
from pydantic import BaseModel, Field

class RequestHistory(BaseModel):
    name: str
    user_id: str
    experiment_name: str
    content: Any
    type: str
    eval_type: str