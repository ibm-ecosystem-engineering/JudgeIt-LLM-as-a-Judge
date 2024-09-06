import axios from "axios";
import {
  API_TYPE_MULTITURN,
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
  LLM_JUDGE_BASE_URL,
  LLM_JUDGE_API_KEY_SECRET,
  LLM_JUDGE_MANAGEMENT_API_URL,
} from "./Config";

/* SOLO API ENDPOINTS */
const API_RATING_URL = LLM_JUDGE_BASE_URL + "/api/v1/judge/rating";
const API_SIMLARITY_URL = LLM_JUDGE_BASE_URL + "/api/v1/judge/similarity";
const API_MULTITURN_URL = LLM_JUDGE_BASE_URL + "/api/v1/judge/multiturn";

const config = {
  headers: {
    accept: "application/json",
    LLM_JUDGE_API_KEY: LLM_JUDGE_API_KEY_SECRET,
    "Content-Type": "application/json",
  },
};

/** Single request call*/
export async function judge_api_solo_call(payload) {
  try {
    if (payload.apiType === API_TYPE_RATING) {
      return await rating_api_call(payload);
    } else if (payload.apiType === API_TYPE_SIMILARITY) {
      return await similarity_api_call(payload);
    } else if (payload.apiType === API_TYPE_MULTITURN) {
      return await multiturn_api_call(payload);
    } else {
      throw "API not found";
    }
  } catch (error) {
    throw error;
  } finally {
  }
}

async function create_experiment(payload) {
  console.log(payload, "inside create");
  if (payload.experiment_option === "new_experiment") {
    const headers = {
      accept: "application/json",
      "user-id": payload.user_id,
      LLM_JUDGE_API_KEY: LLM_JUDGE_API_KEY_SECRET,
      "Content-Type": "application/json",
    };

    const url = LLM_JUDGE_MANAGEMENT_API_URL + "experiment";

    const data = {
      name: payload.new_experiment,
      user_id: payload.user_id,
      type: "single",
    };

    console.log(data, "inside d create");

    try {
      await axios.post(url, data, { headers });
    } catch (error) {}
  }
}

async function save_request_history(payload, result) {
  const headers = {
    accept: "application/json",
    "Content-Type": "application/json",
    "user-id": payload.user_id,
    LLM_JUDGE_API_KEY: LLM_JUDGE_API_KEY_SECRET,
  };

  const url = LLM_JUDGE_MANAGEMENT_API_URL + "history";

  const experiment_name =
    payload.experiment_option === "new_experiment"
      ? payload.new_experiment
      : payload.existing_experiment;

  let query = {};
  let name = payload.apiType;

  if (payload.apiType === API_TYPE_MULTITURN) {
    query = {
      model: payload.model,
      previous_question: payload.previous_question,
      previous_answer: payload.previous_answer,
      current_question: payload.current_question,
      golden_rewritten_question: payload.golden_rewritten_question,
      rewritten_question: payload.rewritten_question,
    };
    name = name + " - " + payload.current_question;
  } else {
    query = {
      model: payload.model,
      golden_text: payload.golden_text,
      generated_text: payload.generated_text,
    };
    name = name + " - " + payload.golden_text;
  }

  const content = {
    query: query,
    result: result,
  };
  const data = {
    name: name,
    user_id: payload.user_id,
    experiment_name: experiment_name,
    content: content,
    type: "single",
    eval_type: payload.apiType,
  };

  try {
    const response = await axios.post(url, data, { headers });
    data._id = response.data.insert_id;
    return data;
  } catch (error) {}
}

async function rating_api_call(payload) {
  try {
    const response = await axios.post(API_RATING_URL, payload, config);

    // creating new experiment after a successful call
    await create_experiment(payload);

    // save the request
    const savedObject = await save_request_history(payload, response.data);
    console.log(payload);

    return {
      query: savedObject,
      data: response.data,
    };
  } catch (error) {
    throw error;
  }
}

async function similarity_api_call(payload) {
  try {
    const response = await axios.post(API_SIMLARITY_URL, payload, config);
    // creating new experiment after a successful call
    await create_experiment(payload);

    // save the request
    const savedObject = await save_request_history(payload, response.data);
    console.log(payload);

    return {
      query: savedObject,
      data: response.data,
    };
  } catch (error) {
    throw error;
  }
}

async function multiturn_api_call(payload) {
  try {
    const response = await axios.post(API_MULTITURN_URL, payload, config);
    // creating new experiment after a successful call
    await create_experiment(payload);

    // save the request
    const savedObject = await save_request_history(payload, response.data);
    console.log(payload);

    return {
      query: savedObject,
      data: response.data,
    };
  } catch (error) {
    throw error;
  }
}
