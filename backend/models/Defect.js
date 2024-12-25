const mongoose = require("mongoose");
const Order = require("./Order");

const DefectSchema = new mongoose.Schema({
  //defectSection: { type: String, required: true }, // Section (e.g., Cutting, Sewing)
  //defectProcess: { type: String, required: true }, // Process (e.g., Stitching, Hemming)
  defectType: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ["Low", "Medium", "High"], required: true },
  status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" },
  detectedDate: { type: Date, default: Date.now },
  resolvedDate: { type: Date },
  assignedTo: { type: String }, // Reference to a user (could later use ObjectId if needed)
  image: { type: String }, // New field to store image path
  resolution: {
    actionTaken: { type: String },
    verifiedBy: { type: String },
    resolutionDate: { type: Date }
  },
  month: { type: String, enum: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], required: true },
  styleName: { type: String }, // New field
  fabricArticle: { type: String }, // New field
  productionLine: { type: String }, // New field7
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // Reference to the order
  defectSection: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  defectProcess: { type: mongoose.Schema.Types.ObjectId, ref: "Process", required: true },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// Middleware to handle cascade update on delete
DefectSchema.pre("remove", async function (next) {
  try {
    console.log("Deleting defect with ID:", this._id);
    console.log("Associated Order ID:", this.orderId);
    // Ensure `orderId` exists before trying to update the Order model
    if (this.orderId) {
      await Order.findByIdAndUpdate(this.orderId, {
        $pull: { defects: this._id }, // Remove defect from Order's defects array
      });
    }
    if (!this.orderId) {
      console.warn("Defect has no associated Order ID. Skipping cascade delete.");
      return next();
    }    
    next();
  } catch (error) {
    console.error("Error in pre-remove middleware:", error);
    next(error); // Pass error to the next middleware
  }
});

module.exports = mongoose.model("Defect", DefectSchema);
