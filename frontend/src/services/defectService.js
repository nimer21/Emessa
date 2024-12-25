import axios from "../services/api";

const API_URL = "/api/defects";

// Tiger this is not used (Also in the backend server orderController.js => addDefectToOrder)
export const addDefectToOrder = async (orderId, defectData) => {
  try {
    const response = await axios.post(`${API_URL}/${orderId}/defects`, defectData);
    return response.data;
  } catch (error) {
    console.error("Error adding defect:", error);
    throw error;
  }
};

export const fetchDefectsForOrder = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/${orderId}/defects`);
    return response.data;
  } catch (error) {
    console.error("Error fetching defects:", error);
    throw error;
  }
};

export const createDefect = async ({ formDataWithImage }) => {
  try {
    const response = await axios.post(API_URL, formDataWithImage, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
  });
    return response.data;
  } catch (error) {
    console.error("Error creating defect:", error.response?.data || error.message);
    throw error; // Rethrow to handle in the UI
  }
};

export const updateDefect = async ({editDefect, formDataWithImage }) => {
  try {
    //console.log("formDataWithImage=>  ", formDataWithImage); // Debugging line
    //console.log("editDefect=>  ", editDefect); // Debugging line
    const response = await axios.put(
              `${API_URL}/${editDefect._id}`,
              formDataWithImage, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            ); // Update defect if in edit mode
    return response.data;
  } catch (error) {
    console.error("Error updating defect:", error);
    throw error;
  }
};

export const getDefectById = async (defectId) => {
  try {
    const response = await axios.get(`${API_URL}/${defectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching defect details:", error);
    throw error;
  }
};
