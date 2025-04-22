import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchDefectsForOrder, addDefectToOrder } from "../services/defectService";
import { useStateContext } from "../contexts/ContextProvider";
import Spinner from "../components/Spinner";
import ProgressBar from "../components/ProgressBar";
import { Clock, Package, Users, Tag, Calendar, Box, FileText, MapPin, AlertTriangle, ArrowLeft, Plus } from "lucide-react";
import { toast } from "react-toastify";

const OrderDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentColor } = useStateContext();
  const order = location.state?.order;
  
  const [isLoading, setIsLoading] = useState(true);
  const [defects, setDefects] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [orderTimeline, setOrderTimeline] = useState([]);
  const [newDefect, setNewDefect] = useState({
    defectType: "",
    description: "",
    severity: "Low",
  });
  const [showDefectForm, setShowDefectForm] = useState(false);

  useEffect(() => {
    if (!order || !order._id) {
      navigate("/orders");
      return;
    }

    const loadData = async () => {
      try {
        // Fetch defects for this order
        const defectsData = await fetchDefectsForOrder(order._id);
        setDefects(defectsData);
        
        // Mock timeline data - in a real app, you'd fetch this from your API
        setOrderTimeline([
          { date: new Date(order.orderDate), status: "Order Created", description: "Order was created in the system" },
          { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: "Fabric Sourced", description: "Fabric materials have been sourced" },
          { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: "Production Started", description: "Order has entered production phase" },
        ]);
      } catch (error) {
        console.error("Error loading order data:", error);
        toast.error("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [order, navigate]);

  const handleAddDefect = async () => {
    if (!newDefect.defectType || !newDefect.description) {
      toast.warning("Please fill in all defect details");
      return;
    }
    
    try {
      const createdDefect = await addDefectToOrder(order._id, newDefect);
      setDefects([...defects, createdDefect]);
      setNewDefect({ defectType: "", description: "", severity: "Low" });
      setShowDefectForm(false);
      toast.success("Defect added successfully");
    } catch (error) {
      console.error("Error adding defect:", error);
      toast.error("Failed to add defect");
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!order) {
    return <div className="p-6 text-center text-red-500">Order not found</div>;
  }

  const calculatedProgress = order.stageProgress || 35; // Fallback to 35% if not available

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with back button and order ID */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate("/orders")}
          className="flex items-center mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Orders
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Order #{order.orderNo}
        </h1>
      </div>

      {/* Order Status and Progress */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {order.style?.name || "Style Not Specified"} - {order.styleNo}
            </h2>
            <p className="text-sm text-gray-500">
              Created on {new Date(order.orderDate).toLocaleDateString()}
            </p>
          </div>
          {/* <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-600 mb-2">Production Progress</span>
            <div className="w-64">
              <ProgressBar 
                progress={calculatedProgress} 
                currentStage={order.currentStage || "Production"} 
              />
            </div>
          </div> */}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button 
            className={`px-6 py-3 font-medium ${activeTab === "overview" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("overview")}
            style={activeTab === "overview" ? { borderColor: currentColor, color: currentColor } : {}}
          >
            Overview
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === "defects" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("defects")}
            style={activeTab === "defects" ? { borderColor: currentColor, color: currentColor } : {}}
          >
            Defects ({defects.length})
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === "timeline" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("timeline")}
            style={activeTab === "timeline" ? { borderColor: currentColor, color: currentColor } : {}}
          >
            Timeline
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Order Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Order Number</p>
                    <p className="font-medium">{order.orderNo}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Order Quantity</p>
                    <p className="font-medium">{order.orderQty.toLocaleString()}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Season</p>
                    <p className="font-medium">{order.season || "Not specified"}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Key Number</p>
                    <p className="font-medium">{order.keyNo || "Not specified"}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Article Number</p>
                    <p className="font-medium">{order.articleNo || "Not specified"}</p>
                  </div>
                  <div className="mb-4 col-span-2">
                    <p className="text-sm text-gray-500">Current Stage</p>
                    <p className="font-medium">{order.currentStage || "Production"}</p>
                  </div>
                </div>
              </div>

              {/* Customer & Brand Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Customer & Brand Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{order.customer?.name || "Not specified"}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Brand</p>
                    <p className="font-medium">{order.brand?.name || "Not specified"}</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-4 mt-6 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Style Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Style Name</p>
                    <p className="font-medium">{order.style?.name || "Not specified"}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Style Number</p>
                    <p className="font-medium">{order.styleNo || "Not specified"}</p>
                  </div>
                </div>
              </div>

              {/* Fabric Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Fabric Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Fabric Name</p>
                    <p className="font-medium">{order.fabric?.name || "Not specified"}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Fabric Code</p>
                    <p className="font-medium">{order.fabric?.code || "Not specified"}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Supplier</p>
                    <p className="font-medium">{order.fabricSupplier?.name || "Not specified"}</p>
                  </div>
                  <div className="mb-4 md:col-span-2">
                    <p className="text-sm text-gray-500">Composition</p>
                    <p className="font-medium">
                      {order.fabric?.fabricCompositions?.length > 0
                        ? order.fabric.fabricCompositions
                            // .map((fc) => `${fc.compositionItem?.abbrPrefix || ""}${fc.value}`)
                            .map((fc) => `${fc.compositionItem?.name || ""} ${fc.value}`)
                            .join(", ")
                        : "No composition data available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Defects Tab */}
          {activeTab === "defects" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Order Defects</h3>
                <button
                  onClick={() => setShowDefectForm(!showDefectForm)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                  style={{ backgroundColor: currentColor }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {showDefectForm ? "Cancel" : "Add Defect"}
                </button>
              </div>

              {/* Add Defect Form */}
              {showDefectForm && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                  <h4 className="font-medium mb-3">New Defect</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Defect Type</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Stitching Issue"
                        value={newDefect.defectType}
                        onChange={(e) => setNewDefect({ ...newDefect, defectType: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newDefect.severity}
                        onChange={(e) => setNewDefect({ ...newDefect, severity: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        placeholder="Describe the defect..."
                        value={newDefect.description}
                        onChange={(e) => setNewDefect({ ...newDefect, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddDefect}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                      style={{ backgroundColor: currentColor }}
                    >
                      Submit Defect
                    </button>
                  </div>
                </div>
              )}

              {/* Defects List */}
              {defects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Reported</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {defects.map((defect) => (
                        <tr key={defect._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">{defect.defectType?.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{defect.defectCount}</td>
                          <td className="px-6 py-4">{defect.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(defect.severity)}`}>
                              {defect.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{defect.status || "Open"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {defect.detectedDate 
                              ? new Date(defect.detectedDate).toLocaleDateString() 
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No defects have been reported for this order</p>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Order Timeline</h3>
              <div className="relative">
                {orderTimeline.map((event, index) => (
                  <div key={index} className="mb-8 flex">
                    <div className="flex flex-col items-center mr-4">
                      <div 
                        className="rounded-full h-10 w-10 flex items-center justify-center z-10"
                        style={{ backgroundColor: currentColor }}
                      >
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      {index < orderTimeline.length - 1 && (
                        <div className="h-full w-0.5 bg-gray-300 -mt-2"></div>
                      )}
                    </div>
                    <div className="pt-1.5">
                      <p className="font-medium">{event.status}</p>
                      <p className="text-sm text-gray-500">{event.date.toLocaleDateString()}</p>
                      <p className="mt-1 text-gray-600">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Optimization Suggestions Panel */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-md mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Order Optimization Insights</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-2 text-blue-700">Similar fabric orders can be consolidated to reduce supplier costs by approximately 12%.</p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-2 text-blue-700">Based on historical data, this order type typically completes 15% faster when paired with style #{order.styleNo?.substring(0, 2)}XXX series.</p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-blue-600 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-2 text-blue-700">Defect rate for this fabric type is 3.2% above average. Consider additional QA checkpoints during production.</p>
          </li>
        </ul>
      </div> */}
      
    </div>
  );
};

export default OrderDetails;