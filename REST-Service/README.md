<!-- ABOUT THE PROJECT -->

<!-- omit in toc -->
# JudgeIt REST Service

One method of using JudgeIt is through a Service-Oriented Architecture (SOA). This directory contains the RESTful service code that interfaces with the JudgeIt framework. It offers endpoints for initiating evaluations, retrieving results, and configuring evaluation parameters.

## Architecture Diagram:

- **SaaS**: If you are using SaaS based LLM service (watsonx.ai), you can set the value of **WX_PLATFORM** as saas in the environment variable.
  
![llm-judge-app-saas](https://github.com/user-attachments/assets/24d8819f-a621-4c41-9a39-119c342ffbc9)

- **On Prem**: If you have an LLM deployed on premise on CP4D, you can set the value of **WX_PLATFORM** as onpremise in the environment variable.

![LLM-Judge-app-onpremise](https://github.com/user-attachments/assets/0589ed54-5a93-4ec2-9ebb-96bfc202b223)

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

1. podman and podman-compose are installed. If you're using Docker and Docker Compose, you can skip this step. Simply use the `docker` command in place of `podman` and `docker-compose` instead of `podman-compose`.
    - **macOS:** use the following commands to install Podman and Podman Compose

    ```sh
        brew install podman podman-compose
    ```

    - **Ubuntu:** Use the following commands to install Podman and Podman Compose

    ```sh
        sudo apt update
        sudo apt install podman podman-compose
    ```

    - **Windows:**

        - Download Podman for Windows: Visit the Podman for Windows release page (https://github.com/containers/podman-desktop/releases) and download the latest installer for your Windows version.

        - Run the installer: Double-click the downloaded installer file and follow the on-screen instructions to complete the installation process.

2. watsonx.ai project id: watsonx.ai project's Manage tab (Project -> Manage -> General -> Details)
3. IBM Cloud api key: <https://cloud.ibm.com/iam/apikeys> (this must be for the same cloud account that hosts the watsonx.ai instance)

### Installation

1. Change directory into the JudgeIt REST-Service

   ```bash
   git clone git@github.com:ibm-ecosystem-engineering/JudgeIt-LLM-as-a-Judge.git && cd JudgeIt-LLM-as-a-Judge/REST-Service
   ```

2. In the `docker-compose.yml` file, update the following variables:
    1. **WX_PLATFORM**: There are two options available: `saas` or `onpremise`. If you're using the IBM Watsonx platform, choose `saas`, but if you're using the on-premise Watsonx platform on CP4D, select 'onpremise'.
    2. **WATSONX_URL**: Please provide watsonx url e.g. `https://us-south.ml.cloud.ibm.com`
    3. **IBM_CLOUD_API_KEY**: IBM Cloud/Watsonx api key
    4. **WX_PROJECT_ID**: your watsonx.ai project id
    5. **WX_USER**: watsonx user is required when you choose the platform `onpremise`
    6. **SERVER_URL:** Server url where the service will be deployed. It helps to navigate swagger ui.

```yaml
services:
  fastapi_app:
    container_name: fastapi_app
    build: .
    #volumes:
    #  - ./app:/app
    ports:
      - 3001:3001
    environment:
      - WATSONX_URL=https://us-south.ml.cloud.ibm.com
      - WX_PROJECT_ID=
      - IBM_CLOUD_API_KEY=
      - LLM_JUDGE_API_KEY=JudgeIt-Secret-Api-Key
      - WX_PLATFORM=
      - WX_USER=
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/0
      - SERVER_URL='http://localhost:3001'
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
      - WX_PLATFORM=
      - WX_USER=
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
   podman-compose build
   ```

4. Run

   ```sh
   podman-compose up -d
   ```

5. Validate

   Validate if all the services are up and running.

   ```sh
   podman-compose ps
   ```

   The output will be like below.

  ```sh
  CONTAINER ID  IMAGE                                        COMMAND               CREATED        STATUS        PORTS                                       NAMES
  1a6c7af902fa  localhost/rest-service_fastapi_app:latest    python3 main.py       9 seconds ago  Up 9 seconds  0.0.0.0:3001->3001/tcp, 3001/tcp, 8080/tcp  fastapi_app
  16117ab1b15e  docker.io/library/redis:7.2.5-alpine         redis-server          6 seconds ago  Up 7 seconds  6379/tcp                                    redis
  0269de20e376  localhost/rest-service_celery_worker:latest  celery -A app.cel...  5 seconds ago  Up 6 seconds  3001/tcp, 8080/tcp                          celery_worker
  600c2aa3d650  localhost/rest-service_flower:latest         celery --broker=r...  5 seconds ago  Up 5 seconds  0.0.0.0:5556->5555/tcp, 3001/tcp, 8080/tcp  flower
  ```

## Test

- REST Endpoint: <http://localhost:3001>
- Flower server: <http://localhost:5556>

## JudgeIt App

You can now move on to spinning up the [JudgeIt NextJS App](../JudgeIt-App/README.md)

## Openshift deployment

For openshift deployment please follow [the instruction here](deployment/readme.md)

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
