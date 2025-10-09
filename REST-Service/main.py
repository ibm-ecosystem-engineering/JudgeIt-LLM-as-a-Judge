from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
import logging
from dotenv import load_dotenv
from app.route.root import routes as root_api
from app.route.llm_judge import routes as llm_judge_api
from app.route.llm_manage import routes as judge_management_api
from fastapi.middleware.cors import CORSMiddleware
import os
from app.src.config.TimeoutMiddleware import TimeoutMiddleware

load_dotenv()
platform = os.environ.get("PLATFORM")
server_url = os.environ.get("SERVER_URL", default="http://localhost:3001")

app = FastAPI(
    title="LLM JUDGE API",
    description="This api will be used to judge llm response and get ratings and feedback",
    version="1.0.1-fastapi",
    servers=[
        {
            "url": server_url
        }
    ],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('api-service')

# Register blueprints
app.include_router(root_api.root_api_route)
app.include_router(llm_judge_api.judge_api_route)
app.include_router(judge_management_api.judge_management_api_route)

origins = [ "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TimeoutMiddleware, timeout=600)  # Timeout set to 600 seconds (10 minutes)

if __name__ == '__main__':
    uvicorn.run("main:app", host='0.0.0.0', port=3001)