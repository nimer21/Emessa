// app.js
const express = require("express");
const cors = require("cors");
const reportRoutes = require("./routes/reportRoutes");
const orderRoutes = require("./routes/orderRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const connectDB = require("./config/connectToDb");
 dotenv = require("dotenv");

dotenv.config();
// Init App
const app = express();

// Connect to database
connectDB();

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL, // Allow requests from this origin
  credentials: false, // enable cookies
}));

// Middleware
app.use(express.json());

// Routes
app.use("/api/defects", require("./routes/defectRoutes"));

app.use("/uploads", express.static("uploads"));

// Mount report routes
app.use("/api/reports", reportRoutes);

// Routes
app.use("/api/orders", orderRoutes);

// Routes
app.use("/api/sections", sectionRoutes);


// Basic route
app.get("/", (req, res) => {
  res.send("Defect Management API is running.");
});

module.exports = app;
