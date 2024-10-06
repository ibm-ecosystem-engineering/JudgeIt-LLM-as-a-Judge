# JudgeIt - An Auto Eval Framework for Scaling Gen AI Pipelines

The single biggest challenge in scaling any GenAI solution (like RAG, multi-turn conversations, or query rewriting) from PoC to production is the last-mile problem of evaluation. Statistical metrics (such as BLEU, ROUGE, or METEOR) have proven ineffective at accurately judging the quality of GenAI solutions, leaving human evaluation as the final step. However, human evaluation is slow and expensive, making it difficult to scale quickly. This is where 'JudgeIt' comes in—a framework designed to mimic human judgment with high precision and recall.

Accuracy and reliability are paramount when building Generative AI pipelines. Therefore, it is critical to establish robust evaluation frameworks to test these pipelines as they are built. While human evaluation may be accurate, it often takes a high degree of manual effort and is difficult to scale efficiently.

JudgeIt is an automated evaluation framework designed to accurately and efficiently assess various Generative AI pipelines, including RAG, multi-turn query rewriting, text-to-SQL conversion, and more. This service enables users to conduct batch evaluations across these different Generative AI pipelines. Users can input datasets containing generated text along with corresponding golden text. JudgeIt then employs an LLM as a judge to perform similarity evaluations between these inputs, providing an accurate assessment of the AI pipeline's performance.

<!-- ![JudgeIt Flow](/images/flow-diagram.png) -->
![Multiturn app batch](/images/multiturn-app-batch.gif)


## Features

- **Automated Evaluation**: JudgeIt automates batch evaluation processes, resulting in more efficient evaluation compared to human testers.
- **Multi-Pipeline Support**: Evaluate different types of LLM pipelines including:
  - **RAG**: evaluate generated text against golden text
  - **Multi-turn query rewritings**: evaluate rewritten queries given a multi-turn conversation
- **Customization**: Configure the evaluation process with your datasets, LLM models, and specific parameters.

## Reliability Metrics

To ensure reliability, JudgeIt has been tested against human evaluation for each RAG pipeline that it offers a judge for. For RAG evaluation, this process involved building a dataset of user queries, golden answers, RAG answers, and human evaluations of the similarity between the RAG and golden answers. Using Meta’s Llama-3–70b as an LLM Judge, JudgeIt was able to achieve the following accuracy metrics across different RAG pipeline evaluations compared to human evaluations.

![RAG Reliability scores](/images/RAG-reliability-testing.png)


For Multi-turn evaluation, this process involved building a dataset of user queries, conversation history including a previous question and previous answer, golden rewritten queries, generated rewritten queries, and human evaluations of the similarity between the generated rewritten queries and golden answers. Using Meta’s Llama-3–70b as an LLM Judge, JudgeIt was able to achieve the following accuracy metrics:

- Accuracy: 92%
- Precision: 96%
- Recall: 93%
- F1 Score: 95%

## What's Available?

### Types of Evaluation:

1. **RAG Evaluation (Similarity)**: evaluate generated text against golden text and receive a binary score for similarity
2. **RAG Evaluation (Rating)**: evaluate generated text against golden text and receive a 1/2/3 rating based on degree of similarity
3. **Multi-turn evaluation**: evaluate rewritten queries given a mult-turn conversation and receive a binary score for similarity


### Methods of using JudgeIt:

1. **Framework**: JudgeIt framework contains python modules to run evaluations and supports cli execution. The Framework method takes input data in the form of excel or csv files for any of these evaluations. View the [Framework Instructions](./Framework/README.md) for more detail.
2. **Service-Oriented Architecture (SOA)**: JudgeIt SOA contains a REST API backend and NextJS frontend to run evaluations via a UI. The SOA method takes input data in the form of excel/csv files or single inputs for any of these evaluations. View the [REST Service Instructions](./REST-Service/README.md) and [JudgeIt App Instructions](./JudgeIt-App/README.md) for more detail.

### Deployment Options:

1. **SaaS**: If you are using SaaS based LLM service (watsonx.ai), you can set the value of `wml_platform` as `saas` in the [Config](./Framework/config.ini) file.

![Framework SaaS](/images/LLM-judge-framework-saas.png)

2. **On Prem**: If you have an LLM deployed on premise on CP4D, you can set the value of `wml_platform` as `onpremise` in the [Config](./Framework/config.ini) file.

![Framework OnPremise](/images/llm-judge-framework-onpremise.png)

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
      1. [Framework Instructions](./Framework/README.md)
   2. Service-Oriented Architecture: first spin up a REST API backend, then spin up a NextJS frontend to run evaluations via a UI
      1. [REST Service Instructions](./REST-Service/README.md)
      2. [JudgeIt App Instructions](./JudgeIt-App/README.md)

## Team

### Created & Architected By

    Kunal Sawarkar, Distinguished Engineer- GenAI & Chief Data Scientist

### Builders

    Shivam Solanki, Senior Advisory Data Scientist
    Kevin Huang, Sr.- ML-Ops Engineer
    Abhilasha Mangal, Senior Data Scientist
    Himadri Talukder - Senior Software Engineer
    Anand Das- AI Engineer

Disclaimer

This framework as part of SuperKnowa project is developed by Build Lab, IBM Ecosystem. Please note that this content is made available to foster Embeddable AI technology adoption and serve ecosystem partners. SuperKnowa is not a product but a framework built on the top of IBM watsonx along with other products like LLAMA models from Meta. Using SuperKnowa implicitly requires agreeing to the Terms and conditions of those models. This framework is made available on an as-is basis to accelerate Enterprise GenAI applications development. In case of any questions, please reach out to kunal@ibm.com.

Copyright @ 2023 IBM Corporation.

## License

This project is licensed under the Apache-2.0 License. See the `LICENSE` file for more details.
