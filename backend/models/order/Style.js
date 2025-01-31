const mongoose = require("mongoose");

const StyleSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Style Name
  styleNo: { type: String, required: true }, // Style Number
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" }, // Linked to Brand
}, { timestamps: true });

module.exports = mongoose.model("Style", StyleSchema);
