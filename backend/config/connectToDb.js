// config/db.js
const mongoose = require("mongoose");
const Section = require("../models/Section");
const Process = require("../models/Process");
const DefectType = require("../models/DefectType");
const DefectName = require("../models/DefectName");

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
    //await Section.deleteMany({});
    //await Process.deleteMany({});
    //await DefectType.deleteMany({});

    // Step 1: Create Sections
    // const sections = await Section.insertMany([
    //   { _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"), name: "Cutting", description: "Cutting Section" },
    //   { _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"), name: "Sewing", description: "Sewing Section" },
    // ]);

    //console.log("Sections seeded:", sections);

    // Step 2: Create Processes with Section References
    // const processes = await Process.insertMany([
    //   {
    //     name: "Fabric Cutting",
    //     sectionId: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
    //     description: "Cutting fabric into patterns",
    //   },
    //   {
    //     name: "Stitching",
    //     sectionId: new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"),
    //     description: "Stitching the fabric",
    //   },
    // ]);

    //console.log("Processes seeded:", processes);

    // Step 3: Create Defect Types with Process References
    // const defectTypes = await DefectType.insertMany([
    //   {
    //     name: "Fabric Defects",
    //     //processId: processes[0]._id,
    //     description: "Fabric Defects in Cutting",
    //   },
    //   {
    //     name: "Lycra",
    //     description: "Lycra Defects",
    //   },
    //   {
    //     name: "Printing Defects",
    //     description: "Printing Defects",
    //   },
    //   {
    //     name: "Sewing Defects",
    //     description: "Sewing Defects in Sewing",
    //   },
    //   {
    //     name: "Measurment Defects",
    //     description: "Different measurment in Sewing",
    //   },
    //   {
    //     name: "Cutting Defects",
    //     description: "Cutting Defects",
    //   },
    //   {
    //     name: "laundry Defects",
    //     description: "laundry Defects in Sewing",
    //   },
    //   {
    //     name: "Packing Defects",
    //     description: "Packing Defects",
    //   },
    //   {
    //     name: "Unknown holes",
    //     description: "Unknown holes in Sewing",
    //   },
    //   {
    //       name: "Embroidery Defects",
    //       description: "Embroidery Defects",
    //     },
    // ]);

    //console.log("Defect Types seeded:", defectTypes);

    // Step 4: CreateDefectsName
    // const defectNames = await DefectName.insertMany([
    //   { name: "Fabric Defects ( B7)", type: "6801fa8c7bc4fa70bef37262", description: "Fabric Defects in Cutting" },
    //   { name: "Pile", type: "6801fa8c7bc4fa70bef37262", description: "Pile Defects" },

    //   { name: "Lycra", type: "6801fa8c7bc4fa70bef37263", description: "Lycra Defects" },


    //   { name: "Sewing holes", type: "6801fa8c7bc4fa70bef37265", description: "Sewing Defects in Sewing" },
    //   { name: "Sewing problems", type: "6801fa8c7bc4fa70bef37265", description: "Sewing Defects in Sewing" },
    //   { name: "Different distance facing front pocket", type: "6801fa8c7bc4fa70bef37265", description: "Sewing Defects in Sewing" },
    //   { name: "Collecting problem (size*size)", type: "6801fa8c7bc4fa70bef37265", description: "Sewing Defects in Sewing" },
    //   { name: "Skewing (twist) leg", type: "6801fa8c7bc4fa70bef37265", description: "Sewing Defects in Sewing" },
    //   { name: "Cut in the lining", type: "6801fa8c7bc4fa70bef37265", description: "Sewing Defects in Sewing" },
    //   { name: "Wrong fabric grain", type: "6801fa8c7bc4fa70bef37265", description: "Sewing Defects in Sewing" },
    //   { name: "First choice without size", type: "6801fa8c7bc4fa70bef37265", description: "Sewing Defects in Sewing" },
    //   { name: "Different measurment", type: "6801fa8c7bc4fa70bef37265", description: "Sewing Defects in Sewing" },
    //   { name: "Different distance between leg", type: "6801fa8c7bc4fa70bef37265", description: "Sewing Defects in Sewing" },
    //   { name: "(Elactic band) WB", type: "6801fa8c7bc4fa70bef37265", description: "Sewing Defects in Sewing" },
    //   { name: "Holes Bad Handing for line", type: "6801fa8c7bc4fa70bef37265", description: "Sewing Defects in Sewing" },
      
      
    //   { name: "Embroidery", type: "680207c0e17fdb70e26854a3", description: "Embroidery Defects" },

    //   { name: "Different measurment", type: "6801fa8c7bc4fa70bef37266", description: "Measurment Defects" },
      
    //   { name: "Changes", type: "6801fa8c7bc4fa70bef37267", description: "Cutting Defects" },
      
    //   { name: "Washing problem ( Holes back pocket )", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "( High destroy WB )", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "( High destroy body )", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "( High destroy hemming front pocket )", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "( High destroy side seam )", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "High destroy hemming", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "Different color ( Out shade )", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "Wrinkles", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "Stains", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "Stains in the lining", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "Lycra / laundry", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "Laser", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "Damaged from laundry", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "Holes Bad Handing for laundry", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "Holes due to Taken", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "Scraping", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
    //   { name: "Zipper", type: "6801fa8c7bc4fa70bef37268", description: "laundry Defects" },
      
    //   { name: "Printing", type: "6801fa8c7bc4fa70bef37264", description: "Printing Defects" },
      
    //   { name: "Reinforcement", type: "6801fa8c7bc4fa70bef37269", description: "Packing Defects" },
    //   { name: "Cut in the lining", type: "6801fa8c7bc4fa70bef37269", description: "Packing Defects" },
    //   { name: "Holes Bad Handing for packing", type: "6801fa8c7bc4fa70bef37269", description: "Packing Defects" },
    //   { name: "Bad trimming", type: "6801fa8c7bc4fa70bef37269", description: "Packing Defects" },
      
    //   { name: "Unknown holes", type: "6801fa8c7bc4fa70bef3726a", description: "Unknown holes" },
    // ]);

    //console.log("Defect Names seeded:", defectNames);

    console.log("Database seeding completed!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
  }
};

//seedDatabase();

module.exports = connectDB;
