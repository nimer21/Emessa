import React, { useEffect, useState } from "react";
import { updateOrder, createOrder } from "../services/orderService";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
//import { getMonth, getYear } from "react-datepicker/dist/date_utils";
import { formatDate, getMonth, getYear } from 'date-fns';
//import range from "lodash/range";

const OrderModal = ({
  closeModal,
  onOrderCreated,
  editOrder,
  updateOrderInList,
  currentColor,
}) => {

  const [formData, setFormData] = useState({
    orderNo: "",
    line: "",
    style: "",
    styleNo: "",
    fabricArt: "",
    fabricSupplier: "",
    orderQty: "",
    orderDate: new Date("2015-03-25").toLocaleDateString(), // Initialize with today's date or a valid date,
    customer: "",
    deliveryDate: new Date("2015-03-25").toLocaleDateString(),
    deliveredQty: "",
    currentStage: "Fabric Reservation",
    stageProgress: 0,
    barcode7: "",
    });

    const range = (start, end) => {
      return new Array(end - start).fill().map((d, i) => i + start);
    };

  const [startDate, setStartDate] = useState(new Date());
  const years = range(2005, getYear(new Date()) + 1, 1);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  
    useEffect(() => {
      if (editOrder) {
        setFormData(editOrder); // Load order data for editing
      }
    }, [editOrder]);

    const handleChange = (event) => {
      const { name, value } = event.target; // Destructure name and value from event.target
  
      // Update formData based on input type
      if (name === "orderDate" || name === "deliveryDate") {
        // If it's a date picker, we handle it separately
        setFormData({
          ...formData,
          [name]: new Date(value), // Convert string to Date object
        });
      } else {
        // For other inputs, update normally
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    };
  
   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (editOrder) {
          const updatedOrder = await updateOrder(editOrder._id, formData);
          updateOrderInList(updatedOrder.updatedOrder);
          toast.success(updatedOrder.message);
        } else {
        const newOrder = await createOrder(formData);
        onOrderCreated(newOrder);
        console.log("newOrder ", newOrder);
        toast.success("Order created successfully");
        }
        closeModal();
      } catch (error) {
        console.error("Error creating/editing order:", error);
        toast.error(error.response.data.message);
      }
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl p-4 rounded-lg shadow-lg relative">
        {/* Modal Header */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {editOrder ? "Edit Order" : "Add New Order"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Scrollable Content */}
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            {/* General Details Section */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-600">
                General Details
              </h3>
              <label className="block mb-2">Order ID:</label>
              <input
                type="text"
                name="orderNo"
                value={formData.orderNo}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />

              {/* <label className="block mb-2">Style:</label>
              <input
                type="text"
                name="style"
                value={formData.style}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              /> */}
              <label className="block mb-2">Style:</label>
              <select
                name="style"
                value={formData.style}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              >
                <option value="" disabled>
                  Select a Style
                </option>
                <option value="Cadiz">Cadiz</option>
                <option value="Caren New">Caren New</option>
                <option value="Carola">Carola</option>
                <option value="Chuck">Chuck</option>
                <option value="Lavina Joy">Lavina Joy</option>
                <option value="Lora">Lora</option>
                <option value="Luke">Luke</option>
                <option value="Maine">Maine</option>
                <option value="Mary">Mary</option>
                <option value="Patti straight">Patti straight</option>
                <option value="Shakira">Shakira</option>
                <option value="Thilo">Thilo</option>
              </select>

              <label className="block mb-2">Fabric Article:</label>
              <input
                type="text"
                name="fabricArt"
                value={formData.fabricArt}
                onChange={handleChange}
                //required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />

              <label className="block mb-2">Fabric Supplier:</label>
              <select
                name="fabricSupplier"
                value={formData.fabricSupplier}
                onChange={handleChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              >
                <option value="" disabled>
                  Select a Fabric Supplier
                </option>
                <option value="Sharabati">Sharabati</option>
                <option value="DNM">DNM</option>
                <option value="CALIK">CALIK</option>
                <option value="Orta">Orta</option>
              </select>
            </div>

            {/* Additional Details Section */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-600">
                Additional Details
              </h3>
              {/* New Fields */}
              <label className="block mb-2">Order Date:</label>
              <DatePicker
                showIcon
                //icon="fa fa-calendar"
                //isClearable
                //placeholderText="I have been cleared!"
                //closeOnScroll={(e) => e.target === document}
                name="orderDate" // This can be kept for reference but is not used in onChange
                value={formData.orderDate}
                //value={formData?.orderDate ? formatDate(formData?.orderDate) : ""}
                //onChange={(date) => handleChange(date, 'orderDate')} // Pass field name
                onChange={(date) => handleChange({ target: { name: 'orderDate', value: date } })} // Pass synthetic event-like object
                selected={formData.orderDate}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                renderCustomHeader={({
                  date,
                  changeYear,
                  changeMonth,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div
                    style={{
                      margin: 10,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                      {"<"}
                    </button>
                    <select
                      value={getYear(date)}
                      onChange={({ target: { value } }) => changeYear(value)}
                    >
                      {years.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
          
                    <select
                      value={months[getMonth(date)]}
                      onChange={({ target: { value } }) =>
                        changeMonth(months.indexOf(value))
                      }
                    >
                      {months.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
          
                    <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                      {">"}
                    </button>
                  </div>
                )}
                //selected={startDate}
                //onChange={(date) => setStartDate(date)}                
                />                

              <label className="block mb-2">Order Quantity:</label>
              <input
                type="number"
                name="orderQty"
                value={formData.orderQty}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />

              {/* <label className="block mb-2">Customer:</label>
              <input
                type="text"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              /> */}
              <label className="block mb-2">Customer:</label>
              <select
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              >
                <option value="" disabled>
                  Select a Customer
                </option>
                <option value="BRAX">BRAX</option>
                <option value="CAMEL ACTIVE">CAMEL ACTIVE</option>
                <option value="GERRY WEBER">GERRY WEBER</option>
                <option value="JEAN CARRIERE">JEAN CARRIERE</option>
                <option value="MARC">MARC O’POLO</option>
              </select>

              <label className="block mb-2">Delivery Date:</label>
              <DatePicker
                name="deliveryDate"
                selected={formData.deliveryDate}
                value={formData.deliveryDate}
                //onChange={handleChange}
                //onChange={(date) => handleChange(date, 'deliveryDate')} // Pass field name
                onChange={(date) => handleChange({ target: { name: 'deliveryDate', value: date } })} // Pass synthetic event-like object
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              >                
              </DatePicker>

              <label className="block mb-2">Delivered Quantity:</label>
              <input
                type="number"
                name="deliveredQty"
                value={formData.deliveredQty}
                onChange={handleChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />
              <label className="block mb-2">Current Stage:</label>
              <select
                name="currentStage"
                value={formData.currentStage}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              >
                <option value="" disabled>
                  Select the Current Stage
                </option>
                <option value="Fabric Reservation">Fabric Reservation</option>
                <option value="Cutting">Cutting</option>
                <option value="Stitching">Stitching</option>
                <option value="Finishing">Finishing</option>
                <option value="Completed">Completed</option>
              </select>
              <label className="block mb-2">Barcode7:</label>
              <input
                type="text"
                name="barcode7"
                value={formData.barcode7}
                disabled
                onChange={handleChange}
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
              {editOrder ? "Update Order" : "Save Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
