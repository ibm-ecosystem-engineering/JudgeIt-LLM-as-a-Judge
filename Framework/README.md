<!-- ABOUT THE PROJECT -->

<!-- omit in toc -->
# JudgeIt Framework

One method of using JudgeIt is through the JudgeIt Python framework. The framework contains Python modules for different types of LLM Judge evaluations. There are three types of LLM Judges:

1. **RAG Evaluation (Similarity)**: evaluate generated text against golden text
2. **RAG Evaluation (Rating)**: evaluate generated text against golden text
3. **Multi-turn evaluation**: evaluate rewritten queries given a mult-turn conversation

The JudgeIt framework takes input data in the form of excel or csv files for any of these evaluations.

![LLM-Judges](/images/flow-diagram.png)

<!-- omit in toc -->
## Table of Contents

- [Deployment Option](#deployment-options)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage Example](#usage-example)
- [Configuring your Input File](#configuring-your-input-file)
- [Understanding the Results](#understanding-the-results)

<!-- GETTING STARTED -->

## Deployment Options:

1. **SaaS**: If you are using SaaS based LLM service (watsonx.ai), you can set the value of `wml_platform` as `saas` in the [Config](./Framework/config.ini) file.

![Framework SaaS](/images/LLM-judge-framework-saas.png)

2. **On Prem**: If you have an LLM deployed on premise on CP4D, you can set the value of `wml_platform` as `onpremise` in the [Config](./Framework/config.ini) file.

![Framework OnPremise](/images/LLM-judge-framework-onpremise.png)

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

2. Configure your parameters in config.ini. This repository contains the below sample_config.ini that you can paste and edit:

   ```bash
   [Default]
   home_dir = /home_directory/JudgeIt-LLM-as-a-Judge/
   model_id = meta-llama/llama-3-70b-instruct
   input_file_name = Framework/data/input/sample_rag_answer_similarity_input.xlsx
   output_file_name = Framework/data/output/sample_rag_answer_similarity_output.xlsx
   judge_type = rag_eval_answer_similarity

   [WML_CRED]
   wml_platform = saas
   wml_user = ''
   wml_url = https://us-south.ml.cloud.ibm.com
   api_key = ibm_cloud_api_key
   project_id = watsonx.ai_project_id
   ```

   1. `home_dir`: the path to the folder where you have downloaded the repository
   2. `model_id`: the watsonx.ai model id that will be used for your LLM Judge. We recommend `meta-llama/llama-3-70b-instruct`
   3. `input_file_name`:
      1. specify the path and name of your inputfile
      2. a sample input file for each evaluation type is located in [JudgeIt-LLM-as-a-Judge/Framework/data/input](./data/input)
      3. see [Configuring Your Input File](#configuring-your-input-file) for more details
   4. `output_file_name`: specify the path and name of your output file
   5. `judge_type`: specify the LLM Judge type. Possible values:
      1. `rag_eval_answer_similarity`
      2. `rag_eval_answer_rating`
      3. `multi_turn_eval`
   6. `wml_platform`: There are two options available: `saas` or `onpremise`. If you're using the IBM Watsonx platform, choose `saas`, but if you're using the on-premise Watsonx platform on CP4D, select `onpremise`.
   7. `wml_url`: you watsonx.ai url: https://<your_region>.ml.cloud.ibm.com
   8. `wml_user`: wml user is required when you choose the platform `onpremise`
   9. `api_key`: your IBM Cloud apikey: <https://cloud.ibm.com/iam/apikeys>
   10. `project_id`: you watsonx.ai project id: watsonx.ai project's Manage tab (Project -> Manage -> General -> Details)

3. Run the following to evaluate.

   ```bash
   python main.py
   ```

   The output of the evaluation will be printed in your terminal, and a copy of the results will be saved to /JudgeIt-LLM-as-a-Judge/Framework/data/output
4. Run the following command to exit the python virtual environment:

   ```bash
   deactivate
   ```

## Usage Example
![Multi-turn framework](/images/multiturn-framework.gif)

## Configuring your Input File

Each type of LLM Judge will accept an excel/csv file as an input file. The repository contains a sample input file for each type of LLM Judge that you can copy, edit, and use to test. They are located at: [JudgeIt-LLM-as-a-Judge/Framework/data/input](./data/input)

1. RAG Evaluation (Similarity): provide an excel/csv file with a `golden_text` column and `generated_text` column to compare
2. RAG Evaluation (Rating): provide an excel/csv file with a `golden_text` column and `generated_text` column to compare
3. Multi-turn Evaluation: provide an excel/csv file with the following columns: `previous_question`, `previous_answer`, `current_question`, `golden_rewritten_question`, and `rewritten_question`

Note: Your input files can contain additional columns than the ones specified above. These columns will have no effect on the LLM Judge and will be perserved in the output file.

## Understanding the Results

The generated results will be saved to an excel/csv file at the location specified in your config file. Each file will contain all the columns provided in the input file.

1. For RAG Evaluation (Similarity), the LLM Judge will output a `Grade` and `Explanation`. A grade of 0 means the texts are dissimilar, while a grade of 1 means the texts are similar.
2. For RAG Evaluation (Rating), the LLM Judge will output a `Grade` and `Explanation`. A grade of 1 means the texts are dissimilar, a grade of 2 means the texts are partially similar, and a text of 3 means the texts are significantly similar.
3. For Multi-turn Evaluation, the LLM Judge will output a `Grade`. A grade of 0 means the golden rewritten question and rewritten question are dissimilar, while a grade of 1 means the questions are similar.
