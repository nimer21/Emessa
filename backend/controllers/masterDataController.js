// controllers/masterDataController.js
const Style = require("../models/order/Style");
const CustomAccount = require("../models/order/CustomAccount");
const Fabric = require("../models/order/Fabric");
const CompositionItem = require("../models/order/CompositionItem");
const FabricComposition = require("../models/order/FabricComposition");
const Brand = require("../models/order/Brand");

exports.getStyles = async (req, res) => {
  try {
    const styles = await Style.find().select("_id name");
    res.status(200).json(styles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching styles", error });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await CustomAccount.find({ type: "Customer" }).select("_id name");
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers", error });
  }
};

exports.getFabricSuppliers = async (req, res) => {
  try {
    const suppliers = await CustomAccount.find({ type: "Supplier" }).select("_id name");
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fabric suppliers", error });
  }
};
exports.getFabrics = async (req, res) => {
  try {
    const fabrics = await Fabric.find().select("_id name supplier");
    res.status(200).json(fabrics);
  } catch (error) {
    res.status(500).json({ message: "Error fetching styles", error });
  }
};
// Fetch all composition items
exports.getAllCompositionItems = async (req, res) => {
  try {
      const compositionItems = await CompositionItem.find().select("_id name abbrPrefix");
      res.json(compositionItems);
  } catch (error) {
      res.status(500).json({ message: "Error fetching composition items" });
  }
};
// Create a new fabric with compositions
exports.createFabricwithCompositions = async (req, res) => {
  try {
      const { name, code, color, supplier, compositions } = req.body;
      //console.log(name, code, color, supplier, compositions);

      // Create fabric
      const newFabric = new Fabric({ name, code, color, supplier });
      await newFabric.save();

      // Create fabric compositions
      const fabricCompositions = compositions.map(comp => ({
          fabric: newFabric._id,
          compositionItem: comp.compositionCode,
          value: comp.value
      }));

      await FabricComposition.insertMany(fabricCompositions);
      res.status(201).json({ message: "Fabric created successfully", fabric: newFabric });
  } catch (error) {
      res.status(500).json({ message: "Error creating fabric" });
  }
};
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().select("_id name customer");
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: "Error fetching styles", error });
  }
};
exports.createStyle = async (req, res) => {
  try {
      const { customer, brand, styleName, styleNo } = req.body;
      //console.log(customer, brand, styleName, styleNo);

      // Create style
      const newStyle = new Style({ brand, name: styleName, styleNo });
      await newStyle.save();

      res.status(201).json({ message: "Style created successfully", style: newStyle });
  } catch (error) {
      res.status(500).json({ message: "Error creating style" });
  }
};

