import React, { useState } from "react";
import { createOrder } from "../services/orderService";
import { useStateContext } from "../contexts/ContextProvider";

const OrderForm = ({ onOrderCreated }) => {
  const { currentColor } = useStateContext();
  const [formData, setFormData] = useState({
    orderNo: "",
    line: "",
    style: "",
    styleNo: "",
    fabricArt: "",
    fabricSupplier: "",
    orderQty: 0,
    customer: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newOrder = await createOrder(formData);
      onOrderCreated(newOrder);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white shadow-md rounded-lg mb-6 space-y-4"
    >
      <h2 className="text-xl font-bold text-gray-800">Create New Order</h2>
      <input
        type="text"
        name="orderNo"
        placeholder="Order No"
        value={formData.orderNo}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded"
      />
      <input
        type="text"
        name="line"
        placeholder="Line"
        value={formData.line}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded"
      />
      <input
        type="text"
        name="style"
        placeholder="Style"
        value={formData.style}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded"
      />
      {/* Add additional fields */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
        style={{ backgroundColor: currentColor }} // Inline style for dynamic color
      >
        Create Order
      </button>
    </form>
  );
};

export default OrderForm;
