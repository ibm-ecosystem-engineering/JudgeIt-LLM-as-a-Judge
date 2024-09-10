export const APP_VERSION = "Alpha-1.0 version"
export const LLM_JUDGE_BASE_URL = process.env.NEXT_PUBLIC_JUDGE_BACKEND_URL || process.env.JUDGE_BACKEND_URL;
export const LLM_JUDGE_BATCH_EVENT_URL = LLM_JUDGE_BASE_URL + "/api/v1/judge/events/";
export const LLM_JUDGE_DOWNLOAD_EVALUATION_URL = LLM_JUDGE_BASE_URL + "/api/v1/judge/download/"
export const LLM_JUDGE_MANAGEMENT_API_URL = LLM_JUDGE_BASE_URL + "/api/v1/manage/"

export const API_TYPE_KEY = "apiType";
export const API_TYPE_RATING = "rating";
export const API_TYPE_SIMILARITY = "similarity";
export const API_TYPE_MULTITURN = "multiturn";

export const LLM_JUDGE_API_KEY_SECRET=process.env.NEXT_PUBLIC_LLM_JUDGE_API_KEY || process.env.LLM_JUDGE_API_KEY;

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
        label: "llama-3-70b-instruct"
    }
];

export const GITHUB_SOURCE_CODE = "https://github.com/ibm-ecosystem-engineering/JudgeIt-LLM-as-a-Judge";
export const GITHUB_REPORT_ISSUE = "https://github.com/ibm-ecosystem-engineering/JudgeIt-LLM-as-a-Judge/issues";