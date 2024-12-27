const express = require("express");
const cors = require("cors");
const connectDB = require("../config/connectToDb");
const orderRoutes = require("../routes/orderRoutes");

// Initialize express
const app = express();
app.use(cors());
app.use(express.json());

// Connect to the database
connectDB();

// Use order routes
app.use("/api/orders", orderRoutes);

// Export the app as a serverless function
module.exports = app;
