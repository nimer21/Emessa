// src/components/LogDefectModal.js
import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { toast } from "react-toastify";
import { createDefect, updateDefect } from "../services/defectService";
import { fetchOrders } from "../services/orderService";

const LogDefectModal = ({
  closeModal,
  onDefectCreated,
  editDefect,
  updateDefectInList,
  currentColor,
}) => {
  const [formData, setFormData] = useState({
    orderId: editDefect?.orderId?._id || editDefect?.orderId || "", // Handle different formats
    defectSection: "",
    defectProcess: "",
    defectType: "",
    description: "",
    severity: "Low",
    assignedTo: "",
    image: null,
    month: "",
    styleName: "",
    fabricArticle: "",
    productionLine: "",
  });
  const [orders, setOrders] = useState([]);

  const [sections, setSections] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [defects, setDefects] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedProcess, setSelectedProcess] = useState("");
  const [selectedDefect, setSelectedDefect] = useState("");

  // Fetch all sections on mount
  useEffect(() => {
    const loadSections = async () => {
      try {
        const response = await axios.get("/api/sections/sections");
        setSections(response.data);
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    };
    loadSections();
  }, []);

  // Fetch processes when section is selected
  useEffect(() => {
    if (selectedSection) {
      const loadProcesses = async () => {
        try {
          const response = await axios.get(
            `/api/sections/processes/${selectedSection}`
          );
          setProcesses(response.data);
        } catch (error) {
          console.error("Error fetching processes:", error);
        }
      };
      loadProcesses();
    } else {
      setProcesses([]);
    }
  }, [selectedSection]);


  // Fetch defects when process is selected
  useEffect(() => {
    if (selectedProcess) {
      const loadDefects = async () => {
        try {
          const response = await axios.get(
            `api/sections/defects/${selectedProcess}`
          );
          setDefects(response.data);
        } catch (error) {
          console.error("Error fetching defects:", error);
        }
      };
      loadDefects();
    } else {
      setDefects([]);
    }
  }, [selectedProcess]);

  // Fetch all orders on component mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders({}); // Fetch all orders (implement pagination if necessary)
        setOrders(data.data); // Assuming the API returns data in `data.data`
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    loadOrders();
  }, []);

  useEffect(() => {
    if (editDefect) {
      setFormData(editDefect); // Load defect data for editing

    /*setSelectedDefect(editDefect.defectType); // Set initial value for the dropdown
    setFormData({
      ...formData,
      defectType: editDefect.defectType,
      description: editDefect.description,
      severity: editDefect.severity,
      defectSection: editDefect.defectSection,
      defectProcess: editDefect.defectProcess,
    });*/

    }
  }, [editDefect]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  // Handle file input change for the image
  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data before submission:", formData);
    
    const formDataWithImage = new FormData();
    formDataWithImage.append("orderId", typeof formData.orderId === "object" ? formData.orderId._id : formData.orderId);
    //formDataWithImage.append("orderId", formData.orderId);
    formDataWithImage.append("defectSection", formData.defectSection);
    formDataWithImage.append("defectProcess", formData.defectProcess);
    formDataWithImage.append("defectType", formData.defectType);
    formDataWithImage.append("description", formData.description);
    formDataWithImage.append("severity", formData.severity);
    formDataWithImage.append("assignedTo", formData.assignedTo);
    formDataWithImage.append("month", formData.month);
    formDataWithImage.append("styleName", formData.styleName);
    formDataWithImage.append("fabricArticle", formData.fabricArticle);
    formDataWithImage.append("productionLine", formData.productionLine);

    // Append the image file only if it exists
    if (formData.image) {
      formDataWithImage.append("image", formData.image);
    }

    try {
      if (editDefect) {
        const updatedDefect = await updateDefect({editDefect, formDataWithImage});
        updateDefectInList(updatedDefect); // Update defect list in UI
        console.log("Response from backend:", updatedDefect);
        toast.success("Defect updated successfully");
      } else {
        const newDefect = await createDefect({formDataWithImage}); // Create defect with populated orderNo
        onDefectCreated(newDefect.populatedDefect); // Update the defect list with the new defect // Update defects list in parent component
        toast.success(newDefect.message);
      }
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to log/update defect.");
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-4 rounded-lg shadow-lg relative">
        {/* Modal Header */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {editDefect ? "Edit Defect" : "Log New Defect"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Scrollable Content */}
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            {/* General Details Section */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-600">
                General Details
              </h3>
              {/* Order Dropdown */}
        <label className="block mb-2">Order ID:</label>
        <select
          name="orderId"
          value={formData.orderId}
          onChange={handleChange}
          //onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
          required
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        >
          <option value="" disabled>
            Select an Order
          </option>
          {orders.map((order) => (
            <option key={order._id} value={order._id}>
              {order.orderNo} - {order.style}
            </option>
          ))}
        </select>

              {/* <label className="block mb-2">Defect Type:</label>
              <input
                type="text"
                name="defectType"
                value={formData.defectType}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              /> */}
              <label className="block mb-2">Section:</label>
        <select
          name="defectSection"
          value={selectedSection}
          onChange={(e) => {
            setSelectedSection(e.target.value);
            setFormData({ ...formData, defectSection: e.target.value });
          }}
          required
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        >
          <option value="" disabled>
            Select a Section
          </option>
          {sections.map((section) => (
            <option key={section._id} value={section._id}>
              {section.name}
            </option>
          ))}
        </select>

        <label className="block mb-2">Process:</label>
        <select
          name="defectProcess"
          value={selectedProcess}
          onChange={(e) => {
            setSelectedProcess(e.target.value);
            setFormData({ ...formData, defectProcess: e.target.value });
          }}
          required
          disabled={!selectedSection}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        >
          <option value="" disabled>
            Select a Process
          </option>
          {processes.map((process) => (
            <option key={process._id} value={process._id}>
              {process.name}
            </option>
          ))}
        </select>

        <label className="block mb-2">Defect Type:</label>
        <div className="relative">
        <select
          name="defectType"
          //value={formData.defectType}
          value={selectedDefect} // Use selectedDefect for dropdown value
          //onChange={handleChange}
          onChange={(e) => {
            setSelectedDefect(e.target.value); // Update selected defect state
            setFormData({ ...formData, defectType: e.target.value }) // Sync with formData
          }}
          required
          disabled={!selectedProcess} // Enable only if a process is selected
          //disabled={editDefect?.status === "Finalized"} // Disable if defect is finalized
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        >
          <option value="" disabled>
            Select a Defect Type
          </option>
          {defects.map((defect) => (
            <option key={defect._id} value={defect.name}>
              {defect.name}
            </option>
          ))}
        </select>
        {!formData.defectProcess && (
          <span className="text-sm text-red-500">
            Please select a process to enable defect types.
          </span>
          )}
          </div>

              <label className="block mb-2">Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />

              <label className="block mb-2">Severity:</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Additional Details Section */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-600">
                Additional Details
              </h3>
              {/* New Fields */}
              <label className="block mb-2">Month:</label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              >
                <option value="">Select Month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>

              <label className="block mb-2">Style Name:</label>
              <input
                type="text"
                name="styleName"
                value={formData.styleName}
                onChange={handleChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />

              <label className="block mb-2">Fabric Article:</label>
              <input
                type="text"
                name="fabricArticle"
                value={formData.fabricArticle}
                onChange={handleChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />

              <label className="block mb-2">Line of Production:</label>
              <select
                name="productionLine"
                value={formData.productionLine}
                onChange={handleChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              >
                <option value="">Select Line</option>
                <option value="Line 1">Line 1</option>
                <option value="Line 2">Line 2</option>
                <option value="Line 3">Line 3</option>
              </select>

              <label className="block mb-2">Assigned To:</label>
              <input
                type="text"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />

              {/* File input for the image */}
              <label className="block mb-2">Upload Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full mb-12 border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-between space-x-2 px-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              style={{ backgroundColor: currentColor }} // Inline style for dynamic color
            >
              {editDefect ? "Update Defect" : "Save Defect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogDefectModal;
