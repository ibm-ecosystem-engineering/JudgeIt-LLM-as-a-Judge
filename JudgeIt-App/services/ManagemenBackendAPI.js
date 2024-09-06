import axios from "axios";
import {
  LLM_JUDGE_API_KEY_SECRET,
  LLM_JUDGE_MANAGEMENT_API_URL,
} from "./Config";

export const fetch_experiment_list_single_type = async (user_id) => {
  const url = LLM_JUDGE_MANAGEMENT_API_URL + "histories/type/single";

  const headers = {
    accept: "application/json",
    "user-id": user_id,
    LLM_JUDGE_API_KEY: LLM_JUDGE_API_KEY_SECRET,
  };

  try {
    const response = await axios.get(url, { headers });
    const data = response.data;
    const groupedData = data.reduce((result, item) => {
      const { experiment_name } = item;

      // If the experiment_name doesn't exist in result, initialize it with an empty array
      if (!result[experiment_name]) {
        result[experiment_name] = [];
      }

      // Push the current item into the corresponding experiment_name array
      result[experiment_name].push(item);

      return result;
    }, {});

    return groupedData;
  } catch (error) {
    console.error("Error fetching data:", error); // Handle any errors
    throw error;
  }
};

export const fetch_request_history_by_id = async (user_id, doc_id) => {
    const url = LLM_JUDGE_MANAGEMENT_API_URL + "histories/"+doc_id;
  
    const headers = {
      accept: "application/json",
      "user-id": user_id,
      LLM_JUDGE_API_KEY: LLM_JUDGE_API_KEY_SECRET,
    };
  
    try {
      const response = await axios.get(url, { headers });
      const data = response.data;
      return data;
    } catch (error) {
      console.error("Error fetching fetch_request_history_by_id :", error); // Handle any errors
      throw error;
    }
  };

  export const get_experiment_list = async (user_id) => {
    const url = LLM_JUDGE_MANAGEMENT_API_URL + "experiments";
  
    const headers = {
      accept: "application/json",
      "user-id": user_id,
      LLM_JUDGE_API_KEY: LLM_JUDGE_API_KEY_SECRET,
    };
  
    try {
      const response = await axios.get(url, { headers });
      const data = response.data;
      return data;
    } catch (error) {
      console.error("Error fetching get_experiment_list :", error); // Handle any errors
      throw error;
    }
  };

export const fetch_experiment_batch_type = async (user_id) => {
  const url = LLM_JUDGE_MANAGEMENT_API_URL + "experiments/type/batch";

  const headers = {
    accept: "application/json",
    "user-id": user_id,
    LLM_JUDGE_API_KEY: LLM_JUDGE_API_KEY_SECRET,
  };

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error); // Handle any errors
    throw error;
  }
};
