import React, { useState, useEffect } from "react";
import { fetchDefectsForOrder, addDefectToOrder } from "../services/defectService";
import { Navigate, useLocation } from "react-router-dom";

const OrderDetails = () => {//{ order }
    const location = useLocation();
  const [defects, setDefects] = useState([]);
  const [newDefect, setNewDefect] = useState({
    defectType: "",
    description: "",
    severity: "Low",
  });
  const order = location.state?.order; // Access the order object from state



  useEffect(() => {
    const loadDefects = async () => {
      try {
        const data = await fetchDefectsForOrder(order._id);
        setDefects(data);
      } catch (error) {
        console.error("Error loading defects:", error);
      }
    };
    loadDefects();
  }, [order._id]);

  const handleAddDefect = async () => {
    try {
      const defect = await addDefectToOrder(order._id, newDefect);
      setDefects([...defects, defect]);
      setNewDefect({ defectType: "", description: "", severity: "Low" });
    } catch (error) {
      console.error("Error adding defect:", error);
    }
  };

  return (
    <div>
      <h2>Order Details</h2>
      <p>Order No: {order.orderNo}</p>
      <p>Style: {order.style}</p>
      <p>Line: {order.line}</p>

      <h3>Defects</h3>
      <ul>
        {defects.map((defect) => (
          <li key={defect._id}>
            {defect.defectType} - {defect.severity} - {defect.status}
          </li>
        ))}
      </ul>

      <h4>Add Defect</h4>
      <input
        type="text"
        placeholder="Defect Type"
        value={newDefect.defectType}
        onChange={(e) => setNewDefect({ ...newDefect, defectType: e.target.value })}
      />
      <textarea
        placeholder="Description"
        value={newDefect.description}
        onChange={(e) => setNewDefect({ ...newDefect, description: e.target.value })}
      />
      <select
        value={newDefect.severity}
        onChange={(e) => setNewDefect({ ...newDefect, severity: e.target.value })}
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <button onClick={handleAddDefect}>Add Defect</button>
    </div>
  );
};

export default OrderDetails;
