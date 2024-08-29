import axios from "axios";
import {
  API_TYPE_MULTITURN,
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
  LLM_JUDGE_BASE_URL,
  API_TYPE_KEY,
  LLM_JUDGE_API_KEY_SECRET
} from "./Config";

/* BATCH API ENDPOINTS */
const API_RATING_BATCH_URL = LLM_JUDGE_BASE_URL + "/api/v1/judge/rating/batch";
const API_SIMLARITY_BATCH_URL =
  LLM_JUDGE_BASE_URL + "/api/v1/judge/similarity/batch";
const API_MULTITURN_BATCH_URL =
  LLM_JUDGE_BASE_URL + "/api/v1/judge/multiturn/batch";

const config = {
    headers: {
      'accept': 'application/json',
      'LLM_JUDGE_API_KEY': LLM_JUDGE_API_KEY_SECRET,
      'Content-Type': 'multipart/form-data'
    }
  };

/** Single request call*/
export async function judge_api_batch_call(payload) {
  const api_type = payload.get(API_TYPE_KEY);

  try {
    if (api_type === API_TYPE_RATING) {
      return await rating_batch_api_call(payload);
    } else if (api_type === API_TYPE_SIMILARITY) {
      return similarity_batch_api_call(payload);
    } else if (api_type === API_TYPE_MULTITURN) {
      return multiturn_batch_api_call(payload);
    } else {
      throw "Batch API not found";
    }
  } catch (error) {
    throw error;
  }
}

async function rating_batch_api_call(formData) {
  const response = await axios.post(
    API_RATING_BATCH_URL + "?model_name=" + formData.get("model"),
    formData,
    config
  );
  return response;
}

async function similarity_batch_api_call(formData) {
  const response = await axios.post(
    API_SIMLARITY_BATCH_URL + "?model_name=" + formData.get("model"),
    formData,
    config
  );
  return response;
}

async function multiturn_batch_api_call(formData) {
  const response = await axios.post(
    API_MULTITURN_BATCH_URL,
    formData,
    config
  );
  return response;
}
