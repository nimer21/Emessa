// routes/masterDataRoutes.js
const express = require("express");
const router = express.Router();
const { getStyles, getCustomers, getFabricSuppliers, getFabrics, getAllCompositionItems, getBrands, createStyle, deleteFabric, createOrUpdateFabricWithCompositions, updateStyle, deleteStyle, getDefectTypes, getDefectNames } = require("../controllers/masterDataController");

router.get("/styles", getStyles);
router.get("/customers", getCustomers);
router.get("/fabric-suppliers", getFabricSuppliers);
router.post("/fabrics", createOrUpdateFabricWithCompositions);
router.get("/fabrics", getFabrics);
router.put("/fabrics/:fabricId", createOrUpdateFabricWithCompositions);
router.delete("/fabrics/:id", deleteFabric);
router.get("/composition-items", getAllCompositionItems);
router.get("/brands", getBrands);
router.post("/styles", createStyle);
router.put("/styles/:id", updateStyle);
router.delete("/styles/:id", deleteStyle);

router.get("/defect-types", getDefectTypes);
router.get("/defect-names", getDefectNames);
module.exports = router;
