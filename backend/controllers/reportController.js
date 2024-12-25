const Defect = require("../models/Defect");

exports.getDefectTrends = async (req, res) => {
  try {
    const trends = await Defect.aggregate([
      {
        $group: {
          _id: { month: "$month", severity: "$severity" }, // Group by month and severity
          total: { $sum: 1 }, // Count the number of defects
        },
      },
      {
        $sort: { "_id.month": 1 }, // Sort by month
      },
    ]);
    //console.log("Trends Data:", trends); // Debugging: Log data

    res.status(200).json(trends);
  } catch (error) {
    console.error("Error fetching defect trends:", error);
    res.status(500).json({ message: "Error fetching defect trends" });
  }
};
