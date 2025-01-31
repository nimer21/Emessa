// Frontend: FabricModal.js (React)
import React, { useState, useEffect } from "react";
import { fetchFabricSuppliers, fetchCompositionItems, createFabric } from "../services/masterDataService";

const FabricModal = ({ closeModal }) => {
    const [formData, setFormData] = useState({ name: "", code: "", color: "", supplier: "", compositions: [] });
    const [suppliers, setSuppliers] = useState([]);
    const [compositionItems, setCompositionItems] = useState([]);
    const [selectedComposition, setSelectedComposition] = useState("");
    const [percentage, setPercentage] = useState("");

    useEffect(() => {
        fetchFabricSuppliers().then(setSuppliers);
        fetchCompositionItems().then(setCompositionItems);
    }, []);

    const addComposition = () => {
        if (selectedComposition && percentage) {
            const selectedCompositionItem = compositionItems.find(compositionItem => compositionItem._id === selectedComposition);
            if (selectedCompositionItem) {
            setFormData(prev => ({
                ...prev,
                compositions: [...prev.compositions, { compositionCode: selectedComposition, compositionName: selectedCompositionItem.name, value: percentage }]
            }));
            }
            setSelectedComposition("");
            setPercentage("");
        }
    };

    const totalPercentage = formData.compositions.reduce((sum, comp) => sum + parseInt(comp.value), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (totalPercentage !== 100) return alert("Total composition must be 100%");
        await createFabric(formData);
        closeModal();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-1/3">
                <h2 className="text-xl font-bold mb-4">Create New Fabric</h2>
                <input className="w-full p-2 mb-2 border" type="text" placeholder="Fabric Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <input className="w-full p-2 mb-2 border" type="text" placeholder="Fabric Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                <input className="w-full p-2 mb-2 border" type="text" placeholder="Color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                <select className="w-full p-2 mb-2 border" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}>
                    <option value="">Select Supplier</option>
                    {suppliers.map(sup => <option key={sup._id} value={sup._id}>{sup.name}</option>)}
                </select>
                <div className="mb-2">
                    <select value={selectedComposition} onChange={(e) => setSelectedComposition(e.target.value)} className="p-2 border mr-2">
                        <option value="">Select Composition</option>
                        {compositionItems.map(comp => <option key={comp._id} value={comp._id}>{comp.name}</option>)}
                    </select>
                    <input type="number" className="p-2 border w-20" value={percentage} onChange={(e) => setPercentage(e.target.value)} placeholder="%" />
                    <button className="bg-blue-500 text-white p-2 ml-2" onClick={addComposition}>Add</button>
                </div>
                <ul>
                    {formData.compositions.map((comp, index) => (
                        <li key={index}>{comp.compositionName} - {comp.value}%</li>
                    ))}
                </ul>
                <p className="text-red-500">Total: {totalPercentage}%</p>
                <button className="bg-green-500 text-white p-2 mt-4" disabled={totalPercentage !== 100} onClick={handleSubmit}>Save</button>
                <button className="bg-gray-300 p-2 ml-2" onClick={closeModal}>Cancel</button>
            </div>
        </div>
    );
};

export default FabricModal;
