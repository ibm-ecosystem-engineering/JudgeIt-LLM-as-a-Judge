<!-- ABOUT THE PROJECT -->

<!-- omit in toc -->
# JudgeIt Application

One method of using JudgeIt is through a Service-Oriented Architecture (SOA). This directory contains the code for a React-based application that provides a user interface for interacting with the LLM Judge service. It is built on the Next.js framework and integrates with IBM App ID for authentication. There are three types of evaluation currently available:

1. **RAG Evaluation (Similarity)**: evaluate generated text against golden text
2. **RAG Evaluation (Rating)**: evaluate generated text against golden text
3. **Multi-turn evaluation**: evaluate rewritten queries given a mult-turn conversation

The JudgeIt framework takes input data in the form of excel or csv files for any of these evaluations.

![LLM-Judges](/images/flow-diagram.png)

<!-- omit in toc -->
## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Configuring your Input File](#configuring-your-input-file)
- [Understanding the Results](#understanding-the-results)

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

The following prerequisites are required to run the tester:

1. [JudgeIt Backend REST Service](/REST-Service/README.md) is up and running
2. [Node.js](https://nodejs.org/en) v18 or higher
3. [IBM AppID](https://www.ibm.com/products/app-id) for application authentication

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
