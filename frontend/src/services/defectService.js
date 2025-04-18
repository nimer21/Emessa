import { toast } from "react-toastify";
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
    const response = await axios.get(`/api/orders/${orderId}/defects`);
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

export const deleteDefect = async (deleteId) => {
  try {
    const response = await axios.delete(`${API_URL}/${deleteId}`);
    toast.success("Defect deleted successfully");
    return response.data;
  } catch (error) {
    console.error("Error deleting defect:", error);
    toast.error(error.response?.data?.message || "Failed to delete defect. Please try again.");
    throw error;
  }
};

export const fetchDefects = async ({ 
  page = 1, 
  limit = 10, 
  search = "",
  sortField = "detectedDate",
  sortOrder = "desc",
  severity = "",
  defectType = "",
  month = ""
}) => {
  try {
    // Build query params
    const params = new URLSearchParams({
      page,
      limit,
      search,
      sortField,
      sortOrder
    });
    
    // Add optional filters if present
    if (severity) params.append("severity", severity);
    if (defectType) params.append("defectType", defectType);
    if (month) params.append("month", month);
    
    const response = await axios.get(`${API_URL}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching defects:", error);
    throw error;
  }
};