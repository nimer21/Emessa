// app.js
const express = require("express");
const cors = require("cors");
const reportRoutes = require("./routes/reportRoutes");
const orderRoutes = require("./routes/orderRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const washRoutes = require("./routes/washRoutes");
const connectDB = require("./config/connectToDb");
 dotenv = require("dotenv");

dotenv.config();
// Init App
const app = express();

app.use(cors());
app.use(express.json());
//app.use(cookieParser());

// Connect to database
connectDB();

// Routes
app.use("/api/defects", require("./routes/defectRoutes"));

app.use("/uploads", express.static("uploads"));

// Mount report routes
app.use("/api/reports", reportRoutes);

// Routes
app.use("/api/orders", orderRoutes);

// Routes
app.use("/api/sections", sectionRoutes);

// Routes
app.use("/api/wash", washRoutes);


// Basic route
app.get("/", (req, res) => {
  res.send("Defect Management API is running.");
});

module.exports = app;
