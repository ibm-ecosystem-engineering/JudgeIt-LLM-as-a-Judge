export const APP_VERSION = "Alpha-1.0 version";
//export const LLM_JUDGE_BASE_URL = "https://llm-judge-backend-llm-judge.roks-dsce2v-13d45cd84769aede38d625cd31842ee0-0000.us-south.containers.appdomain.cloud";
export const LLM_JUDGE_BASE_URL = "http://localhost:3001";
export const LLM_JUDGE_BATCH_EVENT_URL =
  LLM_JUDGE_BASE_URL + "/api/v1/judge/events/";
export const LLM_JUDGE_DOWNLOAD_EVALUATION_URL =
  LLM_JUDGE_BASE_URL + "/api/v1/judge/download/";
export const LLM_JUDGE_MANAGEMENT_API_URL =
  LLM_JUDGE_BASE_URL + "/api/v1/manage/";

export const API_TYPE_KEY = "apiType";
export const API_TYPE_RATING = "rating";
export const API_TYPE_SIMILARITY = "similarity";
export const API_TYPE_SINGLETURN = "singleturn";
export const API_TYPE_MULTITURN = "multiturn";
export const API_TYPE_WBOX_SDR = "whitebox_sdrflow";
export const API_TYPE_BBOX_SDR = "blackbox_sdrflow";
export const API_TYPE_AGENT = "agent_sdrflow";

export const LLM_JUDGE_API_KEY_SECRET = "JudgeIt-Secret-Api-Key";

export const LLM_MODELS = [
  /*
    {
        value: "MIXTRAL",
        label: "MIXTRAL"
    },
    {
        value: "GPT",
        label: "GPT"
    },
    */
  {
    value: "meta-llama/llama-3-3-70b-instruct",
    label: "llama-3-3-70b-instruct (Recommended)",
  },
  {
    value: "meta-llama/llama-3-3-70b-instruct",
    label: "llama-3-3-70b-instruct"
  },
];

export const GITHUB_SOURCE_CODE =
  "https://github.com/ibm-ecosystem-engineering/JudgeIt-LLM-as-a-Judge";
export const GITHUB_REPORT_ISSUE =
  "https://github.com/ibm-ecosystem-engineering/JudgeIt-LLM-as-a-Judge/issues";

export const rag_similarity_display = [
  "Evaluate generated text against golden text and receive a binary score for similarity",
  "The LLM Judge will output a Grade and Explanation. A grade of 0 means the texts are dissimilar, while a grade of 1 means the texts are similar.",
];

export const rag_rating_display = [
  "Evaluate generated text against golden text and receive a 1/2/3 rating based on degree of similarity",
  "The LLM Judge will output a Grade and Explanation. A grade of 1 means the texts are dissimilar, a grade of 2 means the texts are partially similar, and a text of 3 means the texts are significantly similar.",
];

export const multi_turn_display = [
  "Evaluate rewritten queries given a mult-turn conversation and receive a binary score for similarity",
  "The LLM Judge will output a Grade. A grade of 0 means the golden rewritten question and rewritten question are dissimilar, while a grade of 1 means the questions are similar.",
];

export const wbox_display = [
  "Evaluate generated agent thought trail and workflow execution on a 0/1 rating. 1 means the workflow is executing as expected; 0 means it does not.",
  "The LLM Judge will output a score.",
];

export const bbox_display = [
  "Evaluate generated agent outputs against golden text. It evaluates Chrono, Product, and Research agents on 0/1 rating and Comms Agent on 1/2/3 rating based on degree of similarity",
  "The LLM Judge will output a Grade and Explanation. A grade of 1 means the texts are dissimilar, a grade of 2 means the texts are partially similar, and a text of 3 means the texts are significantly similar.",
];

export const agent_display = [
  "Evaluate generated agent outputs for both black box (LLM-as-a-judge) as well as white box (workflow)",
  "The LLM Judge will output a set of grades for the different agents as well as for overall workflow.",
];

export const grade_map_rating = {
  1: "Incorrect",
  2: "Partially correct",
  3: "Correct",
};

export const grade_map_similarity = {
  0: "Incorrect",
  1: "Correct",
};

export const grade_map_multiturn = {
  0: "Incorrect",
  1: "Correct",
};


export const app_labels_and_config = {
  app_version: "Alpha-1.0 version",
  app_title: "JudgeIt",
  app_subtitle: "LLM as a Judge",
  logo_text: "Ecosystem Engineering",
  buttons: {
    single_page_action: "Single answer evaluation",
    batch_page_action: "Batch evaluation",
  },
  home_page_panel_title: {
    similarity_panel: "RAG Evaluation (Similarity)",
    rating_panel: "RAG Evaluation (Rating)",
    multiturn_panel: "Multi-turn evaluation",
    home_page_intro:
      "JudgeIt is an automated evaluation framework designed for testing various Generative AI pipelines such as RAG, Multi-Turn Query Rewriting, Text-to-SQL, and more. This service utilizes an LLM Judge to accurately and efficiently evaluate generated text against provided golden text. Try evaluating a single input or a batch of inputs by clicking one of the options below!",
  },
  pages: {
    batch_evaluation_page_title: "Batch Evaluation",
    single_evaluation_page_title: "Single Answer Evaluation",
    graph_title: "Grade Distribution",
  },
  github: "https://github.com/ibm-ecosystem-engineering/JudgeIt-LLM-as-a-Judge",
  github_issues:
    "https://github.com/ibm-ecosystem-engineering/JudgeIt-LLM-as-a-Judge/issues",
};
