<!-- omit in toc -->
# JudgeIt - An Auto Evaluation Framework for Generative AI Pipelines

JudgeIt is an automated evaluation framework designed for various Generative AI pipelines such as RAG Evaluation, Multi-Turn Query Rewrite evaluation, Text-to-SQL Evaluation, and more. It utilizes an LLM Judge to accurately and efficiently evaluate experiments and LLM pipelines. The LLM Judges used in this framework have been evaluated

<!-- omit in toc -->
## Table of Contents

- [Features](#features)
- [Reliability Metrics](#reliability-metrics)
- [Installation](#installation)
- [Contributors](#contributors)
- [License](#license)

## Features

- **Automated Evaluation**: JudgeIt automates the evaluation process, reducing the need for human evaluators.
- **Multi-Pipeline Support**: Evaluate different types of LLM pipelines including RAG, multi-turn queries, and text-to-SQL conversions.
- **Customizable**: Configure the evaluation process with your datasets, LLM models, and specific parameters.

![Features](/images/features.png)

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

2. Select a method to spin up the JudgeIt service:
   1. Framework: Use Python modules and the cli to run evaluations locally
      1. [Framework Instructions](./Framework/README.md)
   2. Service-Oriented Architecture: first spin up a REST API backend then spin up a NextJS frontend to run evaluations via a UI
      1. [REST Service Instructions](./Rest-Service/README.md)
      2. [JudgeIt App Instructions](./JudgeIt-App/README.md)

## Contributors

- Kunal Sawarkar, Chief Data Scientist
- Shivam Solanki, Senior Advisory Data Scientist
- Anand Das, Technology Engineer
- Himadri Talukder - Senior Software Engineer
- Abhilasha Mangal, Senior Data Scientist
- Kevin Huang, Sr. ML-Ops Engineer

## License

This project is licensed under the Apache-2.0 License. See the `LICENSE` file for more details.
