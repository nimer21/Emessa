const mongoose = require("mongoose");

const DefectTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  processId: { type: mongoose.Schema.Types.ObjectId, ref: "Process", required: true },
  description: { type: String },
},{ timestamps: true });

module.exports = mongoose.model("DefectType", DefectTypeSchema);
