import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { toast } from "react-toastify";
import { createDefect, updateDefect } from "../services/defectService";
import { fetchOrders } from "../services/orderService";
import { fetchDefectNames, fetchDefectTypes } from "../services/masterDataService";

const LogDefectModal = ({
  closeModal,
  onDefectCreated,
  editDefect,
  updateDefectInList,
  currentColor,
}) => {
  const [formData, setFormData] = useState({
    orderId: editDefect?.orderId?._id || editDefect?.orderId || "",
    defectType: "",
    defectName: "",
    description: "",
    severity: "Low",
    assignedTo: "",
    image: null,
    month: "",
    productionLine: "",
  });

  const [orders, setOrders] = useState([]);
  const [defectTypes, setDefectTypes] = useState([]);
  const [defectNames, setDefectNames] = useState([]);

  useEffect(() => {
    const loadDefects = async () => {
      try {
        const [typeRes, nameRes] = await Promise.all([
          // axios.get("/api/defect-types"),
          // axios.get("/api/defect-names"),
           fetchDefectTypes(),
           fetchDefectNames()
        ]);
        setDefectTypes(typeRes);
        setDefectNames(nameRes);
      } catch (error) {
        console.error("Error fetching defects:", error);
        toast.error("Failed to load defect data");
      }
    };
    loadDefects();
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders({});
        setOrders(data.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    loadOrders();
  }, []);

  useEffect(() => {
    if (editDefect) {
      setFormData({
        ...editDefect,
        orderId: editDefect?.orderId?._id || editDefect?.orderId || "",
        //defectType: editDefect?.defectType?._id || "",
        // defectType: editDefect?.defectType || "",
        // defectName: editDefect?.defectName || "",
        defectType: editDefect?.defectType?._id || "",
        defectName: editDefect?.defectName?._id || "",
      });
    }
  }, [editDefect]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataWithImage = new FormData();
    formDataWithImage.append("orderId", formData.orderId);
    formDataWithImage.append("defectType", formData.defectType);
    formDataWithImage.append("defectName", formData.defectName);
    formDataWithImage.append("description", formData.description);
    formDataWithImage.append("severity", formData.severity);
    formDataWithImage.append("assignedTo", formData.assignedTo);
    formDataWithImage.append("month", formData.month);
    formDataWithImage.append("productionLine", formData.productionLine);
    if (formData.image) {
      formDataWithImage.append("image", formData.image);
    }

    try {
      if (editDefect) {
        const updatedDefect = await updateDefect({ editDefect, formDataWithImage });
        updateDefectInList(updatedDefect);
        toast.success("Defect updated successfully");
      } else {
        const newDefect = await createDefect({ formDataWithImage });
        onDefectCreated(newDefect.populatedDefect);
        toast.success(newDefect.message);
      }
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to log/update defect.");
    }
  };

  const filteredDefectNames = defectNames?.filter(name => name.type._id === formData.defectType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-4 rounded-lg shadow-lg relative">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {editDefect ? "Edit Defect" : "Log New Defect"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-600">General Details</h3>

              <label className="block mb-2">Order ID:</label>
              <select name="orderId" value={formData.orderId} onChange={handleChange} required className="w-full p-2 mb-4 border border-gray-300 rounded">
                <option value="" disabled>Select an Order</option>
                {orders.map((order) => (
                  <option key={order._id} value={order._id}>{order.orderNo} - {order.season}</option>
                ))}
              </select>

              <label className="block mb-2">Defect Type:</label>
              <select name="defectType" value={formData.defectType} onChange={handleChange} required className="w-full p-2 mb-4 border border-gray-300 rounded">
                <option value="" disabled>Select Defect Type</option>
                {defectTypes?.map((type) => (
                  <option key={type._id} value={type._id}>{type.name}</option>
                ))}
              </select>

              <label className="block mb-2">Defect Name:</label>
              <select name="defectName" value={formData.defectName} onChange={handleChange} required className="w-full p-2 mb-4 border border-gray-300 rounded">
                <option value="" disabled>Select Defect Name</option>
                {filteredDefectNames?.map((name) => (
                  <option key={name._id} value={name._id}>{name.name}</option>
                ))}
              </select>

              <label className="block mb-2">Description:</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 mb-4 border border-gray-300 rounded" />

              <label className="block mb-2">Severity:</label>
              <select name="severity" value={formData.severity} onChange={handleChange} className="w-full p-2 mb-4 border border-gray-300 rounded">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-600">Additional Details</h3>

              <label className="block mb-2">Month:</label>
              <select name="month" value={formData.month} onChange={handleChange} required className="w-full p-2 mb-4 border border-gray-300 rounded">
                <option value="">Select Month</option>
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>

              <label className="block mb-2">Line of Production:</label>
              <select name="productionLine" value={formData.productionLine} onChange={handleChange} className="w-full p-2 mb-4 border border-gray-300 rounded">
                <option value="">Select Line</option>
                {["Line 1", "Line 2", "Line 3"].map((line) => (
                  <option key={line} value={line}>{line}</option>
                ))}
              </select>

              <label className="block mb-2">Assigned To:</label>
              <input type="text" name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="w-full p-2 mb-4 border border-gray-300 rounded" />

              <label className="block mb-2">Upload Image:</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full mb-12 border border-gray-300 rounded" />
            </div>
          </div>

          <div className="absolute bottom-4 left-0 right-0 flex justify-between space-x-2 px-4">
            <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 text-white rounded hover:bg-indigo-700" style={{ backgroundColor: currentColor }}>
              {editDefect ? "Update Defect" : "Save Defect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogDefectModal;
