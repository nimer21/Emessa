import React, { useState, useEffect } from "react";
import {
  fetchFabricSuppliers,
  fetchCompositionItems,
  createFabric,
  updateFabric,
} from "../services/masterDataService";
import { Progress } from "../components/ui/progress";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "react-toastify";
import { FiX, FiTrash2 } from "react-icons/fi";

const FabricModal = ({ closeModal, editFabric, refreshFabricList }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    color: "",
    supplier: "",
    compositions: [],
  });
  const [suppliers, setSuppliers] = useState([]);
  const [compositionItems, setCompositionItems] = useState([]);
  const [selectedComposition, setSelectedComposition] = useState("");
  const [percentage, setPercentage] = useState("");
  const [warning, setWarning] = useState("");

  // Fetch dropdown data
  useEffect(() => {
    fetchFabricSuppliers().then(setSuppliers);
    fetchCompositionItems().then(setCompositionItems);
  }, []);

  // Populate data if editing
  useEffect(() => {
    if (editFabric) {
      setFormData({
        name: editFabric.name,
        code: editFabric.code,
        color: editFabric.color,
        supplier: editFabric.supplier?._id || "",
        compositions: editFabric.fabricCompositions.map((comp) => ({
          compositionCode: comp.compositionItem._id,
          compositionName: comp.compositionItem.name,
          value: comp.value,
        })),
      });
    }
  }, [editFabric]);

  // Calculate total composition percentage
  const totalPercentage = formData.compositions.reduce(
    (sum, comp) => sum + parseInt(comp.value),
    0
  );

  // Add composition with limit check
  const addComposition = () => {
    if (!selectedComposition || !percentage) {
      return toast.error(
        "Please select a composition and enter a valid percentage."
      );
    }
    const newTotal = totalPercentage + parseInt(percentage);
    if (newTotal > 100) {
      setWarning("Total composition cannot exceed 100%.");
      return;
    }

    const selectedCompItem = compositionItems.find(
      (item) => item._id === selectedComposition
    );
    if (selectedCompItem) {
      setFormData((prev) => ({
        ...prev,
        compositions: [
          ...prev.compositions,
          {
            compositionCode: selectedComposition,
            compositionName: selectedCompItem.name,
            value: percentage,
          },
        ],
      }));
    }
    // Clear inputs
    setSelectedComposition("");
    setPercentage("");
    setWarning(""); // Clear warning if valid
  };

  // Remove a composition from the grid
  const removeComposition = (index) => {
    const updatedCompositions = [...formData.compositions];
    updatedCompositions.splice(index, 1);
    setFormData({ ...formData, compositions: updatedCompositions });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalPercentage !== 100)
      return toast.error("Total composition must be exactly 100%.");
    //await createFabric(formData);
    //closeModal();
    try {
      let updatedFabric;

      if (editFabric) {
        updatedFabric = await updateFabric(editFabric._id, formData);
        toast.success("Fabric updated successfully");
      } else {
        updatedFabric = await createFabric(formData);
        toast.success("Fabric created successfully");
      }

      refreshFabricList(updatedFabric.fabric);
      closeModal();
    } catch (error) {
      toast.error("Error saving fabric");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-lg relative">
        {/* 🔷 Modal Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-lg font-semibold">
            {editFabric ? "Edit Fabric" : "Add New Fabric"}
          </h2>
          <button
            onClick={closeModal}
            className="text-2xl hover:text-gray-300 transition-all"
          >
            <FiX />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] overflow-y-auto space-y-6 p-4"
        >
          {/* 🔹 Fabric Details */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-md">
            <h3 className="text-md font-semibold text-gray-700 mb-3">
              Fabric Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                className="w-full p-2 mb-2 border rounded input-field"
                required
                type="text"
                name="name"
                placeholder="Fabric Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <input
                className="w-full p-2 mb-2 border rounded input-field"
                required
                type="text"
                name="code"
                placeholder="Fabric Code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
              />
              <input
                className="w-full p-2 mb-2 border rounded input-field"
                required
                type="text"
                name="color"
                placeholder="Color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />

              <select name="supplier"
                className="w-full p-2 mb-2 border rounded"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
              >
                <option value="" disabled>Select Supplier</option>
                {suppliers.map((sup) => (
                  <option key={sup._id} value={sup._id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Composition Section */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-md">
            <h3 className="text-md font-semibold text-gray-700 mb-3">
              Fabric Composition
            </h3>
            <div className="flex gap-2">
              <select
                value={selectedComposition}
                onChange={(e) => setSelectedComposition(e.target.value)}
                className="p-2 border rounded flex-1 select-field"
              >
                <option value="">Select Composition</option>
                {compositionItems.map((comp) => (
                  <option key={comp._id} value={comp._id}>
                    {comp.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="1"
                className="p-2 border rounded input-field w-24"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="%"
              />
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                onClick={addComposition}
              >
                Add
              </Button>
            </div>
            {warning && <p className="text-red-500 text-sm mt-2">{warning}</p>}

            {/* Composition Grid */}
            <div className="border rounded-lg p-3 bg-gray-50 mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="p-2 text-left">Composition</th>
                    <th className="p-2 text-left">%</th>
                    <th className="p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.compositions.map((comp, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{comp.compositionName}</td>
                      <td className="p-2">{comp.value}%</td>
                      <td className="p-2">
                        <Button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          onClick={() => removeComposition(index)}
                        >
                          ✖
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Progress Bar */}
            <div className="my-4">
              <Progress value={totalPercentage} className="my-3" />
              <p className="text-sm text-gray-600 mt-1">
                Total Composition: {totalPercentage}%
              </p>
            </div>
          </div>

          {/* Footer Buttons - Fixed UI Issue */}
          <div className="mt-4 flex justify-between items-center border-t pt-4">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              disabled={totalPercentage !== 100}
              onClick={handleSubmit}
            >
              Save
            </Button>
            <Button
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded"
              onClick={closeModal}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default FabricModal;
