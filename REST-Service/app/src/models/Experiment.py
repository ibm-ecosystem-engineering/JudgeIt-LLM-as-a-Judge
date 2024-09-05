from typing import Union
from pydantic import BaseModel, Field

class Experiment(BaseModel):
    name: str
    user_id: str
    type: str