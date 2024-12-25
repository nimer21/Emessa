const Defect = require("../models/Defect");
const Order = require("../models/Order");

const generateBarcode7 = () => {
  // Generate a short alphanumeric reference (e.g., 4dbdf)
  return Math.random().toString(36).substring(2, 15);
};

const stageMapping = {
  "Fabric Reservation": 0,
  "Cutting": 25,
  "Stitching": 50,
  "Finishing": 75,
  "Completed": 100,
};

// Dynamically set progress based on the stage
const calculateProgress = (currentStage) => stageMapping[currentStage] || 0;


// Order Creation or Update with Validation
exports.createOrUpdateOrder = async (req, res) => {
  try {
    const { orderNo, ...otherFields } = req.body;

    // Normalize orderNo by trimming spaces
    const normalizedOrderNo = orderNo.toString().trim();

    // Check if normalizedOrderNo already exists
    const existingOrder = await Order.findOne({ orderNo: normalizedOrderNo });

    if (existingOrder) {
      if (!req.params.id || req.params.id !== existingOrder._id.toString()) {
        return res.status(400).json({
          message: "Order number already exists. Please use a unique order number.",
        });
      }
    }

    let order;

    // If id is provided, update the order
    if (req.params.id) {
      order = await Order.findByIdAndUpdate(
        req.params.id,
        { orderNo: normalizedOrderNo, ...otherFields },
        { new: true, runValidators: true }
      );
      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }
      order.stageProgress = calculateProgress(order.currentStage);
    } else {
      // Otherwise, create a new order
      order = new Order({ orderNo: normalizedOrderNo, ...otherFields });
      order.barcode7 = generateBarcode7(); // Generate Barcode7
      await order.save();
    }

    res.status(200).json({ message: "Backend: Order Created/Updated Successfully", order });
  } catch (error) {
    console.error("Error creating or updating order:", error);
    res.status(500).json({ message: "Error creating or updating order", error });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
    try {
      const { orderNo, ...otherFields } = req.body;

      // Normalize orderNo by trimming spaces
      const normalizedOrderNo = orderNo.toString().trim();

    // Check if normalizedOrderNo already exists
    const existingOrder = await Order.findOne({ orderNo: normalizedOrderNo });

    if (existingOrder) {
      if (!req.params.id || req.params.id !== existingOrder._id.toString()) {
        return res.status(400).json({ message: "Order number already exists. Please use a unique order number." });
      }
    }
      const newOrder = new Order({ orderNo: normalizedOrderNo, ...otherFields });
      // Generate a case reference
      newOrder.barcode7 = generateBarcode7(); // Generate Barcode7
      const savedOrder = await newOrder.save();
      res.status(201).json(savedOrder);
    } catch (error) {
      res.status(500).json({ message: "Error creating order", error });
    }
  };

  // Get all orders
  // Get orders with pagination, sorting, and filtering
  exports.getAllOrders = async (req, res) => {
    try {
      // const orders = await Order.find().populate("defects");
      // res.status(200).json(orders);
      // Extract query parameters
    const {
      page = 1,          // Default page number
      limit = 10,        // Default number of items per page
      sortField = "orderDate", // Default sort field
      sortOrder = "desc", // Default sort order
      search,            // Optional search query
      style,             // Optional filter by style
    } = req.query;
    // Build query filters
    const filter = {};
    if (search) {
      filter.$or = [
        { orderNo: { $regex: search, $options: "i" } },
        { line: { $regex: search, $options: "i" } },
        { style: { $regex: search, $options: "i" } },
      ];
    }
    if (style) {
      filter.style = style;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch data with filters, sorting, and pagination
    const orders = await Order.find(filter)
      .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    // Get total count for pagination metadata
    const total = await Order.countDocuments(filter);

// Calculate progress for each order
// orders.stageProgress = calculateProgress(orders.currentStage);
    orders.forEach((order) => {
      order.stageProgress = calculateProgress(order.currentStage);
    });

    res.status(200).json({
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });

    } catch (error) {
      res.status(500).json({ message: "Error fetching orders", error });
    }
  };

  // Update an order
  exports.updateOrder = async (req, res) => {
    try {
      const { orderNo, ...otherFields } = req.body;
      // Normalize orderNo by trimming spaces
      const normalizedOrderNo = orderNo.toString().trim();
      // Check if orderNo already exists (for creation and update) // Check if normalizedOrderNo already exists
      const existingOrder = await Order.findOne({ orderNo: normalizedOrderNo });
      if (existingOrder) {
        if (!req.params.id || req.params.id !== existingOrder._id.toString()) {
          return res.status(400).json({ message: "Order number already exists. Please use a unique order number." });
        }
      }
      const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found." });
      }
      updatedOrder.stageProgress = calculateProgress(updatedOrder.currentStage);
      res.status(200).json({ message: "Backend: Order Updated Successfully", updatedOrder });
    } catch (error) {
      res.status(500).json({ message: "Error updating order", error });
    }
  };
  
// Delete an order
exports.deleteOrder = async (req, res) => {
    try {
      await Order.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting order", error });
    }
  };

  // Tiger this is not used (Also in the frontend defectService.js => addDefectToOrder) also in routes
  // Add a defect to an order
  exports.addDefectToOrder = async (req, res) => {
    try {
      const { orderId } = req.params;
      const newDefect = new Defect({ ...req.body, orderId });
      const savedDefect = await newDefect.save();
  
      // Add defect to order's defects array
      await Order.findByIdAndUpdate(orderId, {
        $push: { defects: savedDefect._id },
      });
  
      res.status(201).json(savedDefect);
    } catch (error) {
      res.status(500).json({ message: "Error adding defect to order", error });
    }
  };

  // Get defects for an order
  exports.getDefectsForOrder = async (req, res) => {
    try {
      const defects = await Defect.find({ orderId: req.params.orderId });
      res.status(200).json(defects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching defects for order", error });
    }
  };