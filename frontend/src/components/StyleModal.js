import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { createStyle, fetchBrands, fetchCustomers } from "../services/masterDataService";

const StyleModal = ({ isOpen, closeModal }) => {
  const [formData, setFormData] = useState({
    customer: "",
    brand: "",
    styleName: "",
    styleNo: "",
  });
  const [customers, setCustomers] = useState([]);
  const [brands, setBrands] = useState([]);
  useEffect(() => {
          fetchCustomers().then(setCustomers);
          fetchBrands().then(setBrands);
      }, []);

  useEffect(() => {
    if (formData.customer) {
      const filteredBrands = brands.filter((b) => b.customer === formData.customer);
      setFormData((prev) => ({ ...prev, brand: filteredBrands.length ? filteredBrands[0]._id : "" }));
    }
  }, [formData.customer, brands]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer || !formData.brand || !formData.styleName || !formData.styleNo) {
      alert("Please fill all fields correctly");
      return;
    }
    //onSave(formData);
    await createStyle(formData);
    closeModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative animate-fadeIn">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="text-lg font-semibold">Create New Style</h2>
          <button onClick={closeModal} className="text-2xl hover:text-gray-300 transition-all">
            <IoClose />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          
          {/* Customer Selection */}
          <div>
            <label className="block text-gray-700">Customer</label>
            <select name="customer" value={formData.customer} onChange={handleChange} className="select-field">
              <option value="" disabled>Select a Customer</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>{customer.name}</option>
              ))}
            </select>
          </div>

          {/* Brand Auto-Population */}
          <div>
            <label className="block text-gray-700">Brand</label>
            <select name="brand" value={formData.brand} className="select-field bg-gray-100 cursor-not-allowed" disabled>
              <option value="" disabled>Select a Brand</option>
              {brands.filter((b) => b.customer === formData.customer).map((brand) => (
                <option key={brand._id} value={brand._id}>{brand.name}</option>
              ))}
            </select>
          </div>

          {/* Style Name */}
          <div>
            <label className="block text-gray-700">Style Name</label>
            <input type="text" name="styleName" value={formData.styleName} onChange={handleChange} className="input-field" placeholder="Enter Style Name" />
          </div>

          {/* Style No */}
          <div>
            <label className="block text-gray-700">Style No</label>
            <input type="text" name="styleNo" value={formData.styleNo} onChange={handleChange} className="input-field" placeholder="Enter Style Number" />
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeModal} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-save">Save Style</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StyleModal;
