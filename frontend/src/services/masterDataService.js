// services/masterDataService.js
import { toast } from "react-toastify";
import axios from "./api";
const API_BASE = "/api/master-data";

export const fetchStyles = async () => {
  const response = await axios.get(`${API_BASE}/styles`);
  return response.data;
};

export const fetchCustomers = async () => {
  const response = await axios.get(`${API_BASE}/customers`);
  return response.data;
};

// Fetch Fabrics
export const fetchFabrics = async () => {
  const response = await axios.get(`${API_BASE}/fabrics`);
  return response.data;
};

export const fetchFabricSuppliers = async () => {
  const response = await axios.get(`${API_BASE}/fabric-suppliers`);
  return response.data;
};

export const fetchCompositionItems = async () => {
  const response = await axios.get(`${API_BASE}/composition-items`);
  return response.data;
};

export const createFabric = async (fabricData) => {
  try {
    const response = await axios.post(`${API_BASE}/fabrics`, fabricData);
    toast.success(response.data.message);
    return response.data;
  } catch (error) {
    console.error("Error Creating Fabric with Compositions:", error);
    toast.error(error.response.data.message || error.message || error || "Failed to create fabric. Please try again.");
//    return error.response.data;
    throw error;
  }
};
export const fetchBrands = async () => {
  const response = await axios.get(`${API_BASE}/brands`);
  return response.data;
};
export const createStyle = async (styleData) => {
  try {
    const response = await axios.post(`${API_BASE}/styles`, styleData);
    //console.log(response.data);
    toast.success(response.data.message);
    return response.data;
  } catch (error) {
    console.error("Error Creating Fabric with Compositions:", error);
    toast.error(error.response.data.message || error.message || error || "Failed to create fabric. Please try again.");
//    return error.response.data;
    throw error;
  }
};
