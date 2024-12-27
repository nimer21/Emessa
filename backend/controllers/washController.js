const WashRecipe = require("../models/WashRecipe");

exports.createWashRecipe = async (req, res) => {
    try {
      const washRecipeData = req.body;
  
      // Check if washCode is unique
      const existingRecipe = await WashRecipe.findOne({ washCode: washRecipeData.washCode });
      if (existingRecipe) {
        return res.status(400).json({ message: "Wash Code already exists." });
      }
  
      // Create and save the wash recipe
      const washRecipe = new WashRecipe(washRecipeData);
      await washRecipe.save();
      res.status(201).json(washRecipe);
    } catch (error) {
      console.error("Error creating wash recipe:", error);
      res.status(500).json({ message: "Error creating wash recipe.", error });
    }
  };
  exports.getWashRecipes = async (req, res) => {
    try {
      const washRecipes = await WashRecipe.find()
        .populate("customerId", "customerName")
        .populate("orderId", "orderNo")
        .populate("style", "styleName");
      res.status(200).json(washRecipes);
    } catch (error) {
      console.error("Error fetching wash recipes:", error);
      res.status(500).json({ message: "Error fetching wash recipes.", error });
    }
  };
    