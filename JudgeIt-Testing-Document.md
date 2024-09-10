<!-- omit in toc -->
# JudgeIt - An Auto Evaluation Framework for Generative AI Pipelines

JudgeIt is an automated evaluation framework designed for various Generative AI pipelines such as RAG Evaluation, Multi-Turn Query Rewrite evaluation, Text-to-SQL Evaluation, and more. It utilizes an LLM Judge to accurately and efficiently evaluate generated text against a provided golden text.

## Features

- **Automated Evaluation**: JudgeIt automates batch evaluation processes, resulting in more efficient evaluation compared to human testers.
- **Multi-Pipeline Support**: Evaluate different types of LLM pipelines including:
  - **RAG**: evaluate generated text against golden text
  - **Multi-turn query rewritings**: evaluate rewritten queries given a multi-turn conversation
  - **Text-to-SQL conversions**: evaluate natural language to SQL generations
- **Customization**: Configure the evaluation process with your datasets, LLM models, and specific parameters.

## Reliability Metrics

The LLM Judges in this repository have been tested against human evaluation to validate their reliability.

1. Multi-turn Query Rewrite Evaluation
![Multi-turn Evaluation Reliability](/images/multi-turn-evaluation-reliability.png)
2. RAG Evaluation
![RAG Evaluation Reliability](/images/rag-evaluation-reliability.png)

## Installation

1. Clone the repository

   ```bash
   git clone <repository url>
   ```

2. Create a python virtual environment

   ```bash
   python3 -m venv virtual-env
   source virtual-env/bin/activate
   pip3 install -r requirements.txt
   ```

3. Select a method to spin up the JudgeIt service:
   1. Framework: Use Python modules and the cli to run evaluations locally
      1. [Framework Instructions](#judgeit-framework)
   2. Service-Oriented Architecture: first spin up a REST API backend, then spin up a NextJS frontend to run evaluations via a UI
      1. [REST Service Instructions](#judgeit-rest-service)
      2. [JudgeIt App Instructions](#judgeit-application)

<!-- ABOUT THE PROJECT -->

<!-- omit in toc -->
# JudgeIt Framework

One method of using JudgeIt is through the JudgeIt Python framework. The framework contains Python modules for different types of LLM Judge evaluations. There are three types of LLM Judges:

1. **RAG Evaluation (Similarity)**: evaluate generated text against golden text
2. **RAG Evaluation (Rating)**: evaluate generated text against golden text
3. **Multi-turn evaluation**: evaluate rewritten queries given a mult-turn conversation

The JudgeIt framework takes input data in the form of excel or csv files for any of these evaluations.

![LLM-Judges](/images/flow-diagram.png)

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

The following prerequisites are required to run the tester:

1. Python3
2. IBM Cloud api key (this must be for the same cloud account that hosts your watsonx.ai instance)
3. watsonx.ai project id: watsonx.ai project's Manage tab (Project -> Manage -> General -> Details)
   1. This project must be associated with a WML instance

### Installation

1. Change directory into the JudgeIt Framework

   ```bash
   cd JudgeIt-LLM-as-a-Judge/Framework
   ```

2. Configure your parameters in config.ini. Below is a sample config file

   ```bash
   [Default]
   home_dir = /<home_directory>/JudgeIt-LLM-as-a-Judge/
   model_id = meta-llama/llama-3-70b-instruct
   input_file_name = Framework/data/input/sample_rag_answer_similarity_input.xlsx
   output_file_name = Framework/data/output/sample_rag_answer_similarity_output.xlsx
   judge_type = rag_eval_answer_similarity

   [WML_CRED]
   wml_url = https://us-south.ml.cloud.ibm.com
   api_key = <ibm_cloud_api_key>
   project_id = <watsonx.ai_project_id>
   ```

   1. `home_dir`: the path to the folder where you have downloaded the repository
   2. `model_id`: the watsonx.ai model id that will be used for your LLM Judge
   3. `input_file_name`:
      1. a sample input file for each evaluation type is located in [JudgeIt-LLM-as-a-Judge/Framework/data/input](./data/input)
      2. see [Configuring Your Input File](#configuring-your-input-file) for more details
   4. `output_file_name`: specify the name of your output file
   5. `judge_type`: specify the LLM Judge type. Possible values:
      1. `rag_eval_answer_similarity`
      2. `rag_eval_answer_rating`
      3. `multi_turn_eval`
   6. `wml_url`: you watsonx.ai url: https://<your_region>.ml.cloud.ibm.com
   7. `api_key`: your IBM Cloud apikey: <https://cloud.ibm.com/iam/apikeys>
   8. `project_id`: you watsonx.ai project id: watsonx.ai project's Manage tab (Project -> Manage -> General -> Details)

3. Run the following to evaluate.

   ```bash
   python main.py
   ```

   The output of the evaluation will be printed in your terminal, and a copy of the results will be saved to /JudgeIt-LLM-as-a-Judge/Framework/data/output
4. Run the following command to exit the python virtual environment:

   ```bash
   deactivate
   ```

## Configuring your Input File

Each type of LLM Judge will accept an excel/csv file as an input file. The repository contains a sample input file for each type of LLM Judge that you can copy, edit, and use to test. They are located at: [JudgeIt-LLM-as-a-Judge/Framework/data/input](./Framework/data/input)

1. RAG Evaluation (Similarity): provide an excel/csv file with a `golden_text` column and `generated_text` column to compare
2. RAG Evaluation (Rating): provide an excel/csv file with a `golden_text` column and `generated_text` column to compare
3. Multi-turn Evaluation: provide an excel/csv file with the following columns: `previous_question`, `previous_answer`, `current_question`, `golden_rewritten_question`, and `rewritten_question`

Note: Your input files can contain additional columns than the ones specified above. These columns will have no effect on the LLM Judge and will be perserved in the output file.

## Understanding the Results

The generated results will be saved to an excel/csv file at the location specified in your config file. Each file will contain all the columns provided in the input file.

1. For RAG Evaluation (Similarity), the LLM Judge will output a `Grade` and `Explanation`. A grade of 0 means the texts are dissimilar, while a grade of 1 means the texts are similar.
2. For RAG Evaluation (Rating), the LLM Judge will output a `Grade` and `Explanation`. A grade of 1 means the texts are dissimilar, a grade of 2 means the texts are partially similar, and a text of 3 means the texts are significantly similar.
3. For Multi-turn Evaluation, the LLM Judge will output a `Grade`. A grade of 0 means the golden rewritten question and rewritten question are dissimilar, while a grade of 1 means the questions are similar.

<!-- ABOUT THE PROJECT -->

<!-- omit in toc -->
# JudgeIt REST Service

One method of using JudgeIt is through a Service-Oriented Architecture (SOA). This directory contains the RESTful service code that interfaces with the JudgeIt framework. It offers endpoints for initiating evaluations, retrieving results, and configuring evaluation parameters.

![Architecture diagram](/images/LLM-Judge-Architecture-Backend.png)

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

1. podman and podman-compose are installed
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

        - Download Podman for Windows: Visit the Podman for Windows release page (<https://github.com/containers/podman-desktop/releases>) and download the latest installer for your Windows version.

        - Run the installer: Double-click the downloaded installer file and follow the on-screen instructions to complete the installation process.

2. watsonx.ai project id: watsonx.ai project's Manage tab (Project -> Manage -> General -> Details)
3. IBM Cloud api key: <https://cloud.ibm.com/iam/apikeys> (this must be for the same cloud account that hosts the watsonx.ai instance)

### Installation

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

You can now move on to spinning up the [JudgeIt NextJS App](#judgeit-application)

## Configuring your Input File

Each type of LLM Judge will accept an excel/csv file as an input file. The repository contains a sample input file for each type of LLM Judge that you can copy, edit, and use to test. They are located at: [JudgeIt-LLM-as-a-Judge/Framework/data/input](/Framework/data/input)

1. RAG Evaluation (Similarity): provide an excel/csv file with a `golden_text` column and `generated_text` column to compare
2. RAG Evaluation (Rating): provide an excel/csv file with a `golden_text` column and `generated_text` column to compare
3. Multi-turn Evaluation: provide an excel/csv file with the following columns: `previous_question`, `previous_answer`, `current_question`, `golden_rewritten_question`, and `rewritten_question`

Note: Your input files can contain additional columns than the ones specified above. These columns will have no effect on the LLM Judge and will be perserved in the output file.

## Understanding the Results

The generated results will be saved to an excel/csv file at the location specified in your config file. Each file will contain all the columns provided in the input file.

1. For RAG Evaluation (Similarity), the LLM Judge will output a `Grade` and `Explanation`. A grade of 0 means the texts are dissimilar, while a grade of 1 means the texts are similar.
2. For RAG Evaluation (Rating), the LLM Judge will output a `Grade` and `Explanation`. A grade of 1 means the texts are dissimilar, a grade of 2 means the texts are partially similar, and a text of 3 means the texts are significantly similar.
3. For Multi-turn Evaluation, the LLM Judge will output a `Grade`. A grade of 0 means the golden rewritten question and rewritten question are dissimilar, while a grade of 1 means the questions are similar.

<!-- ABOUT THE PROJECT -->

<!-- omit in toc -->
# JudgeIt Application

One method of using JudgeIt is through a Service-Oriented Architecture (SOA). This directory contains the code for a React-based application that provides a user interface for interacting with the LLM Judge service. It is built on the Next.js framework and integrates with IBM App ID for authentication. There are three types of evaluation currently available:

1. **RAG Evaluation (Similarity)**: evaluate generated text against golden text
2. **RAG Evaluation (Rating)**: evaluate generated text against golden text
3. **Multi-turn evaluation**: evaluate rewritten queries given a mult-turn conversation

The JudgeIt framework takes input data in the form of excel or csv files for any of these evaluations.

![LLM-Judges](/images/flow-diagram.png)

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

The following prerequisites are required to run the tester:

1. [JudgeIt Backend REST Service](#judgeit-rest-service) is up and running
2. [Node.js](https://nodejs.org/en) v18 or higher

### Installation

1. Change directory into the JudgeIt App

   ```bash
   cd JudgeIt-LLM-as-a-Judge/JudgeIt-App
   ```

2. Copy env file to .env

   ```bash
   cp env .env
   ```

3. Configure your parameters in .env. Make sure `NEXT_PUBLIC_LLM_JUDGE_API_KEY` value matches with the value assigned in backend service.

4. Install dependencies

   ```bash
   npm install
   ```

5. Run the development server

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuring your Input File

Each type of LLM Judge will accept an excel/csv file as an input file. The repository contains a sample input file for each type of LLM Judge that you can copy, edit, and use to test. They are located at: [JudgeIt-LLM-as-a-Judge/Framework/data/input](./Framework/data/input)

1. RAG Evaluation (Similarity): provide an excel/csv file with a `golden_text` column and `generated_text` column to compare
2. RAG Evaluation (Rating): provide an excel/csv file with a `golden_text` column and `generated_text` column to compare
3. Multi-turn Evaluation: provide an excel/csv file with the following columns: `previous_question`, `previous_answer`, `current_question`, `golden_rewritten_question`, and `rewritten_question`

Note: Your input files can contain additional columns than the ones specified above. These columns will have no effect on the LLM Judge and will be perserved in the output file.

## Understanding the Results

The generated results will be saved to an excel/csv file at the location specified in your config file. Each file will contain all the columns provided in the input file.

1. For RAG Evaluation (Similarity), the LLM Judge will output a `Grade` and `Explanation`. A grade of 0 means the texts are dissimilar, while a grade of 1 means the texts are similar.
2. For RAG Evaluation (Rating), the LLM Judge will output a `Grade` and `Explanation`. A grade of 1 means the texts are dissimilar, a grade of 2 means the texts are partially similar, and a text of 3 means the texts are significantly similar.
3. For Multi-turn Evaluation, the LLM Judge will output a `Grade`. A grade of 0 means the golden rewritten question and rewritten question are dissimilar, while a grade of 1 means the questions are similar.
