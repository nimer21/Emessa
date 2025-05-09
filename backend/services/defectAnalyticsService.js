// src/services/defectAnalyticsService.js
const Defect = require('../models/Defect');
const Order = require('../models/Order');
const WashRecipe = require('../models/WashRecipe');
const Fabric = require('../models/order/Fabric');
const Style = require('../models/order/Style');
const FabricComposition = require('../models/order/FabricComposition');
const CompositionItem = require('../models/order/CompositionItem');

/**
 * Get comprehensive defect analytics data
 * @param {Object} filters - Optional filters (date range, etc.)
 * @returns {Promise<Object>} Analytics data
 */
exports.getDefectAnalytics = async (filters = {}) => {
  try {
    // Build query based on filters
    const query = {};
    
    // Apply date range filter if provided
    if (filters.startDate && filters.endDate) {
      query.detectedDate = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    // Apply other filters
    if (filters.severity) query.severity = filters.severity;
    if (filters.status) query.status = filters.status;
    
    // Get all defects with populated references
    const defects = await Defect.find(query)
      .populate({
        path: 'orderId',
        populate: [
          { path: 'fabric', populate: {path: 'fabricCompositions', populate: { path:'compositionItem'} }},
          { path: 'style' },
          { path: 'brand' }
        ]
      })
      .populate('defectName')
      .populate('defectType')
      .populate('defectPlace')
      .populate('defectProcess')
      .lean();
    
    // Get total count for percentage calculations
    //const totalDefects = defects.length; // counts the number of defect documents.
    //Each defect document has a defectCount field indicating how many defects it represents.
    // Using .reduce() sums all defectCount values, giving the true total defect count.

    // Sum defectCount from all defects
      const totalDefects = defects.reduce((sum, defect) => sum + (defect.defectCount || 1), 0);

    // Initialize result object
    const result = {
      summary: {
        totalProducedItems: 0,
        defectRatio: 0,
        totalDefects,
        defectsByStatus: {},
        defectsBySeverity: {}
      },
      byFabric: [],
      byStyle: [],
      byComposition: [],
      byDefectType: [],
      byDefectPlace: [],
      trendData: [],
      monthlyData: []
    };
    
    // Process status and severity distribution
    const statusCounts = {};
    const severityCounts = {};
    
    // Track unique fabrics, styles, and compositions for grouping
    const fabricMap = {};
    const styleMap = {};
    const compositionItemMap = {};
    const defectTypeMap = {};
    const defectPlaceMap = {};
    
    // Process monthly trend data
    const monthlyData = {};
    
    // TODO: Increment by defect.defectCount instead of just 1
    // Process each defect
    defects.forEach(defect => {
      // Status counts
      statusCounts[defect.status] = (statusCounts[defect.status] || 0) + 1;
      
      // Severity counts
      //severityCounts[defect.severity] = (severityCounts[defect.severity] || 0) + 1;

      const count = defect.defectCount || 1;
      severityCounts[defect.severity] = (severityCounts[defect.severity] || 0) + count;
      
      // Process fabric data
      if (defect.orderId && defect.orderId.fabric) {
        const fabricId = defect.orderId.fabric._id.toString();
        if (!fabricMap[fabricId]) {
          fabricMap[fabricId] = {
            id: fabricId,
            name: defect.orderId.fabric.name || 'Unknown Fabric',
            code: defect.orderId.fabric.code || 'N/A',
            count: 0,
            percentage: 0
          };
        }
        //fabricMap[fabricId].count += 1;
        fabricMap[fabricId].count += defect.defectCount || 1; // <-- Add the effect value
      }
      
      // Process style data
      if (defect.orderId && defect.orderId.style) {
        const styleId = defect.orderId.style._id.toString();
        if (!styleMap[styleId]) {
          styleMap[styleId] = {
            id: styleId,
            name: defect.orderId.style.name || 'Unknown Style',
            styleNo: defect.orderId.style.styleNo || 'N/A',
            count: 0,
            percentage: 0
          };
        }
        //styleMap[styleId].count += 1;
        styleMap[styleId].count += defect.defectCount || 1; // <-- Add the effect value
      }
      
      // Process defect type data
      if (defect.defectType) {
        const typeId = defect.defectType._id.toString();
        if (!defectTypeMap[typeId]) {
          defectTypeMap[typeId] = {
            id: typeId,
            name: defect.defectType.name || 'Unknown Type',
            count: 0,
            percentage: 0
          };
        }
        //defectTypeMap[typeId].count += 1;
        defectTypeMap[typeId].count += defect.defectCount || 1; // <-- Add the effect value
      }
      
      // Process defect place data
      if (defect.defectPlace) {
        const placeId = defect.defectPlace._id.toString();
        if (!defectPlaceMap[placeId]) {
          defectPlaceMap[placeId] = {
            id: placeId,
            name: defect.defectPlace.name || 'Unknown Location',
            count: 0,
            percentage: 0
          };
        }
        //defectPlaceMap[placeId].count += 1;
        defectPlaceMap[placeId].count += defect.defectCount || 1; // <-- Add the effect value
      }
      
      // Process composition data if available
      if (defect.orderId && defect.orderId.fabric && defect.orderId.fabric.fabricCompositions) {
        defect.orderId.fabric.fabricCompositions.forEach(comp => {
          if (comp.compositionItem) {
            const compId = comp.compositionItem._id.toString();
            if (!compositionItemMap[compId]) {
              compositionItemMap[compId] = {
                id: compId,
                name: comp.compositionItem.name || 'Unknown Composition',
                count: 0,
                percentage: 0
              };
            }
            //compositionItemMap[compId].count += 1;
            compositionItemMap[compId].count += defect.defectCount || 1; // <-- Add the effect value
          }
        });
      }
      
      // Process monthly trend data
      const defectDate = new Date(defect.detectedDate);
      const monthYear = `${defectDate.getFullYear()}-${String(defectDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          count: 0
        };
      }
      //monthlyData[monthYear].count += 1;
      monthlyData[monthYear].count += defect.defectCount || 1; // <-- Add the effect value
    });
    
    // Convert to percentages and sort
    result.summary.defectsByStatus = Object.keys(statusCounts).map(status => ({
      name: status,
      count: statusCounts[status],
      percentage: (statusCounts[status] / totalDefects * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
    
    result.summary.defectsBySeverity = Object.keys(severityCounts).map(severity => ({
      name: severity,
      count: severityCounts[severity],
      percentage: (severityCounts[severity] / totalDefects * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
    
    // Convert maps to arrays and calculate percentages
    result.byFabric = Object.values(fabricMap)
      .map(item => ({
        ...item,
        percentage: (item.count / totalDefects * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
    
    result.byStyle = Object.values(styleMap)
      .map(item => ({
        ...item,
        percentage: (item.count / totalDefects * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
    
    result.byComposition = Object.values(compositionItemMap)
      .map(item => ({
        ...item,
        percentage: (item.count / totalDefects * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
    
    result.byDefectType = Object.values(defectTypeMap)
      .map(item => ({
        ...item,
        percentage: (item.count / totalDefects * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
    
    result.byDefectPlace = Object.values(defectPlaceMap)
      .map(item => ({
        ...item,
        percentage: (item.count / totalDefects * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
    
    // Convert monthly data to sorted array
    result.trendData = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month));



      // Get all unique order IDs from defects
const uniqueOrderIds = new Set(defects.map(d => d.orderId?._id?.toString()).filter(Boolean));

// Fetch those orders and sum their orderQty
const orders = await Order.find({ _id: { $in: Array.from(uniqueOrderIds) } }, { orderQty: 1 });
const totalProducedItems = orders.reduce((sum, order) => sum + (order.orderQty || 0), 0);

// Calculate defect ratio
const defectRatio = totalProducedItems > 0
  ? ((totalDefects / totalProducedItems) * 100).toFixed(2)
  : "0.00";

// Add to summary
result.summary.defectRatio = defectRatio;
result.summary.totalProducedItems = totalProducedItems;
    
    return result;
  } catch (error) {
    console.error('Error fetching defect analytics:', error);
    throw new Error('Failed to fetch defect analytics');
  }
};

/**
 * Get top defective items by category
 * @param {string} category - Category to analyze (fabric, style, composition)
 * @param {number} limit - Number of items to return
 * @returns {Promise<Array>} Top defective items
 */
exports.getTopDefectiveItems = async (category, limit = 5) => {
  try {
    const analytics = await exports.getDefectAnalytics();
    
    switch (category) {
      case 'fabric':
        return analytics.byFabric.slice(0, limit);
      case 'style':
        return analytics.byStyle.slice(0, limit);
      case 'composition':
        return analytics.byComposition.slice(0, limit);
      default:
        throw new Error('Invalid category specified');
    }
  } catch (error) {
    console.error(`Error fetching top defective ${category}:`, error);
    throw new Error(`Failed to fetch top defective ${category}`);
  }
};

/**
 * Calculate defect rate for a specific time period
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Defect rate statistics
 */
// exports.getDefectRate = async (startDate, endDate) => {
//   try {

//     const result = await Defect.aggregate([
//       {
//         $match: {
//           detectedDate: { $gte: startDate, $lte: endDate }
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalDefectCount: { $sum: "$defectCount" }
//         }
//       }
//     ]);

//     const defectCount = result[0]?.totalDefectCount || 0;
//     // const defectCount = await Defect.countDocuments({
//     //   detectedDate: { $gte: startDate, $lte: endDate }
//     // });
    
//     const ordersInPeriod = await Order.find({
//       createdAt: { $gte: startDate, $lte: endDate }
//     });
    
//     const totalOrderQty = ordersInPeriod.reduce((sum, order) => sum + (order.orderQty || 0), 0);
    
//     return {
//       totalDefects: defectCount,
//       totalOrderQuantity: totalOrderQty,
//       defectRate: totalOrderQty > 0 ? (defectCount / totalOrderQty * 100).toFixed(2) : 0,
//       period: {
//         start: startDate,
//         end: endDate
//       }
//     };
//   } catch (error) {
//     console.error('Error calculating defect rate:', error);
//     throw new Error('Failed to calculate defect rate');
//   }
// };





/**
 * Get wash recipe defect analytics
 * @param {Object} filters - Filter criteria
 * @returns {Object} - Wash recipe defect analytics
 */
exports.getWashRecipeDefectAnalytics = async (filters = {}) => {
  try {
    // Build filter query based on provided filters
    const defectQuery = {};
    
    if (filters.startDate && filters.endDate) {
      defectQuery.detectedDate = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    if (filters.severity) {
      defectQuery.severity = filters.severity;
    }
    
    if (filters.status) {
      defectQuery.status = filters.status;
    }

    // Get all wash recipes with their orders
    const washRecipes = await WashRecipe.find({})
      .populate('orderId')
      .populate({
        path: 'recipeProcessId',
        populate: {
          path: 'laundryProcessId'
        }
      });

    // Get all defects with their orders
    const defects = await Defect.find(defectQuery)
      .populate('orderId')
      .populate('defectName')
      .populate('defectType');

    // Group defects by orderId
    const defectsByOrder = {};
    defects.forEach(defect => {
      if (defect.orderId) {
        const orderId = defect.orderId._id.toString();
        if (!defectsByOrder[orderId]) {
          defectsByOrder[orderId] = [];
        }
        defectsByOrder[orderId].push(defect);
      }
    });

    // Calculate defect metrics for each wash recipe
    const washRecipeAnalytics = [];
    const processTypeDefects = {
      'DRY PROCESS': { count: 0, recipes: 0 },
      'SPRAY PROCESS': { count: 0, recipes: 0 }
    };
    
    for (const recipe of washRecipes) {
      if (!recipe.orderId) continue;
      
      const orderId = recipe.orderId._id.toString();
      const orderDefects = defectsByOrder[orderId] || [];
      
      // Get all process types in this recipe
      const processTypes = new Set();
      recipe.recipeProcessId.forEach(process => {
        if (process.laundryProcessId) {
          processTypes.add(process.recipeProcessType);
        }
      });
      
      // Calculate defect counts
      const totalDefects = orderDefects.length;
      const defectRatio = recipe.orderId.orderQty 
        ? (totalDefects / recipe.orderId.orderQty * 100).toFixed(2) 
        : 0;
        
      // Add defect counts to process type totals
      processTypes.forEach(type => {
        if (processTypeDefects[type]) {
          processTypeDefects[type].count += totalDefects;
          processTypeDefects[type].recipes++;
        }
      });
      
      // Get defect severity distribution
      const severityDistribution = {
        Low: 0,
        Medium: 0,
        High: 0
      };
      
      orderDefects.forEach(defect => {
        if (defect.severity) {
          severityDistribution[defect.severity]++;
        }
      });
      
      // Get top defect types
      const defectTypeCounts = {};
      orderDefects.forEach(defect => {
        if (defect.defectType && defect.defectType.name) {
          const typeName = defect.defectType.name;
          defectTypeCounts[typeName] = (defectTypeCounts[typeName] || 0) + 1;
        }
      });
      
      const topDefectTypes = Object.entries(defectTypeCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      
      washRecipeAnalytics.push({
        recipeId: recipe._id,
        washCode: recipe.washCode,
        washType: recipe.washType,
        orderNo: recipe.orderId.orderNo,
        orderQty: recipe.orderId.orderQty,
        processTypes: Array.from(processTypes),
        defectCount: totalDefects,
        defectRatio: defectRatio,
        severityDistribution,
        topDefectTypes
      });
    }
    
    // Sort wash recipes by defect ratio (highest first)
    washRecipeAnalytics.sort((a, b) => parseFloat(b.defectRatio) - parseFloat(a.defectRatio));
    
    // Calculate process type defect rates
    const processTypeAnalytics = Object.entries(processTypeDefects).map(([type, data]) => ({
      type,
      totalDefects: data.count,
      recipeCount: data.recipes,
      averageDefectsPerRecipe: data.recipes ? (data.count / data.recipes).toFixed(2) : 0
    }));
    
    // Calculate wash type defect distribution
    const washTypeDefects = {};
    washRecipeAnalytics.forEach(recipe => {
      if (!washTypeDefects[recipe.washType]) {
        washTypeDefects[recipe.washType] = {
          count: 0,
          recipes: 0,
          defectRatio: 0
        };
      }
      
      washTypeDefects[recipe.washType].count += recipe.defectCount;
      washTypeDefects[recipe.washType].recipes++;
      washTypeDefects[recipe.washType].defectRatio += parseFloat(recipe.defectRatio);
    });
    
    // Calculate averages for wash types
    const washTypeAnalytics = Object.entries(washTypeDefects).map(([type, data]) => ({
      type,
      totalDefects: data.count,
      recipeCount: data.recipes,
      averageDefectRatio: data.recipes ? (data.defectRatio / data.recipes).toFixed(2) : 0
    }));
    
    // Find recipes with highest defect ratios
    const topDefectiveRecipes = washRecipeAnalytics.slice(0, 10);
    
    // Find recipes with lowest defect ratios (excluding zero defects)
    const lowestDefectiveRecipes = [...washRecipeAnalytics]
      .filter(recipe => recipe.defectCount > 0)
      .sort((a, b) => parseFloat(a.defectRatio) - parseFloat(b.defectRatio))
      .slice(0, 10);
    
    return {
      summary: {
        totalRecipes: washRecipes.length,
        totalRecipesWithDefects: washRecipeAnalytics.filter(r => r.defectCount > 0).length,
        averageDefectRatio: washRecipeAnalytics.length 
          ? (washRecipeAnalytics.reduce((sum, r) => sum + parseFloat(r.defectRatio), 0) / washRecipeAnalytics.length).toFixed(2)
          : 0
      },
      allRecipes: washRecipeAnalytics,
      topDefectiveRecipes,
      lowestDefectiveRecipes,
      processTypeAnalytics,
      washTypeAnalytics
    };
  } catch (error) {
    console.error('Error in getWashRecipeDefectAnalytics service:', error);
    throw new Error('Failed to generate wash recipe defect analytics');
  }
};








/**
 * Get comprehensive wash recipe defect analytics data
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} Wash recipe analytics data
 */
exports.getWashRecipeDefectAnalytics2 = async (filters = {}) => {
  try {
    // Build query based on filters
    const query = {};
    
    // Apply date range filter if provided
    if (filters.startDate && filters.endDate) {
      query.detectedDate = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    // Apply other filters
    if (filters.severity) query.severity = filters.severity;
    if (filters.status) query.status = filters.status;
    
    // Get all defects with populated references, focusing on wash recipe
    const defects = await Defect.find(query)
      .populate({
        path: 'orderId',
        populate: [
          { path: 'washRecipe', populate: {path: 'washSteps', populate: { path:'chemicals'} }},
          { path: 'fabric' },
          { path: 'style' }
        ]
      })
      .populate('defectName')
      .populate('defectType')
      .populate('defectProcess')
      .lean();
    
    // Calculate total defects
    const totalDefects = defects.reduce((sum, defect) => sum + (defect.defectCount || 1), 0);
    
    // Initialize result object
    const result = {
      summary: {
        totalDefects,
        totalWashRecipeDefects: 0,
        washRecipeDefectRatio: 0
      },
      byWashType: [],
      byChemical: [],
      byProcess: [],
      byTemperature: [],
      byWaterRatio: [],
      byDuration: []
    };
    
    // Track unique wash types, chemicals, processes, etc.
    const washTypeMap = {};
    const chemicalMap = {};
    const processMap = {};
    const temperatureMap = {};
    const waterRatioMap = {};
    const durationMap = {};
    
    // Count wash recipe defects
    let washRecipeDefectCount = 0;
    
    // Process each defect
    defects.forEach(defect => {
      // Skip if no wash recipe data
      if (!defect.orderId || !defect.orderId.washRecipe) return;
      
      const defectCount = defect.defectCount || 1;
      washRecipeDefectCount += defectCount;
      
      const washRecipe = defect.orderId.washRecipe;
      
      // Process wash type
      if (washRecipe.washType) {
        const washType = washRecipe.washType;
        if (!washTypeMap[washType]) {
          washTypeMap[washType] = {
            name: washType,
            count: 0,
            percentage: 0
          };
        }
        washTypeMap[washType].count += defectCount;
      }
      
      // Process temperature ranges
      if (washRecipe.temperature) {
        // Create temperature ranges (e.g., "30-40°C")
        const temp = parseInt(washRecipe.temperature);
        const tempRange = `${Math.floor(temp/10) * 10}-${Math.floor(temp/10) * 10 + 10}°C`;
        
        if (!temperatureMap[tempRange]) {
          temperatureMap[tempRange] = {
            name: tempRange,
            count: 0,
            percentage: 0
          };
        }
        temperatureMap[tempRange].count += defectCount;
      }
      
      // Process water ratio (liters)
      if (washRecipe.waterRatio) {
        // Create water ratio ranges
        const ratio = parseInt(washRecipe.waterRatio);
        const ratioRange = `${Math.floor(ratio/5) * 5}-${Math.floor(ratio/5) * 5 + 5}L`;
        
        if (!waterRatioMap[ratioRange]) {
          waterRatioMap[ratioRange] = {
            name: ratioRange,
            count: 0,
            percentage: 0
          };
        }
        waterRatioMap[ratioRange].count += defectCount;
      }
      
      // Process duration (time)
      if (washRecipe.duration) {
        // Create duration ranges in minutes
        const duration = parseInt(washRecipe.duration);
        const durationRange = `${Math.floor(duration/15) * 15}-${Math.floor(duration/15) * 15 + 15}min`;
        
        if (!durationMap[durationRange]) {
          durationMap[durationRange] = {
            name: durationRange,
            count: 0,
            percentage: 0
          };
        }
        durationMap[durationRange].count += defectCount;
      }
      
      // Process wash steps and chemicals
      if (washRecipe.washSteps && washRecipe.washSteps.length > 0) {
        washRecipe.washSteps.forEach(step => {
          // Process step process (SPRAY, DRY, etc.)
          if (step.process) {
            const process = step.process;
            if (!processMap[process]) {
              processMap[process] = {
                name: process,
                count: 0,
                percentage: 0
              };
            }
            processMap[process].count += defectCount;
          }
          
          // Process chemicals
          if (step.chemicals && step.chemicals.length > 0) {
            step.chemicals.forEach(chemical => {
              if (chemical.name) {
                const chemicalName = chemical.name;
                if (!chemicalMap[chemicalName]) {
                  chemicalMap[chemicalName] = {
                    name: chemicalName,
                    count: 0,
                    percentage: 0
                  };
                }
                chemicalMap[chemicalName].count += defectCount;
              }
            });
          }
        });
      }
    });
    
    // Calculate percentages and sort results
    const calculatePercentageAndSort = (map, totalCount) => {
      return Object.values(map)
        .map(item => ({
          ...item,
          percentage: (item.count / totalCount * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count);
    };
    
    // Update result with all processed data
    result.summary.totalWashRecipeDefects = washRecipeDefectCount;
    result.summary.washRecipeDefectRatio = totalDefects > 0 ? 
      ((washRecipeDefectCount / totalDefects) * 100).toFixed(1) : "0.0";
    
    result.byWashType = calculatePercentageAndSort(washTypeMap, washRecipeDefectCount);
    result.byChemical = calculatePercentageAndSort(chemicalMap, washRecipeDefectCount);
    result.byProcess = calculatePercentageAndSort(processMap, washRecipeDefectCount);
    result.byTemperature = calculatePercentageAndSort(temperatureMap, washRecipeDefectCount);
    result.byWaterRatio = calculatePercentageAndSort(waterRatioMap, washRecipeDefectCount);
    result.byDuration = calculatePercentageAndSort(durationMap, washRecipeDefectCount);
    
    return result;
  } catch (error) {
    console.error('Error fetching wash recipe defect analytics:', error);
    throw new Error('Failed to fetch wash recipe defect analytics');
  }
};