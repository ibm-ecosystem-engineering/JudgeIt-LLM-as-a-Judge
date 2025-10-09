import axios from "axios";
import {
  API_TYPE_MULTITURN,
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
  LLM_JUDGE_BASE_URL,
  API_TYPE_KEY,
  LLM_JUDGE_API_KEY_SECRET,
  LLM_JUDGE_MANAGEMENT_API_URL,
  API_TYPE_SINGLETURN,
  API_TYPE_WBOX_SDR,
  API_TYPE_BBOX_SDR,
  API_TYPE_AGENT,
} from "./Config";
import { create_experiment } from "./ManagemenBackendAPI";

/* BATCH API ENDPOINTS */
const API_RATING_BATCH_URL                      = LLM_JUDGE_BASE_URL + "/api/v1/judge/rating/batch";
const API_SIMLARITY_BATCH_URL                   = LLM_JUDGE_BASE_URL + "/api/v1/judge/similarity/batch";
const API_MULTITURN_BATCH_URL                   = LLM_JUDGE_BASE_URL + "/api/v1/judge/multiturn/batch";
const API_SINGLETURN_BATCH_URL                  = LLM_JUDGE_BASE_URL + "/api/v1/judge/singleturn/batch";
const API_BBOX_BATCH_URL                        = LLM_JUDGE_BASE_URL + "/api/v1/judge/bbox/batch";
const API_WBOX_BATCH_URL                        = LLM_JUDGE_BASE_URL + "/api/v1/judge/wbox/batch";
const API_AGENT_BATCH_URL                       = LLM_JUDGE_BASE_URL + "/api/v1/judge/agent/batch";


const config = {
  headers: {
    accept: "application/json",
    LLM_JUDGE_API_KEY: LLM_JUDGE_API_KEY_SECRET,
    "Content-Type": "multipart/form-data",
  },
};

/**
 * Save request history to mongodb request_histories collection
 * API ENDPOINT: /api/v1/manage/history, method POST
 * @param {*} payload
 * @param {*} task_id
 * @returns
 */
export async function save_request_history(payload, batch_result) {
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

  let name = "batch-" + payload.apiType + "-" + payload.filename;

  const content = {
    batch_result: batch_result,
    file_name: payload.filename,
  };
  const data = {
    name: name,
    user_id: payload.user_id,
    experiment_name: experiment_name,
    content: content,
    type: "batch",
    eval_type: payload.apiType,
  };

  try {
    const response = await axios.post(url, data, { headers });
    data._id = response.data.insert_id;
    return data;
  } catch (error) {}
}

/**
 * JUDGE API Batch call, the API endpoint is determind by apiType in formdata object
 * @param {*} formdata
 * @param {*} payload payload contains information about creating experiment and saving request history
 * @returns
 */
export async function judge_api_batch_call(formdata, payload) {
  const api_type = formdata.get(API_TYPE_KEY);

  try {
    if (api_type === API_TYPE_RATING) {
      return await rating_batch_api_call(formdata, payload);
    } else if (api_type === API_TYPE_SIMILARITY) {
      return similarity_batch_api_call(formdata, payload);
    } else if (api_type === API_TYPE_MULTITURN) {
      return multiturn_with_conversation_batch_api_call(formdata, payload);
    } else if (api_type === API_TYPE_SINGLETURN) {
      return singleturn_batch_api_call(formdata, payload);
    } else if (api_type === API_TYPE_BBOX_SDR) {
      return bbox_batch_api_call(formdata, payload);
    } else if (api_type === API_TYPE_WBOX_SDR) {
      return wbox_batch_api_call(formdata, payload);
    } else if (api_type === API_TYPE_AGENT) {
      return agent_batch_api_call(formdata, payload);
    }  
    else {
      throw "Batch API not found";
    }
  } catch (error) {
    throw error;
  }
}

export async function get_result_by_task_id(task_id) {
  const url = LLM_JUDGE_BASE_URL + "/api/v1/judge/result/" + task_id;
  const headers = {
    accept: "application/json",
    "Content-Type": "application/json",
    LLM_JUDGE_API_KEY: LLM_JUDGE_API_KEY_SECRET,
  };

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching data by task_id:", error); // Handle any errors
    throw error;
  }
}

async function rating_batch_api_call(formData, payload) {
  const response = await axios.post(
    API_RATING_BATCH_URL + "?model_name=" + formData.get("model"),
    formData,
    config
  );
  await create_experiment(payload, "batch");
  return response;
}

async function similarity_batch_api_call(formData, payload) {
  const response = await axios.post(
    API_SIMLARITY_BATCH_URL + "?model_name=" + formData.get("model"),
    formData,
    config
  );
  await create_experiment(payload, "batch");
  return response;
}

async function singleturn_batch_api_call(formData, payload) {
  const response = await axios.post(API_SINGLETURN_BATCH_URL, formData, config);
  await create_experiment(payload, "batch");
  return response;
}

async function multiturn_with_conversation_batch_api_call(formData, payload) {
  const response = await axios.post(API_MULTITURN_BATCH_URL, formData, config);
  await create_experiment(payload, "batch");
  return response;
}


export async function batch_process_status(task_id) {
  const response = await axios.get(
    LLM_JUDGE_BASE_URL + "/api/v1/judge/status/" + task_id,
    {
      headers: {
        accept: "application/json",
        LLM_JUDGE_API_KEY: LLM_JUDGE_API_KEY_SECRET,
      },
    }
  );
  return response.data;
}

async function agent_batch_api_call(formData, payload) {
  const response = await axios.post(
    API_AGENT_BATCH_URL + "?model_name=" + formData.get("model"),
    formData,
    config
  );
  await create_experiment(payload, "batch");
  return response;
}

async function bbox_batch_api_call(formData, payload) {
  const response = await axios.post(
    API_BBOX_BATCH_URL + "?model_name=" + formData.get("model"),
    formData,
    config
  );
  await create_experiment(payload, "batch");
  return response;
}

async function wbox_batch_api_call(formData, payload) {
  const response = await axios.post(
    API_WBOX_BATCH_URL + "?model_name=" + formData.get("model"),
    formData,
    config
  );
  await create_experiment(payload, "batch");
  return response;
}
