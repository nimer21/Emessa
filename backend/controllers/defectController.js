// controllers/defectController.js
const Defect = require("../models/Defect");
const Order = require("../models/Order");

// Log a new defect // Create a defect and associate it with an order
exports.createDefect = async (req, res) => {
  try {
    console.log("Received defect data:", req.body); // Log submitted data for debugging

    const { orderId, defectType, defectName, description, severity, assignedTo, month, productionLine } = req.body;
    const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : null; // Get image path if uploaded
    //console.log("Image path:", imagePath);  // Log the image path for debugging | Image path: uploads\1731320027611-test.jpg
     // Check if an image file was uploaded
     /**
      * The issue is likely due to the fact that Windows systems use backslashes (\) as the default path separator,
      *  while URLs require forward slashes (/). When multer saves the file path on a Windows machine, it may use backslashes,
      *  which can cause issues when you try to display the image in a web application.
      */
    //  if (req.file) {
    //   imagePath = req.file.path.replace(/\\/g, "/"); // Convert backslashes to forward slashes
    // }

    const newDefect = new Defect({
      orderId,
      defectType,
      defectName,
      description,
      severity,
      assignedTo,
      image: imagePath, // Save the image path in the database
      month, // New field
      productionLine, // New field
    });
    // Create a new defect
    //const newDefect = new Defect(defectData);
    const savedDefect = await newDefect.save();

    // Associate the defect with the order
    await Order.findByIdAndUpdate(newDefect.orderId, {
      $push: { defects: savedDefect._id },
    });

    // Populate the orderId field with orderNo
    const populatedDefect = await Defect.findById(savedDefect._id).populate("defectName", "name")
    .populate("defectType", "name")
    .populate("orderId", "orderNo");

    res.status(201).json({ message: "Backend: Defect created and associated with order", populatedDefect });
  } catch (error) {
    res.status(400).json({ message: "Backend: Error logging defect", error });
  }
};

// Retrieve all defects with pagination, search, and sorting
exports.getDefects = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      sortField = "detectedDate", 
      sortOrder = "desc",
      severity = "",
      defectType = "",
      month = "" 
    } = req.query;
    
    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build filter object
    let filters = {};
    
    // Add search functionality
    if (search) {
      filters.$or = [
        { description: { $regex: search, $options: 'i' } },
        // Add more searchable fields as needed
      ];
      
      // Also search in related order's orderNo
      const orders = await Order.find({ 
        orderNo: { $regex: search, $options: 'i' } 
      }).select('_id');
      
      const orderIds = orders.map(order => order._id);
      if (orderIds.length > 0) {
        filters.$or.push({ orderId: { $in: orderIds } });
      }
    }
    
    // Add filter by severity if provided
    if (severity) {
      filters.severity = severity;
    }
    
    // Add filter by defectType if provided
    if (defectType) {
      filters.defectType = defectType;
    }
    
    // Add filter by month if provided
    if (month) {
      filters.month = month;
    }
    
    // Create sort object
    const sort = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;
    
    // Count total documents
    const totalDocuments = await Defect.countDocuments(filters);
    const totalPages = Math.ceil(totalDocuments / limitNum);
    
    // Fetch defects with pagination, filters, and sorting
    const defects = await Defect.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate("orderId", "orderNo") // Populate orderId with only orderNo field
      .populate({
        path: "defectName",
        select: "name"
      })
      .populate({
        path: "defectType",
        select: "name"
      });
      
    // Create pagination object
    const pagination = {
      page: pageNum,
      limit: limitNum,
      totalPages,
      totalItems: totalDocuments
    };
    
    res.status(200).json({ data: defects, pagination });
  } catch (error) {
    console.error("Error retrieving defects:", error);
    res.status(400).json({ message: "Error retrieving defects", error });
  }
};

// Update defect status
exports.updateDefectStatus = async (req, res) => {
  const { id } = req.params;
  const { status, assignedTo } = req.body;

  try {
    const defect = await Defect.findById(id);
    if (!defect) return res.status(404).json({ message: "Defect not found" });

    defect.status = status;
    defect.assignedTo = assignedTo || defect.assignedTo;
    
    // Set resolved date if status is resolved
    if (status === "Resolved") defect.resolvedDate = new Date();

    await defect.save();
    res.status(200).json(defect);
  } catch (error) {
    res.status(500).json({ message: "Error updating defect status", error });
  }
};

// Add resolution details
exports.addResolution = async (req, res) => {
  const { id } = req.params;
  const { actionTaken, verifiedBy } = req.body;

  try {
    const defect = await Defect.findById(id);
    if (!defect) return res.status(404).json({ message: "Defect not found" });

    defect.resolution = {
      actionTaken,
      verifiedBy,
      resolutionDate: new Date()
    };
    defect.status = "Resolved";
    defect.resolvedDate = new Date();

    await defect.save();
    res.status(200).json(defect);
  } catch (error) {
    res.status(500).json({ message: "Error adding resolution", error });
  }
};

// Retrieve a specific defect by ID
exports.getDefectById = async (req, res) => {
  //console.log("Fetching defect with ID:", req.params.id);
  try {
    const defect = await Defect.findById(req.params.id)
    .populate("orderId", "orderNo") // Populate orderId with only orderNo field;
    .populate({
      path: "defectName",
      select: "name"
    })
    .populate({
      path: "defectType",
      select: "name"
    })
    .exec();
    if (!defect) return res.status(404).json({ message: "Defect not found" });
    res.status(200).json(defect);
  } catch (error) {
    res.status(500).json({ message: "Error fetching defect details", error });
  }
};

exports.updateDefect = async (req, res) => {
  try {
    //console.log("Received req.params id: ", req.params); // Log submitted data for debugging
    //console.log("Received defect data: ", req.body); // Log submitted data for debugging
    const { id } = req.params; // Get defect ID from URL
    const updates = { ...req.body }; // Get text fields from request body
    //const { batchId, defectType, description, severity, assignedTo } = req.body;

    // Check if an image file was uploaded
    if (req.file) {
      updates.image = req.file.path.replace(/\\/g, "/"); // Save the image path in the updates
    }

     // Find the defect to check its current order association
     const existingDefect = await Defect.findById(id);
     if (!existingDefect) {
       return res.status(404).json({ message: "Defect not found" });
     }

    // Find defect by ID and update it with new data
    const updatedDefect = await Defect.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    //console.log("updatedDefect: ", updatedDefect);

    if (!updatedDefect) {
      return res.status(404).json({ message: "Defect not found after update" });
    }

    // Remove the defect from the old order's defects array
    if (existingDefect.orderId.toString() !== updates.orderId) {
      await Order.findByIdAndUpdate(existingDefect.orderId, {
        $pull: { defects: existingDefect._id },
      });
    }
    // Add the defect to the new order's defects array
    await Order.findByIdAndUpdate(updates.orderId, {
      $push: { defects: updatedDefect._id },
    });

    const populatedDefect = await Defect.findById(updatedDefect._id).populate("orderId", "orderNo").populate("defectName", "name")
    .populate("defectType", "name");

    res.status(200).json(populatedDefect); // Send updated defect data back to client
  } catch (error) {
    console.error("Backend: Error updating defect:", error);
    res.status(500).json({ message: "Error updating defect", error });
  }
};

exports.deleteDefect = async (req, res) => {
  try {
    const { id } = req.params;
    console.error("deleting Defect id:", id);

    // Find the defect by ID and delete it
    const deletedDefect = await Defect.findByIdAndDelete(id);

    if (!deletedDefect) {
      return res.status(404).json({ message: "Defect not found" });
    }

    if (deletedDefect && deletedDefect.orderId) {
      await Order.findByIdAndUpdate(deletedDefect.orderId, {
        $pull: { defects: deletedDefect._id },
      });
    }

    res.status(200).json({ message: "Defect deleted successfully" });
  } catch (error) {
    console.error("Error deleting defect:", error);
    res.status(500).json({ message: "Error deleting defect", error });
  }

    // try {
    //   const defect = await Defect.findById(req.params.id);
    //   console.error("req.params.id: ", req.params.id);
    //   console.error("deleting defect:", defect);
    //   if (!defect) {
    //     console.error("Inside If:");
    //     return res.status(404).json({ message: "Defect not found" });
    //   }
    //   console.error("before defect.remove():");
    //   await defect.remove(); // Triggers the middleware
    //   console.error("After defect.remove():");
    //   res.status(200).json({ message: "Defect deleted successfully" });
    // } catch (error) {
    //   res.status(500).json({ message: "Error deleting defect", error });
    // }
};

exports.resolvedDefect = async (req, res) => {
  try {
    const defect = await Defect.findByIdAndUpdate(
      req.params.id,
      { status: "Resolved", resolvedDate: Date.now() },
      { new: true }
    );

    if (!defect) {
      return res.status(404).json({ message: "Defect not found" });
    }

    res.status(200).json({ message: "Defect resolved", defect });
  } catch (error) {
    res.status(500).json({ message: "Error resolving defect", error });
  }
};
