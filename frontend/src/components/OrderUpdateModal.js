// src/components/LogDefectModal.js
import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { toast } from "react-toastify";
import { updateOrder } from "../services/orderService";

const OrderUpdateModal = ({
  orders,
  setOrders,
  handleCloseModal,
  selectedOrder,
  setSelectedOrder,
  currentColor,
}) => {
  const handleUpdateOrder = async () => {
          try {
            const updatedOrder = await updateOrder(selectedOrder._id, selectedOrder);
            setOrders(
              orders.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
            );
            handleCloseModal();
          } catch (error) {
            console.error("Error updating order:", error);
          }
        };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-4 rounded-lg shadow-lg relative">
        {/* Modal Header */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">
        Update Order
        </h2>

        <input
              type="text"
              value={selectedOrder?.orderNo || ""}
              onChange={(e) =>
                setSelectedOrder({ ...selectedOrder, orderNo: e.target.value })
              }
              className="block w-full p-2 border rounded mb-4"
              placeholder="Order No"
            />
            <input
              type="text"
              value={selectedOrder?.style || ""}
              onChange={(e) =>
                setSelectedOrder({ ...selectedOrder, style: e.target.value })
              }
              className="block w-full p-2 border rounded mb-4"
              placeholder="Style"
            />
            <button
              onClick={handleUpdateOrder}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Save
            </button>
            <button
              onClick={handleCloseModal}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
          );
};

export default OrderUpdateModal;
