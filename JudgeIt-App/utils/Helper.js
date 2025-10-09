import {
  API_TYPE_MULTITURN,
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
  grade_map_multiturn,
  grade_map_rating,
  grade_map_similarity,
} from "@/services/Config";

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export function generateRandomString(length = 4) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

// Function to generate columns dynamically from JSON object keys
export const generateColumns = (jsonObject) => {
  return Object.keys(jsonObject).map((key) => ({
    field: key,
    headerName: rename_grade_explanation_cloumn_name(key), // Capitalize the header
    width: 300, // You can adjust the width or make it dynamic
  }));
};

const rename_grade_explanation_cloumn_name = (column_name) => {
  if (column_name === "Grade") {
    return "JudgeIt Score";
  } else if (column_name === "Explanation") {
    return "JudgeIt Reasoning";
  } else {
    return column_name.charAt(0).toUpperCase() + column_name.slice(1);
  }
};

// Function to generate rows dynamically from JSON object
export const generateRows = (jsonObject, eval_type) => {
  const firstKey = Object.keys(jsonObject)[0]; // Get the first key to check structure
  const rowIds = Object.keys(jsonObject[firstKey]); // Assuming same structure for all keys

  return rowIds.map((_, index) => {
    const rowData = { id: index }; // Initialize row with id
    Object.keys(jsonObject).forEach((field) => {
      rowData[field] = get_rating_label(
        eval_type,
        field,
        jsonObject[field][index]
      ); // Add data for each field
    });
    return rowData;
  });
};

const get_rating_label = (eval_type, column_name, value) => {
  if (column_name !== "Grade") return value;

  const gradeMap = {
    [API_TYPE_RATING]: grade_map_rating,
    [API_TYPE_SIMILARITY]: grade_map_similarity,
    [API_TYPE_MULTITURN]: grade_map_multiturn,
  };

  return gradeMap[eval_type]?.[value] || value;
};

export function trimText(text) {
  if (text.length > 15) {
    return text.substring(0, 15) + "..";
  }
  return text;
}
