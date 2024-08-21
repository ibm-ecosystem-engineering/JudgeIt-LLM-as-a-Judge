import axios from "axios";
import {
  API_TYPE_MULTITURN,
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
  LLM_JUDGE_BASE_URL
} from "./Config";

/* SOLO API ENDPOINTS */
const API_RATING_URL = LLM_JUDGE_BASE_URL + "/api/v1/judge/rating";
const API_SIMLARITY_URL = LLM_JUDGE_BASE_URL + "/api/v1/judge/similarity";
const API_MULTITURN_URL = LLM_JUDGE_BASE_URL + "/api/v1/judge/multiturn";

/** Single request call*/
export async function judge_api_solo_call(payload) {
  try {
    if (payload.apiType === API_TYPE_RATING) {
      return rating_api_call(payload);
    } else if (payload.apiType === API_TYPE_SIMILARITY) {
      return similarity_api_call(payload);
    } else if (payload.apiType === API_TYPE_MULTITURN) {
      console.log(payload)
      return multiturn_api_call(payload);
    } else {
      throw "API not found";
    }
  } catch (error) {
    throw error;
  }
}

async function rating_api_call(payload) {
  try {
    const response = await axios.post(API_RATING_URL, payload);
    return response;
  } catch (error) {
    throw error;
  }
}

async function similarity_api_call(payload) {
  try {
    const response = await axios.post(API_SIMLARITY_URL, payload);
    return response;
  } catch (error) {
    throw error;
  }
}

async function multiturn_api_call(payload) {
  try {
    const response = await axios.post(API_MULTITURN_URL, payload);
    return response;
  } catch (error) {
    throw error;
  }
}
