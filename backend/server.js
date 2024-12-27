// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/connectToDb");
const defectRoutes = require("./routes/defectRoutes");
const reportRoutes = require("./routes/reportRoutes");
const orderRoutes = require("./routes/orderRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const washRoutes = require("./routes/washRoutes");

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// app.use(cookieParser()); // Uncomment if cookies are required

// Connect to the database
connectDB();

// API Routes
app.use("/api/defects", defectRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/wash", washRoutes);

// Serve static files (e.g., uploads)
app.use("/uploads", express.static("uploads"));

// Basic health check route
app.get("/", (req, res) => {
  res.send("Defect Management API is running.");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
