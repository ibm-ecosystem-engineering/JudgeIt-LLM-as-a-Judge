import axios from "axios";
import {
  LLM_JUDGE_API_KEY_SECRET,
  LLM_JUDGE_MANAGEMENT_API_URL,
} from "./Config";

export async function create_experiment(payload, type) {
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
      type: type,
    };

    try {
      await axios.post(url, data, { headers });
    } catch (error) {
      throw error;
    }
  }
}

export const fetch_experiment_list_by_type = async (user_id, type) => {
  const url = LLM_JUDGE_MANAGEMENT_API_URL + "histories/type/" + type;

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
  const url = LLM_JUDGE_MANAGEMENT_API_URL + "histories/" + doc_id;

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

export const fetch_request_history_by_name_and_type = async (
  user_id,
  experiment_name,
  type
) => {
  const url =
    LLM_JUDGE_MANAGEMENT_API_URL +
    "histories/name/" +
    experiment_name +
    "/type/" +
    type;

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
    console.error(
      "Error fetching fetch_request_history_by_name_and_type :",
      error
    ); // Handle any errors
    throw error;
  }
};

export const get_experiment_list = async (user_id, type) => {
  const url = LLM_JUDGE_MANAGEMENT_API_URL + "experiments/type/" + type;

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

export const delete_history_by_id = async (history_id, user_id) => {
  const headers = {
    accept: "application/json",
    "user-id": user_id,
    LLM_JUDGE_API_KEY: LLM_JUDGE_API_KEY_SECRET,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.delete(
      LLM_JUDGE_MANAGEMENT_API_URL + "history/" + history_id,
      {
        headers: headers,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
};

export const delete_history_by_experiment_name = async (
  experiment_name,
  user_id
) => {
  const headers = {
    accept: "application/json",
    "user-id": user_id,
    LLM_JUDGE_API_KEY: LLM_JUDGE_API_KEY_SECRET,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.delete(
      LLM_JUDGE_MANAGEMENT_API_URL + "experiment/name/" + experiment_name,
      {
        headers: headers,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
};
