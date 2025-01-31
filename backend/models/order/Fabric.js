const mongoose = require("mongoose");

const FabricSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // Unique Fabric Code
  name: { type: String, required: true }, // Fabric Name
  color: String, // Color
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "CustomAccount" }, // Supplier (one-to-many)
}, { timestamps: true });

module.exports = mongoose.model("Fabric", FabricSchema);
