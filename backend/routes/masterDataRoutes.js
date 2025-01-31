// routes/masterDataRoutes.js
const express = require("express");
const router = express.Router();
const { getStyles, getCustomers, getFabricSuppliers, getFabrics, getAllCompositionItems, createFabricwithCompositions, getBrands, createStyle } = require("../controllers/masterDataController");

router.get("/styles", getStyles);
router.get("/customers", getCustomers);
router.get("/fabric-suppliers", getFabricSuppliers);
router.get("/fabrics", getFabrics);
router.get("/composition-items", getAllCompositionItems);
router.post("/fabrics", createFabricwithCompositions);
router.get("/brands", getBrands);
router.post("/styles", createStyle);

module.exports = router;
