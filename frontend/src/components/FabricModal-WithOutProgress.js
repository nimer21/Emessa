import React, { useState, useEffect } from "react";
import { fetchFabricSuppliers, fetchCompositionItems, createFabric } from "../services/masterDataService";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";

const FabricModal = ({ closeModal }) => {
    const [formData, setFormData] = useState({
        name: "", code: "", color: "", supplier: "", compositions: []
    });
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
            const selectedComp = compositionItems.find(comp => comp._id === selectedComposition);
            if (selectedComp) {
                setFormData(prev => ({
                    ...prev,
                    compositions: [...prev.compositions, { compositionCode: selectedComposition, compositionName: selectedComp.name, value: parseInt(percentage) }]
                }));
            }
            setSelectedComposition("");
            setPercentage("");
        }
    };

    const removeComposition = (index) => {
        setFormData(prev => ({
            ...prev,
            compositions: prev.compositions.filter((_, i) => i !== index)
        }));
    };

    const totalPercentage = formData.compositions.reduce((sum, comp) => sum + comp.value, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (totalPercentage !== 100) return toast.error("Total composition must be 100%!");
        await createFabric(formData);
        toast.success("Fabric created successfully!");
        closeModal();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold">Create New Fabric</h2>
                    <button onClick={closeModal} className="text-gray-500 hover:text-red-500">×</button>
                </div>
                
                {/* Form Fields */}
                <div className="mt-4 space-y-4">
                    <input className="w-full p-2 border rounded" type="text" placeholder="Fabric Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <input className="w-full p-2 border rounded" type="text" placeholder="Fabric Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                    <input className="w-full p-2 border rounded" type="text" placeholder="Color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                    <select className="w-full p-2 border rounded" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}>
                        <option value="">Select Supplier</option>
                        {suppliers.map(sup => <option key={sup._id} value={sup._id}>{sup.name}</option>)}
                    </select>
                </div>

                {/* Composition Section */}
                <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-semibold mb-2">Fabric Composition</h3>
                    <div className="flex gap-2 mb-2">
                        <select value={selectedComposition} onChange={(e) => setSelectedComposition(e.target.value)} className="p-2 border flex-grow">
                            <option value="">Select Composition</option>
                            {compositionItems.map(comp => <option key={comp._id} value={comp._id}>{comp.name}</option>)}
                        </select>
                        <input type="number" className="p-2 border w-20" value={percentage} onChange={(e) => setPercentage(e.target.value)} placeholder="%" />
                        <button className="bg-blue-500 text-white p-2 rounded" onClick={addComposition}>Add</button>
                    </div>
                    
                    {/* Composition Table */}
                    <table className="w-full border mt-2 bg-white">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2">Composition</th>
                                <th className="p-2">%</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.compositions.map((comp, index) => (
                                <tr key={index} className="border">
                                    <td className="p-2">{comp.compositionName}</td>
                                    <td className="p-2">{comp.value}%</td>
                                    <td className="p-2 text-center">
                                        <button onClick={() => removeComposition(index)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className={`text-right mt-2 ${totalPercentage === 100 ? "text-green-600" : "text-red-500"}`}>Total: {totalPercentage}%</p>
                </div>

                {/* Buttons */}
                <div className="mt-4 flex justify-between">
                    <button onClick={closeModal} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Cancel</button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" disabled={totalPercentage !== 100} onClick={handleSubmit}>Save Fabric</button>
                </div>
            </div>
        </div>
    );
};

export default FabricModal;
