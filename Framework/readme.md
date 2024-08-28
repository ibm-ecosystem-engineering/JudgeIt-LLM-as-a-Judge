<!-- ABOUT THE PROJECT -->

# JudgeIt Framework

## Table of Contents

- [JudgeIt Framework](#judgeit-framework)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Configuring your Input File](#configuring-your-input-file)
  - [Understanding the Results](#understanding-the-results)

One method of using JudgeIt is through the JudgeIt Python framework. The framework contains Python modules for different types of LLM Judge evaluations. There are three types of evaluation currently available:

1. RAG Evaluation (Similarity)
2. RAG Evaluation (Rating)
3. Multi-turn evaluation

The JudgeIt framework takes input data in the form of excel or csv files for any of these evaluations.

![LLM-Judges](/images/flow-diagram.png)

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

The following prerequisites are required to run the tester:

1. Python3
2. IBM Cloud api key (this must be for the same cloud account that hosts the watsonx.ai instance)

### Installation

1. Clone the repo

   ```bash
   git clone <repository url>
   ```

2. Change directory into the JudgeIt Framework

   ```bash
   cd JudgeIt-LLM-as-a-Judge/Framework
   ```

3. Create a python virtual environment

   ```bash
   python3 -m venv virtual-env
   source virtual-env/bin/activate
   pip3 install -r requirements.txt
   ```

4. Configure your parameters in config.ini. Below is a sample config file

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
      1. a sample input file for each evaluation type is located in JudgeIt-LLM-as-a-Judge/data/input
      2. see [Configuring Your Input File](#configuring-your-input-file) for more details
   4. `output_file_name`: specify the name of your output file
   5. `judge_type`: specify the LLM Judge type. Possible values:
      1. `rag_eval_answer_similarity`
      2. `rag_eval_answer_rating`
      3. `multi_turn_eval`
   6. `wml_url`: you watsonx.ai url: https://<your_region>.ml.cloud.ibm.com
   7. `api_key`: your IBM Cloud apikey: <https://cloud.ibm.com/iam/apikeys>
   8. `project_id`: you watsonx.ai project id: watsonx.ai project's Manage tab (Project -> Manage -> General -> Details)

5. Run the following to evaluate

   ```bash
   python main.py --config path_to_config_file
   ```

6. Run the following command to exit the python virtual environment:

   ```bash
   deactivate
   ```

## Configuring your Input File

Each type of LLM Judge will accept an excel/csv file as an input file. The repository contains a sample input file for each type of LLM Judge that you can copy, edit, and use to test. They are located at: JudgeIt-LLM-as-a-Judge/data/input

1. RAG Evaluation (Similarity): provide an excel/csv file with a `golden_text` column and `generated_text` column to compare
2. RAG Evaluation (Rating): provide an excel/csv file with a `golden_text` column and `generated_text` column to compare
3. Multi-turn Evaluation: provide an excel/csv file with the following columns: `previous_question`, `previous_answer`, `current_question`, `golden_rewritten_question`, and `rewritten_question`

Note: Your input files can contain additional columns than the ones specified above. These columns will have no effect on the LLM Judge and will be perserved in the output file.

## Understanding the Results

The generated results will be saved to an excel/csv file at the location specified in your config file. Each file will contain all the columns provided in the input file.

1. For RAG Evaluation (Similarity), the LLM Judge will output a `Grade` and `Explanation`. A grade of 0 means the texts are dissimilar, while a grade of 1 means the texts are similar.
2. For RAG Evaluation (Rating), the LLM Judge will output a `Grade` and `Explanation`. A grade of 1 means the texts are dissimilar, a grade of 2 means the texts are partially similar, and a text of 3 means the texts are significantly similar.
3. For Multi-turn Evaluation, the LLM Judge will output a `Grade`. A grade of 0 means the golden rewritten question and rewritten question are dissimilar, while a grade of 1 means the questions are similar.
