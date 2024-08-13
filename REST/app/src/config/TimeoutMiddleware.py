from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import FastAPI, Request, HTTPException
import time

class TimeoutMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, timeout: int):
        super().__init__(app)
        self.timeout = timeout

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            if process_time > self.timeout:
                raise HTTPException(status_code=408, detail="Request Timeout")
            return response
        except Exception as e:
            process_time = time.time() - start_time
            if process_time > self.timeout:
                return JSONResponse(content={"detail": "Request Timeout"}, status_code=408)
            raise e