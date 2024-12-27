// routes/washRoutes.js
const express = require("express");
const router = express.Router();
const washController = require("../controllers/washController");

// Route to get aggregated defect data
router.get("/", washController.getWashRecipes);
router.post("/", washController.createWashRecipe);

module.exports = router;
