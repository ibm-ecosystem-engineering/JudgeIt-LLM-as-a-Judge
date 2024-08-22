# REST Service

This directory contains the RESTful service code that interfaces with the JudgeIt framework. It offers endpoints for initiating evaluations, retrieving results, and configuring evaluation parameters.

## Architecture diagram

![Architecture diagram](/images/LLM-Judge-Architecture-Backend.png)

## Components

There are four components in this service.

- REST Server
- Redis Broker
- Celery Worker
- Flower Server

### REST Server

This FastAPI-based Python REST service offers various endpoints to evaluate LLM (Large Language Model) generations. It supports two types of requests: batch and single, with three evaluation types—rating, similarity, and multi-turn. Additionally, it provides a Swagger UI for easy interaction with the endpoints.

![Swagger ui](/images/swagger-ui.png)

We submit our long-running tasks to the Redis broker for asynchronous execution. After submitting a task, we monitor its progress using status endpoints (including server-sent events, WebSocket, and HTTP requests). Once the task is completed, we retrieve the result from the download endpoint.

### Redis Broker

Redis is an in-memory data store that can be used as a message broker in Celery, providing a simple and efficient way to manage task queues, making it an ideal choice for our solution.It receives tasks from the FastAPI service and places them in the queue for processing.

### Celery Worker

Consume tasks from the Redis queue and execute them asynchronously, then return the result to the Redis broker.

### Flower Server

It monitors the Celery cluster in real-time, offering a web-based interface to track task execution, worker performance, and queue status.

## Execution

### Requirements

- Docker and docker-compose are installed
- [IBM Cloud API Key](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui)
- [Watsonx Project id](https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/fm-project-id.html?context=wx)

### Steps to execute the program

Update the Docker Compose environment variables. There are two environment variables that need to be updated.

- IBM_CLOUD_API_KEY
- WX_PROJECT_ID

```yaml
services:
  fastapi_app:
    container_name: fastapi_app
    build: .
    ports:
      - 3001:3001
    environment:
      - WATSONX_URL=https://us-south.ml.cloud.ibm.com
      - WX_PROJECT_ID=
      - IBM_CLOUD_API_KEY=
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/0
      - LLM_JUDGE_API_KEY=LLM-JUDGE-SECRET-PASS
    restart: always
  redis:
    container_name: redis
    image: redis:7.2.5-alpine
    restart: always
  celery_worker:
    container_name: celery_worker
    build: .
    #volumes:
    #  - ./app:/app
    command: celery -A app.celery.celery_worker.celery worker --loglevel=info
    environment:
      - WATSONX_URL=https://us-south.ml.cloud.ibm.com
      - WX_PROJECT_ID=
      - IBM_CLOUD_API_KEY=
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/0
    depends_on:
      - fastapi_app
      - redis
    restart: always
  flower:
    container_name: flower
    build: .
    command: celery --broker=redis://redis:6379/0 flower --port=5555
    ports:
      - 5556:5555
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/0
    depends_on:
      - fastapi_app
      - redis
      - celery_worker
    restart: always
```

#### Build

```sh
docker-compose build
```

#### Run

```sh
docker-compose up -d
```

#### Test

- REST Endpoint: <http://localhost:3001>
- Flower server: <http://localhost:5556>
