const mongoose = require("mongoose");

const WashRecipeSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  article: { type: String, required: true },
  qty: { type: Number, required: true },
  fabric: { type: String, required: true },
  pcs: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  washCode: { type: String, unique: true, required: true },
  style: { type: mongoose.Schema.Types.ObjectId, ref: "Style" },
  eimSource: { type: String },
  processParameters: {
    steps: { type: String, required: true },
    time: { type: Number, required: true },
    temp: { type: Number, required: true },
    litters: { type: Number, required: true },
    quantity: { type: Number, required: true },
    un: { type: String, required: true },
    chemicals: { type: [String], required: true }, // Array of chemical names or IDs
  },
});

module.exports = mongoose.model("WashRecipe", WashRecipeSchema);
