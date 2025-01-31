import React, { useEffect, useState } from "react";
import { updateOrder, createOrder } from "../services/orderService";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
//import { getMonth, getYear } from "react-datepicker/dist/date_utils";
import { formatDate, getMonth, getYear } from "date-fns";
import {
  fetchCustomers,
  fetchFabrics,
  fetchFabricSuppliers,
  fetchStyles,
} from "../services/masterDataService";
//import range from "lodash/range";

const OrderModal = ({
  closeModal,
  onOrderCreated,
  editOrder,
  updateOrderInList,
  currentColor,
}) => {
  const [formData, setFormData] = useState({
    customer: "",
    style: "",
    styleNo: "",
    season: "",
    articleNo: "",
    keyNo: "",
    //fabricComposition: "",
    orderDate: new Date("2015-03-25").toLocaleDateString(), // Initialize with today's date or a valid date,
    deliveryDate: new Date("2015-03-25").toLocaleDateString(),
    orderQty: "",
    orderNo: "",
    emessaOrderNo: "",
    fabric: "",
    fabricSupplier: "",
    //line: "",
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

  const [styles, setStyles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [fabricSuppliers, setFabricSuppliers] = useState([]);
  const [fabrics, setFabrics] = useState([]);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [stylesData, customersData, suppliersData, fabricsData] = await Promise.all([
          fetchStyles(),
          fetchCustomers(),
          fetchFabricSuppliers(),
          fetchFabrics(),
        ]);
        setStyles(stylesData);
        setCustomers(customersData);
        setFabricSuppliers(suppliersData);
        setFabrics(fabricsData);
      } catch (error) {
        console.error("Error loading master data:", error);
      }
    };
    loadMasterData();
  }, []);

  useEffect(() => {
    if (editOrder) {
      setFormData(editOrder); // Load order data for editing
    }
    //console.log("editOrder: ", editOrder);
  }, [editOrder]);

  // const handleChange = (event) => {
  //   const { name, value } = event.target; // Destructure name and value from event.target
  //   console.log("name: ", name, "value: ", value);

  //   // Define a lookup map for dropdowns that store objects instead of just values
  // const lookupMap = {
  //   style: styles,
  //   customer: customers,
  //   fabric: fabrics,
  // };

  //   // Update formData based on input type
  //   if (name === "orderDate" || name === "deliveryDate") {
  //     // If it's a date picker, we handle it separately
  //     setFormData({
  //       ...formData,
  //       [name]: new Date(value), // Convert string to Date object
  //     });
  //   } else if (name === "style") {
  //     // Find the selected style object from the styles array
  //     const selectedStyle = styles.find(style => style._id === value);
  //     setFormData({
  //       ...formData,
  //       style: selectedStyle || "", // Store the full object, not just the ID
  //     });
  //   } else {
  //     // For other inputs, update normally
  //     setFormData({
  //       ...formData,
  //       [name]: value,
  //     });
  //   }
  // };

  const handleChange = (event) => {
    const { name, value } = event.target;
    //console.log("name:", name, "value:", value);
  
    // Define a lookup map for dropdowns that store objects instead of just values
    const lookupMap = {
      style: styles,
      customer: customers,
      fabric: fabrics,
    };
  
    // Check if the field requires object lookup
    if (lookupMap[name]) {
      setFormData({
        ...formData,
        [name]: lookupMap[name].find(item => item._id === value) || "", // Store object
      });
    } else if (name === "orderDate" || name === "deliveryDate") {
      setFormData({
        ...formData,
        [name]: new Date(value), // Convert date string to Date object
      });
    } else {
      setFormData({
        ...formData,
        [name]: value, // Store value as usual
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editOrder) {
        //console.log("formData: ", formData);
        const updatedOrder = await updateOrder(editOrder._id, formData);
        //console.log("updatedOrder: ", updatedOrder);
        //updateOrderInList(updatedOrder.updatedOrder);
        updateOrderInList(updatedOrder.populatedOrder);
        //toast.success(updatedOrder.message);
        toast.success("Order updated successfully");
      } else {
        const newOrder = await createOrder(formData);
        onOrderCreated(newOrder.populatedOrder);
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
        <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-3 rounded-t-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {editOrder ? "Edit Order" : "Add New Order"}
        </h2>
        <button
          onClick={closeModal}
          className="text-xl font-bold hover:text-gray-300"
        >
          ×
        </button>
      </div>

        <form onSubmit={handleSubmit}>
          {/* Scrollable Content */}
          <div className="max-h-[75vh] overflow-y-auto pr-2 p-4 space-y-6">
            {/* General Details Section */}
            <div className="mb-4 border rounded-lg p-4 shadow-md">
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
              <label className="block mb-2">Emessa Order No:</label>
              <input
                type="text"
                name="emessaOrderNo"
                value={formData.emessaOrderNo}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />
              <label className="block mb-2">Key No:</label>
              <input
                type="text"
                name="keyNo"
                value={formData.keyNo}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />
              <label className="block mb-2">Season:</label>
              <input
                type="text"
                name="season"
                value={formData.season}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />

              {/* Fabric Dropdown */}
              <label className="block mb-2">Fabric:</label>
              <select
                name="fabric"
                value={formData.fabric?._id || ""}
                onChange={(e) => {
                  const selectedFabric = fabrics.find(fabric => fabric._id === e.target.value);
                  const selectedSupplier = fabricSuppliers.find(supplier => supplier._id === selectedFabric?.supplier);
                  //console.log("Selected Fabric: ", selectedFabric);
                  //console.log("Selected Supplier: ", selectedSupplier);
                  setFormData(prevState => ({
                    ...prevState,
                    fabric: selectedFabric || "",
                    fabricSupplier: selectedSupplier || "", // Update supplier dynamically
                  }));
                }}
                required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              >
                <option value="" disabled>
                  Select a Fabric
                </option>
                {fabrics.map((fabric) => (
                  <option key={fabric._id} value={fabric._id}>
                    {fabric.name}
                  </option>
                ))}
              </select>
              {/* Fabric Supplier Dropdown (Disabled) */}
              <label className="block mb-2">Fabric Supplier:</label>
              <select
                name="fabricSupplier"
                value={formData.fabricSupplier?._id || ""}
                //onChange={handleChange}
                readOnly
                //defaultValue={formData.fabricSupplier?._id || ""}
                className="w-full p-2 mb-4 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
              >
                <option value="" disabled>
                  Select a Fabric Supplier
                </option>
                {fabricSuppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>

              {/* Style Dropdown */}
              <label className="block mb-2">Style:</label>
              <select
                name="style"
                value={formData.style?._id || ""}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              >
                <option value="" disabled>
                  Select a Style
                </option>
                {styles.map((style) => (
                  <option key={style._id} value={style._id}>
                    {style.name}
                  </option>
                ))}
              </select>

              <label className="block mb-2">Style Number:</label>
              <input
                type="text"
                name="styleNo"
                value={formData.styleNo}
                onChange={handleChange}
                //required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />

              <label className="block mb-2">Article Number:</label>
              <input
                type="text"
                name="articleNo"
                value={formData.articleNo}
                onChange={handleChange}
                //required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />
              {/* <label className="block mb-2">Fabric Composition:</label>
              <input
                type="text"
                name="fabricComposition"
                value={formData.fabricComposition}
                onChange={handleChange}
                //required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              /> */}              
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
                onChange={(date) =>
                  handleChange({ target: { name: "orderDate", value: date } })
                } // Pass synthetic event-like object
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
                    <button
                      onClick={decreaseMonth}
                      disabled={prevMonthButtonDisabled}
                    >
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

                    <button
                      onClick={increaseMonth}
                      disabled={nextMonthButtonDisabled}
                    >
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

              {/* Customer Dropdown */}
              <label className="block mb-2">Customer:</label>
              <select
                name="customer"
                value={formData.customer?._id || ""}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              >
                <option value="" disabled>
                  Select a Customer
                </option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name}
                  </option>
                ))}
              </select>

              <label className="block mb-2">Delivery Date:</label>
              <DatePicker
                name="deliveryDate"
                selected={formData.deliveryDate}
                value={formData.deliveryDate}
                //onChange={handleChange}
                //onChange={(date) => handleChange(date, 'deliveryDate')} // Pass field name
                onChange={(date) =>
                  handleChange({
                    target: { name: "deliveryDate", value: date },
                  })
                } // Pass synthetic event-like object
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              ></DatePicker>

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
              <label className="block mb-2">Barcode:</label>
              <input
                type="text"
                name="barcode7"
                value={formData.barcode7}
                disabled
                onChange={handleChange}
                className="w-full border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="inset-x-0 bottom-0 bg-gray-100 px-4 py-3 flex justify-between space-x-2 rounded-b-lg">
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
