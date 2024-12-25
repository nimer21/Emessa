//import axios from "axios";
import axios from "../services/api";


const API_URL = "/api/orders";

 export const fetchOrders = async ({ page, limit, sortField, sortOrder, search, style }) => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
      sortField,
      sortOrder,
      ...(search && { search }),
      ...(style && { style }),
    }).toString();

    //const response = await axios.get(`http://localhost:5000/api/orders?${params}`);
    const response = await axios.get(`${API_URL}?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(API_URL, orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const updateOrder = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};
