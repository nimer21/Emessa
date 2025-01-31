import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchWashRecipes } from "../services/washService";
import { useStateContext } from "../contexts/ContextProvider";
import { MdContentPasteSearch } from "react-icons/md";
import { darkenColor } from "../utils/darkenColor";


const WashRecipeList = () => {
  const { currentColor, washTypeColors } = useStateContext();
  const hoverColor = darkenColor(currentColor, -15); // Slightly darken the color
  const [washRecipes, setWashRecipes] = useState([]);


  // Fetch all wash recipes
  useEffect(() => {
    const gethWashRecipes = async () => {
      try {
        const response = await fetchWashRecipes();
        setWashRecipes(response);
      } catch (error) {
        console.error("Error fetching wash recipes:", error);
        toast.error("Failed to fetch wash recipes.");
      }
    };

    gethWashRecipes();
  }, []);

  if (washRecipes.length === 0) {
    return <p className="text-center text-gray-500">No wash recipes found.</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center" style={{ color: hoverColor }}>
        Wash Recipes
      </h1>
      <Link to={`/wash-recipes`}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
          style={{ backgroundColor: hoverColor }} // Inline style for dynamic color
          onMouseOver={(e) => (e.target.style.backgroundColor = currentColor)}
          onMouseOut={(e) => (e.target.style.backgroundColor = hoverColor)}
        >
          Create New Wash Recipe
        </Link>
        </div>
        {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {washRecipes.map((recipe) => (
          <div
            key={recipe._id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            {/* Recipe Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-blue-700">
                {recipe.washCode || "N/A"}
              </h2>
              <span className="text-sm text-gray-500">
                {new Date(recipe.date).toLocaleDateString()}
              </span>
            </div>

            {/* Recipe Details */}
            <p className="text-sm text-gray-700">
              <strong>Order No:</strong> {recipe.orderId?.orderNo || "N/A"}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Style:</strong> {recipe.orderId?.style || "N/A"}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Fabric:</strong> {recipe.orderId?.fabricArt || "N/A"}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Wash Type:</strong>
              <span
              className={`px-2 py-1 rounded text-sm ${washTypeColors[recipe.washType] || "bg-gray-100 text-gray-700"}`}
              >              
               {recipe.washType || "N/A"}
               </span>
            </p>

            {/* Link to Details */}
            <Link
              to={`/wash-recipes/${recipe._id}`}
            //   className="block mt-4 px-4 py-2 text-center text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200"
              className="flex items-center justify-center mt-4 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200"
              // style={{ backgroundColor: currentColor }}
              // onMouseOver={(e) => (e.target.style.backgroundColor = hoverColor)}
              // onMouseOut={(e) => (e.target.style.backgroundColor = currentColor)}
            >
                <MdContentPasteSearch className="h-5 w-5 mr-2" />
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WashRecipeList;
