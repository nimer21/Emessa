import React, { useState, useEffect } from "react";
import { fetchFabricSuppliers, fetchCompositionItems, createFabric } from "../services/masterDataService";
import { Progress } from "./ui/progress";
import { Card } from "./ui/card";
import { Button } from "./ui/button";


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

    const removeComposition = (index) => {
        const updatedCompositions = [...formData.compositions];
        updatedCompositions.splice(index, 1);
        setFormData({ ...formData, compositions: updatedCompositions });
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
            <Card className="w-1/3 p-6 bg-white shadow-lg rounded-lg">
                <h2 className="text-xl font-bold mb-4">Create New Fabric</h2>
                
                <input className="w-full p-2 mb-2 border rounded" type="text" placeholder="Fabric Name" 
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <input className="w-full p-2 mb-2 border rounded" type="text" placeholder="Fabric Code" 
                    value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                <input className="w-full p-2 mb-2 border rounded" type="text" placeholder="Color" 
                    value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
    
                <select className="w-full p-2 mb-2 border rounded" value={formData.supplier} 
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}>
                    <option value="">Select Supplier</option>
                    {suppliers.map(sup => <option key={sup._id} value={sup._id}>{sup.name}</option>)}
                </select>
    
                {/* Composition Section */}
                <div className="mb-4 flex items-center gap-2">
                    <select value={selectedComposition} onChange={(e) => setSelectedComposition(e.target.value)} 
                        className="p-2 border rounded flex-1">
                        <option value="">Select Composition</option>
                        {compositionItems.map(comp => <option key={comp._id} value={comp._id}>{comp.name}</option>)}
                    </select>
                    <input type="number" className="p-2 border w-20 rounded" value={percentage} 
                        onChange={(e) => setPercentage(e.target.value)} placeholder="%" />
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded" onClick={addComposition}>
                        Add
                    </Button>
                </div>
    
                {/* Composition Grid */}
                <div className="border rounded-lg p-3 bg-gray-50">
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
                                        <Button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" 
                                            onClick={() => removeComposition(index)}>✖</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
    
                {/* Progress Bar */}
                <div className="my-4">
                    <Progress value={totalPercentage} />
                    <p className="text-sm text-gray-600 mt-1">Total Composition: {totalPercentage}%</p>
                </div>
    
                {/* Footer Buttons - Fixed UI Issue */}
                <div className="mt-4 flex justify-between items-center border-t pt-4">
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded" 
                        disabled={totalPercentage !== 100} onClick={handleSubmit}>
                        Save
                    </Button>
                    <Button className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded" 
                        onClick={closeModal}>
                        Cancel
                    </Button>
                </div>
            </Card>
        </div>
    );
    
};

export default FabricModal;
