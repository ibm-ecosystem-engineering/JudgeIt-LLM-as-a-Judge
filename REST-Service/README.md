<!-- ABOUT THE PROJECT -->

<!-- omit in toc -->
# JudgeIt REST Service

One method of using JudgeIt is through a Service-Oriented Architecture (SOA). This directory contains the RESTful service code that interfaces with the JudgeIt framework. It offers endpoints for initiating evaluations, retrieving results, and configuring evaluation parameters.

![Architecture diagram](/images/LLM-Judge-Architecture-Backend.png)

<!-- omit in toc -->
## Table of Contents

- [Components](#components)
  - [REST Server](#rest-server)
  - [Redis Broker](#redis-broker)
  - [Celery Worker](#celery-worker)
  - [Flower Server](#flower-server)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Test](#test)
- [JudgeIt App](#judgeit-app)
- [Configuring your Input File](#configuring-your-input-file)
- [Understanding the Results](#understanding-the-results)

<!-- Components -->

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

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

The following prerequisites are required to run the tester:

1. Docker desktop is installed: <https://docs.docker.com/desktop/>
2. docker-compose is installed (for mac: <https://formulae.brew.sh/formula/docker-compose>)
3. watsonx.ai project id: watsonx.ai project's Manage tab (Project -> Manage -> General -> Details)
4. IBM Cloud api key: <https://cloud.ibm.com/iam/apikeys> (this must be for the same cloud account that hosts the watsonx.ai instance)

### Installation

> **Note** Any keys included in this repository are intended solely for illustrative purposes and are neither valid nor active. These non-functional keys should be replaced with your own secure and valid credentials.

1. Change directory into the JudgeIt REST-Service

   ```bash
   cd JudgeIt-LLM-as-a-Judge/REST-Service
   ```

2. In the `docker-compose.yml` file, update the following variables:
   1. IBM_CLOUD_API_KEY (your IBM Cloud api key)
   2. WX_PROJECT_ID (your watsonx.ai project id)

   ```yaml
    services:
        fastapi_app:
        container_name: fastapi_app
        build: .
        ports:
            - 3001:3001
        environment:
            - WATSONX_URL=<https://us-south.ml.cloud.ibm.com>
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
            - WATSONX_URL=<https://us-south.ml.cloud.ibm.com>
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

3. Build

   ```sh
   docker-compose build
   ```

4. Run

   ```sh
   docker-compose up -d
   ```

## Test

- REST Endpoint: <http://localhost:3001>
- Flower server: <http://localhost:5556>

## JudgeIt App

You can now move on to spinning up the [JudgeIt NextJS App](../JudgeIt-App/README.md)

## Configuring your Input File

Each type of LLM Judge will accept an excel/csv file as an input file. The repository contains a sample input file for each type of LLM Judge that you can copy, edit, and use to test. They are located at: [JudgeIt-LLM-as-a-Judge/Framework/data/input](../Framework/data/input)

1. RAG Evaluation (Similarity): provide an excel/csv file with a `golden_text` column and `generated_text` column to compare
2. RAG Evaluation (Rating): provide an excel/csv file with a `golden_text` column and `generated_text` column to compare
3. Multi-turn Evaluation: provide an excel/csv file with the following columns: `previous_question`, `previous_answer`, `current_question`, `golden_rewritten_question`, and `rewritten_question`

Note: Your input files can contain additional columns than the ones specified above. These columns will have no effect on the LLM Judge and will be perserved in the output file.

## Understanding the Results

The generated results will be saved to an excel/csv file at the location specified in your config file. Each file will contain all the columns provided in the input file.

1. For RAG Evaluation (Similarity), the LLM Judge will output a `Grade` and `Explanation`. A grade of 0 means the texts are dissimilar, while a grade of 1 means the texts are similar.
2. For RAG Evaluation (Rating), the LLM Judge will output a `Grade` and `Explanation`. A grade of 1 means the texts are dissimilar, a grade of 2 means the texts are partially similar, and a text of 3 means the texts are significantly similar.
3. For Multi-turn Evaluation, the LLM Judge will output a `Grade`. A grade of 0 means the golden rewritten question and rewritten question are dissimilar, while a grade of 1 means the questions are similar.
