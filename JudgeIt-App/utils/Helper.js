export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export function generateRandomString(length = 4) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
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
    headerName: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the header
    width: 300, // You can adjust the width or make it dynamic
  }));
};

// Function to generate rows dynamically from JSON object
export const generateRows = (jsonObject) => {
  const firstKey = Object.keys(jsonObject)[0]; // Get the first key to check structure
  const rowIds = Object.keys(jsonObject[firstKey]); // Assuming same structure for all keys

  return rowIds.map((_, index) => {
    const rowData = { id: index }; // Initialize row with id
    Object.keys(jsonObject).forEach((field) => {
      rowData[field] = jsonObject[field][index]; // Add data for each field
    });
    return rowData;
  });
};