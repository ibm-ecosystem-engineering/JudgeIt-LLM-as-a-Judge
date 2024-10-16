export const APP_VERSION = "Alpha-1.0 version";
export const LLM_JUDGE_BASE_URL =
  process.env.NEXT_PUBLIC_JUDGE_BACKEND_URL || process.env.JUDGE_BACKEND_URL;
export const LLM_JUDGE_BATCH_EVENT_URL =
  LLM_JUDGE_BASE_URL + "/api/v1/judge/events/";
export const LLM_JUDGE_DOWNLOAD_EVALUATION_URL =
  LLM_JUDGE_BASE_URL + "/api/v1/judge/download/";
export const LLM_JUDGE_MANAGEMENT_API_URL =
  LLM_JUDGE_BASE_URL + "/api/v1/manage/";

export const API_TYPE_KEY = "apiType";
export const API_TYPE_RATING = "rating";
export const API_TYPE_SIMILARITY = "similarity";
export const API_TYPE_MULTITURN = "multiturn";

export const LLM_JUDGE_API_KEY_SECRET =
  process.env.NEXT_PUBLIC_LLM_JUDGE_API_KEY || process.env.LLM_JUDGE_API_KEY;

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
    value: "meta-llama/llama-3-70b-instruct",
    label: "llama-3-70b-instruct (Recommended)",
  },
  {
    value: "meta-llama/llama-3-1-70b-instruct",
    label: "llama-3-1-70b-instruct"
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
