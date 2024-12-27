// config/db.js
const mongoose = require("mongoose");
const Section = require("../models/Section");
const Process = require("../models/Process");
const DefectType = require("../models/DefectType");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { //MONGO_CLOUD_URI | MONGO_URI
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected ^_^");
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Section.deleteMany({});
    await Process.deleteMany({});
    await DefectType.deleteMany({});

    // Step 1: Create Sections
    const sections = await Section.insertMany([
      { _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"), name: "Cutting", description: "Cutting Section" },
      { _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"), name: "Sewing", description: "Sewing Section" },
    ]);

    console.log("Sections seeded:", sections);

    // Step 2: Create Processes with Section References
    const processes = await Process.insertMany([
      {
        name: "Fabric Cutting",
        sectionId: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
        description: "Cutting fabric into patterns",
      },
      {
        name: "Stitching",
        sectionId: new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"),
        description: "Stitching the fabric",
      },
    ]);

    console.log("Processes seeded:", processes);

    // Step 3: Create Defect Types with Process References
    const defectTypes = await DefectType.insertMany([
      {
        name: "Misaligned Cutting",
        processId: processes[0]._id,
        description: "The cutting is not aligned properly",
      },
      {
        name: "Loose Stitch",
        processId: processes[1]._id,
        description: "The stitching is loose",
      },
    ]);

    console.log("Defect Types seeded:", defectTypes);

    console.log("Database seeding completed!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
  }
};

//seedDatabase();

module.exports = connectDB;
