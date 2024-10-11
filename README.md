# JudgeIt (From SuperKnowa)- Automatic Eval Framework for Gen AI Pipelines

The single biggest challenge in scaling any GenAI solution (such as RAG, multi-turn conversations, or query rewriting) from PoC to production is the last-mile problem of evaluation. Statistical metrics (like BLEU, ROUGE, or METEOR) have proven ineffective at accurately judging the quality of GenAI solutions, leaving human evaluation as the only reliable option for Enterprises. However, human evaluation is slow and expensive, making it impossible to scale quickly. This is where 'JudgeIt' comes in—a framework designed to mimic human judgment with equally high precision and recall.

JudgeIt is an automated evaluation framework built to accurately and efficiently assess various Generative AI pipelines, including RAG, multi-turn query rewriting (conversation memory), text-to-SQL conversion, and more. This service allows users to conduct batch evaluations across these different Generative AI pipelines. Users can input datasets containing generated text along with corresponding golden text. JudgeIt then employs an LLM-as-a-judge to perform similarity evaluations between these inputs, mimicking human evaluation and providing an accurate assessment of the GenAI pipeline's performance.

his results in saving 30 times the time spent on manual testing for each RAG pipeline version, allowing AI engineers to run 10 times more experiments and achieve the desired accuracy much faster.


<!-- ![JudgeIt Flow](/images/flow-diagram.png) -->
![Multiturn app batch](/images/multiturn-app-batch.gif)


## JudgeIt 

JudgeIt automates evaluation processes so that it can be run in batch mode and over thousands of Q&A pairs, resulting in more efficient evaluation compared to human testers.
- **Multi-Pipeline Support**: Evaluate different types of GenAI pipelines including:
  - **RAG**: evaluate LLM generated text against golden text /expected text
  - **Multi-turn query rewritings**: evaluate rewritten queries given a multi-turn conversation
- **Customization**: Configure the evaluation process with your datasets, LLM models, and specific parameters.
- **Embeddable**: Easily embed framework in your env either as python based job or consume as user application
- **Portable-UserApp**: SOA architecture based user app can be deployed anywhere in lightweight manner
- **Run-Anywhere**: Open architecture to deploy anywhere, be it on Cloud, Hybrid Cloud or On-prem in airgap env.
- **Expandable**: Preset for Llama models and IBM watsonx platform and open source which can be easily extended to any model from HuggingFace.

## Reliability Testing

So just how reliable is this framework compared to humans?"

To ensure reliability, the JudgeIt framework has been rigorously tested against human evaluations across various RAG pipelines and multi-turn query rewrite tasks. The framework is designed to be conservative, favoring false negatives over false positives. This approach means that the actual accuracy, as observed in numerous experiments, tends to be slightly higher than the accuracy predicted by the framework.

#### RAG Evalution Reliability Metrics
For RAG evaluation, this process involved building a dataset of thousands of real-life Q&A pairs in Enterprise setting, then collected golden answers, RAG answers, and human evaluations of the similarity between the RAG and golden answers. Using Meta’s Llama-3–70b as an LLM Judge, JudgeIt was able to achieve the following accuracy metrics across different RAG pipeline evaluations compared to human evaluations with huge diversity of underlying pairs. 

![RAG Reliability scores](/images/RAG-reliability-testing.png)

#### Query-Rewrite Evaluation Reliability Metrics (2 Turn)
For Multi-turn evaluation, this process involved building a dataset of user queries, conversation memory history including a previous question and previous answer, golden rewritten queries, generated rewritten queries, and human evaluations of the similarity between the generated rewritten queries and golden answers. Using Meta’s Llama-3–70b as an LLM Judge, JudgeIt was able to achieve the following accuracy metrics:

- Accuracy: 92%
- Precision: 96%
- Recall: 93%
- F1 Score: 95%

## Using JudgIt Framework

Using JudgeIt framework is simple, just pick what is the task you want to evaluate (RAG or multi-turn query rewrite), then LLM which you wish to employ as a judge and you are all set. 

### Types of Evaluation:

1. **RAG Evaluation (Similarity)**: evaluate generated text against golden text and receive a binary score for similarity
2. **RAG Evaluation (Rating)**: evaluate generated text against golden text and receive a 1/2/3 rating based on degree of similarity
3. **Multi-turn evaluation**: evaluate rewritten queries given a mult-turn conversation and receive a binary score for similarity


### Two Flavors of using JudgeIt:

1. **Python-Framework**: JudgeIt framework contains python modules to run evaluations and supports CLI execution. The Framework method takes input data in the form of excel or csv files for any of these evaluations. View the [Framework Instructions](./Framework/README.md) for more detail.
2. **GUI-Application**: JudgeIt SOA based application contains a REST API backend and NextJS frontend to run evaluations via a UI. The SOA method takes input data in the form of excel/csv files or single inputs for any of these evaluations. View the [REST Service Instructions](./REST-Service/README.md) and [JudgeIt App Instructions](./JudgeIt-App/README.md) for more detail.

### JudgeIt Deployment Options:

1. **SaaS**: If you are using SaaS based LLM service (for example watsonx.ai), you can set the value of `wml_platform` as `saas` in the [Config](./Framework/config.ini) file.

![Framework SaaS](/images/LLM-judge-framework-saas.png)

2. **On Prem**: If you have an LLM deployed on premise (for example on CP4D), you can set the value of `wml_platform` as `onpremise` in the [Config](./Framework/config.ini) file.

![Framework OnPremise](/images/llm-judge-framework-onpremise.png)

## Getting Started

### Installation

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

### Coming Soon (Product Backlog)

- [x] Llama 3.0 -70B as Judge model
- [ ] Llama 3.1 -70B as Judge model
- [ ] Mixtral-Large as Judge Model
- [ ] Text2Sql Task support
- [ ] Liberal vs Conservative Judge Options for verbose vs crisp RAG comparison
- [ ] Query-Rewrite support for More-than 2 turn

**Known-Limitation** : We found that the framework sometimes becomes extremely conservative when there is a large gap between the size of the golden text and the generated text. For RAG comparisons, if the golden text is one page long and the generated text is just a few lines, it tends to treat them as dissimilar. We are currently working on a more 'liberal' version of this judge, which will be released soon.

## SuperKnowa
JudgeIt is the latest framework from the SuperKnowa project. Do check out our other repos for building RAG pipelines. text2sql etc. here. 


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

This framework as part of SuperKnowa project is developed by Build Lab, IBM Ecosystem. Please note that this content is made available to foster Embeddable AI technology adoption and serve ecosystem partners. SuperKnowa is not a product but a framework built on the top of IBM watsonx along with other products like LLAMA models from Meta. Using SuperKnowa implicitly requires agreeing to the Terms and conditions of those models. This framework is made available on an as-is basis to accelerate Enterprise GenAI applications development with any liability for support. In case of any questions, please reach out to kunal@ibm.com.

Copyright @ 2023 IBM Corporation.

## License

This project is licensed under the Apache-2.0 License. See the `LICENSE` file for more details.
