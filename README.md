# JudgeIt - Auto Evaluation Framework for LLM/Generative AI Pipelines

## Introduction

JudgeIt is an automated evaluation framework designed for various LLM/Generative AI pipelines such as RAG evaluation, Multi-turn query rewrite evaluation, Text to SQL evaluation, etc. It utilizes LLMs as a judge to augment or replace human-in-the-loop evaluations, significantly accelerating the assessment of multiple experiments and LLM pipelines. Compared to human evaluation, our LLM-judge is very accurate:
![Judge-accuracy](/images/Judge-accuracy.png)


## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Features](#features)
4. [Dependencies](#dependencies)
5. [Configuration](#configuration)
6. [Documentation](#documentation)
7. [Examples](#examples)
8. [Troubleshooting](#troubleshooting)
9. [Contributors](#contributors)
10. [License](#license)

## Installation

To get started with JudgeIt, clone the repository and install the necessary dependencies.

```bash
git clone <repository-url>
cd JudgeIt
pip install -r requirements.txt
```

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

![Features](/images/Features.png)


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

