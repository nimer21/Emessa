import mongoose from "mongoose";
import dotenv from "dotenv";
import Fabric from "./models/order/Fabric.js";
import Style from "./models/order/Style.js";
import CustomAccount from "./models/order/CustomAccount.js";
import CompositionItem from "./models/order/CompositionItem.js";
import Brand from "./models/order/Brand.js";

dotenv.config(); // Load environment variables

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB for seeding"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

async function seedDatabase() {
  try {
    // 🔥 **Clear existing data** (optional for fresh seeding)
    //await Fabric.deleteMany();
    //await Style.deleteMany();
    //await CustomAccount.deleteMany();
    //await CompositionItem.deleteMany(); // Clear existing CompositionItems
    await Brand.deleteMany(); // Clear existing brands if any
    console.log("🧹 Old records cleared");
/*
    // 1️⃣ **Seed Customers**
    const customers = await CustomAccount.insertMany([
      { type: "Customer", code: "CUST001", name: "BRAX", address: "Germany", contactEmail: "brax@example.com" },
      { type: "Customer", code: "CUST002", name: "CAMEL ACTIVE", address: "France", contactEmail: "camel@example.com" },
      { type: "Customer", code: "CUST003", name: "GERRY WEBER", address: "Italy", contactEmail: "gerry@example.com" },
      { type: "Customer", code: "CUST004", name: "JEAN CARRIERE", address: "Spain", contactEmail: "jean@example.com" },
      { type: "Customer", code: "CUST005", name: "MARC O’POLO", address: "UK", contactEmail: "marc@example.com" },
    ]);

    // 2️⃣ **Seed Fabric Suppliers & Retrieve Inserted IDs**
    const supplierData = [
      { type: "Supplier", code: "S001", name: "Sharabati", address: "Turkey", contactEmail: "sharabati@example.com" },
      { type: "Supplier", code: "S002", name: "DNM", address: "Italy", contactEmail: "dnm@example.com" },
      { type: "Supplier", code: "S003", name: "CALIK", address: "Spain", contactEmail: "calik@example.com" },
    ];
    const suppliers = await CustomAccount.insertMany(supplierData);
    const supplierMap = suppliers.reduce((acc, supplier) => {
      acc[supplier.code] = supplier._id; // Map supplier code to ObjectId
      return acc;
    }, {});

    // 3️⃣ **Seed Styles**
    await Style.insertMany([
      { name: "Cadiz" },
      { name: "Caren New" },
      { name: "Carola" },
      { name: "Chuck" },
      { name: "Lavina Joy" },
      { name: "Lora" },
      { name: "Luke" },
    ]);

    // 4️⃣ **Seed Fabrics (Ensuring Supplier References Are Set)**
    await Fabric.insertMany([
      { code: "F001", name: "Denim Blue", color: "Blue", supplier: supplierMap["S001"] },
      { code: "F002", name: "Cotton White", color: "White", supplier: supplierMap["S002"] },
      { code: "F003", name: "Linen Gray", color: "Gray", supplier: supplierMap["S003"] },
    ]);
    // 5️⃣ **Seed Composition Items**
    const compositionItems = await CompositionItem.insertMany([
      { name: 'Cotton', abbrPrefix: 'C' },
      { name: 'Polyester', abbrPrefix: 'P' },
      { name: 'Wool', abbrPrefix: 'W' },
      { name: 'Silk', abbrPrefix: 'S' },
      { name: 'Nylon', abbrPrefix: 'N' }
    ]);*/
    // 1️⃣ **Seed Brands**
    const brands = await Brand.insertMany([
      { name: "HAKA", customer: "679c1b99ca355f3aacfc3dc8" }, // Link to BRAX
      { name: "RAPHAELA", customer: "679c1b99ca355f3aacfc3dc8" }, 
      { name: "Eurex", customer: "679c1b99ca355f3aacfc3dc8" }, 
      { name: "DOB", customer: "679c1b99ca355f3aacfc3dc8" }
    ]);

    console.log("✅ Database successfully seeded!");
    mongoose.connection.close(); // Close connection after seeding
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    mongoose.connection.close();
  }
}

// Run the seeding function
seedDatabase();
