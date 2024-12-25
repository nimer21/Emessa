// src/pages/DefectList.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../services/api";
import LogDefectModal from "../components/LogDefectModal";
import { useStateContext } from "../contexts/ContextProvider";
//import { PencilIcon, TrashIcon } from "@heroicons/react/outline"; // Import icons from Heroicons
//import { BeakerIcon } from '@heroicons/react/solid'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import ConfirmationModal from './../components/ConfirmationModal';
import { toast } from "react-toastify";

const DefectList = () => {
  const { currentColor } = useStateContext();
  const [defects, setDefects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // State for confirmation modal
  const [deleteId, setDeleteId] = useState(null); // ID of defect to be deleted

  const [editDefect, setEditDefect] = useState(null); // Track defect to edit

const openEditModal = (defect) => {
  setEditDefect(defect);
  setIsModalOpen(true);
};

const closeModal = () => {
  setEditDefect(null); // Clear edit data
  setIsModalOpen(false);
};

 // Function to update the defect in the list after editing
 const updateDefectInList = (updatedDefect) => {
  setDefects((prevDefects) =>
    prevDefects.map((defect) =>
      defect._id === updatedDefect._id ? updatedDefect : defect
    )
  );
};

  useEffect(() => {
    const fetchDefects = async () => {
      try {
        const response = await axios.get("/api/defects"); // Fetch all defects
        setDefects(response.data);
      } catch (error) {
        console.error("Error fetching defects:", error);
      }
    };

    fetchDefects();
  }, []);

  // Handle open confirmation for delete
  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

    // Function to add new defect to the list
    const onDefectCreated = (newDefect) => {
      setDefects([newDefect, ...defects]); // Add new defect to the beginning of the list
    };

    // Function to delete a defect from the list
  // Confirm delete action
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/defects/${deleteId}`);
      setDefects(defects.filter((defect) => defect._id !== deleteId));
      toast.success("Defect deleted successfully");
    } catch (error) {
      console.error("Error deleting defect:", error);
      alert(error.response?.data?.message || "Failed to delete defect. Please try again.");
    } finally {
      setIsConfirmOpen(false); // Close confirmation modal
    }
  };

  const closeConfirm = () => setIsConfirmOpen(false);
  const openModal = () => setIsModalOpen(true);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">All Defects</h1>
        <button
          onClick={openModal}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
          style={{ backgroundColor: currentColor }} // Inline style for dynamic color
        >
          Create New Defect
        </button>
      </div>

      {/* Defects grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {defects.map((defect) => (
          <div key={defect._id} className="relative p-5 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out">
          {/* Action buttons (Edit/Delete) */}
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              onClick={() => openEditModal(defect)}
              className="p-1 bg-blue-100 rounded-full hover:bg-blue-200 transition"
            >
              <PencilIcon  className="h-5 w-5 text-blue-600"
              style={{ color: currentColor }} />
            </button>
            <button
              onClick={() => openDeleteConfirm(defect._id)}
              className="p-1 bg-red-100 rounded-full hover:bg-red-200 transition"
            >
              <TrashIcon  className="h-5 w-5 text-red-600" />
            </button>
          </div>
          {/* Defect details */}
          <Link
            key={defect._id}
            to={`/defects/${defect._id}`}
            className="block p-5 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
          >            
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {defect.defectType}
            </h2>
            <p className="text-gray-600">
              <strong>Status:</strong> {defect.status}
            </p>
            <p className="text-gray-600">
              <strong>Order No:</strong> {defect.orderId?.orderNo || "N/A"} {/* Show orderNo */}
            </p>
            <p className="text-gray-600">
              <strong>Severity:</strong>
              
              <span
              className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
                defect.severity === "High"
                  ? "bg-red-200 text-red-800"
                  : defect.severity === "Medium"
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-green-200 text-green-800"
              }`}
            >
              {defect.severity}
            </span>
            </p>
            <p className="mt-3 text-indigo-600 hover:underline">View Details</p>
          </Link>
          </div>
        ))}
      </div>

      {/* Log Defect Modal */}
      {isModalOpen && <LogDefectModal closeModal={closeModal} onDefectCreated={onDefectCreated} editDefect={editDefect} updateDefectInList={updateDefectInList} currentColor={currentColor} />}

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <ConfirmationModal
          message="Are you sure you want to delete this defect?"
          onConfirm={handleConfirmDelete}
          onCancel={closeConfirm}
        />
      )}
    </div>
  );
};

export default DefectList;
