<!-- omit in toc -->
# JudgeIt - An Auto Evaluation Framework for Generative AI Pipelines

JudgeIt is an automated evaluation framework designed for various Generative AI pipelines such as RAG Evaluation, Multi-Turn Query Rewrite evaluation, Text-to-SQL Evaluation, and more. It utilizes an LLM Judge to accurately and efficiently evaluate experiments and LLM pipelines. The LLM Judges used in this framework have been evaluated

<!-- omit in toc -->
## Table of Contents

- [Reliability Metrics](#reliability-metrics)
- [Installation](#installation)
  - [Method 1: Framework](#method-1-framework)
  - [Method 2: Service-Oriented Architecture](#method-2-service-oriented-architecture)
  - [Installing Dependencies](#installing-dependencies)
- [Usage](#usage)
  - [Step 1: Configure Your Environment](#step-1-configure-your-environment)
  - [Step 2: Running Evaluations](#step-2-running-evaluations)
  - [Step 3: Review Results](#step-3-review-results)
- [Features](#features)
- [Dependencies](#dependencies)
- [Configuration](#configuration)
- [Documentation](#documentation)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributors](#contributors)
- [License](#license)

## Reliability Metrics

The LLM Judges in this repository have been tested against human evaluation to validate their reliability.

1. Multi-turn Query Rewrite Evaluation
![Multi-turn Evaluation Reliability](/images/multi-turn-evaluation-reliability.png)
2. RAG Evaluation
![RAG Evaluation Reliability](/images/rag-evaluation-reliability.png)

## Installation

There are two primary methods to spin up the JudgeIt service.

### Method 1: Framework

Use Python modules and the cli to run evaluations locally.

To spin up JudgeIt using the Framework method, go to the [Framework Instructions](./Framework/README.md)

### Method 2: Service-Oriented Architecture

Use a REST API backend and NextJS frontend to run evaluations via a UI.

To spin up JudgeIt using the Service-Oriented Architecture method, go to:

1. [REST Service Instructions](./Rest-Service/README.md)
2. [JudgeIt App Instructions](./JudgeIt-App/README.md)

### Installing Dependencies

All dependencies required for the project are listed in the `requirements.txt` file. These include libraries for interacting with IBM Watson, data processing, and machine learning.

```plaintext
certifi==2024.6.2
charset-normalizer==3.3.2
click==8.1.7
ibm-cos-sdk==2.13.5
ibm-cos-sdk-core==2.13.5
ibm-cos-sdk-s3transfer==2.13.5
ibm_watson_machine_learning==1.0.359
ibm_watsonx_ai==1.0.10
...
```

## Usage

JudgeIt can be used to automate the evaluation process of different LLM pipelines. Below are the step-by-step instructions on how to use the framework:

### Step 1: Configure Your Environment

Make sure that your environment is set up correctly by configuring the necessary parameters in the `config.ini` file. This includes setting up your IBM Watson credentials, specifying the dataset paths, and other configuration options.

### Step 2: Running Evaluations

Run the evaluation by executing the main Python script:

```bash
python main.py --config path_to_config_file
```

This script initiates the evaluation process, using LLMs as judges to provide scores and feedback for each test case.

### Step 3: Review Results

Results will be generated and stored in the specified output directory. These results can be analyzed to determine the performance of various LLM pipelines.

## Features

- **Automated Evaluation**: JudgeIt automates the evaluation process, reducing the need for human evaluators.
- **Multi-Pipeline Support**: Evaluate different types of LLM pipelines including RAG, multi-turn queries, and text-to-SQL conversions.
- **Customizable**: Configure the evaluation process with your datasets, LLM models, and specific parameters.

![Features](/images/features.png)

## Dependencies

JudgeIt relies on several Python packages, all of which are specified in the `requirements.txt` file. Notable dependencies include:

- **ibm_watson_machine_learning**
- **nltk**
- **scikit-learn**
- **pandas**
- **numpy**

Refer to the `requirements.txt` file for the complete list.

## Configuration

Before running the framework, ensure that the `config.ini` file is properly configured. This file includes settings for:

- IBM Watson API credentials
- Paths to datasets and models
- Evaluation parameters

## Documentation

The framework’s documentation is provided within the codebase, including docstrings in the Python scripts. Additionally, example configurations and usage instructions are included.

## Examples

To better understand how to use JudgeIt, several example configurations and datasets are provided in the `examples/` directory. These examples demonstrate the framework’s capabilities across different types of evaluations.

## Troubleshooting

If you encounter issues while using JudgeIt, consider the following:

- Ensure all dependencies are installed.
- Verify the configuration settings in `config.ini`.
- Check the logs generated during execution for any errors or warnings.

## Contributors

- Kunal Sawarkar, Chief Data Scientist
- Shivam Solanki, Senior Advisory Data Scientist
- Anand Das, Technology Engineer
- Himadri Talukder - Senior Software Engineer
- Abhilasha Mangal, Senior Data Scientist
- Kevin Huang, Sr. ML-Ops Engineer

## License

This project is licensed under the Apache-2.0 License. See the `LICENSE` file for more details.
