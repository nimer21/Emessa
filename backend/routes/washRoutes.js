// routes/washRoutes.js
const express = require("express");
const router = express.Router();
const washController = require("../controllers/washController");

// Route to get aggregated defect data
router.get("/", washController.getAllWashRecipes);
router.get("/", washController.getWashRecipeDetails);
router.post("/", washController.createWashRecipe);
router.get("/:id", washController.getWashRecipeDetailsById);

module.exports = router;
