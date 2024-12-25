// src/pages/DefectDetail.js
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../services/api";
import DefectStatus from "../components/DefectStatus";
import DefectResolution from "../components/DefectResolution";
import { format } from "date-fns";
import { getDefectById } from "../services/defectService";

const DefectDetail = () => {
  const { id: defectId } = useParams(); // Get defectId from URL parameters
  const [defect, setDefect] = useState(null);

  const [zoomImageCoordinate, setZoomImageCoordinate] = useState({
    x: 0,
    y: 0,
  });
  const [zoomImage, setZoomImage] = useState(false);

  const handleZoomImage = useCallback(
    (e) => {
      setZoomImage(true);
      const { left, top, width, height } = e.target.getBoundingClientRect();
      //console.log("Image coordinate ",left, top, width, height);
      //const zoomImage = document.querySelector(".zoom-image");
      //zoomImage.classList.toggle("hidden");
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;

      setZoomImageCoordinate({
        x,
        y,
      });
      //setZoomImage(false);
    },
    [zoomImageCoordinate]
  );

  const handleLeaveImageZoom = () => {
    setZoomImage(false);
  };

  useEffect(() => {
    if (!defectId) return; // Prevent fetch if defectId is undefined
    const fetchDefect = async () => {
      try {
        //const response = await axios.get(`/api/defects/${defectId}`);
        const fetchDefectById = await getDefectById(defectId);
        setDefect(fetchDefectById);
      } catch (error) {
        alert("Error fetching defect details");
        console.error("Error fetching defect details:", error);
      }
    };

    //if (defectId) fetchDefect();
    fetchDefect();
  }, [defectId]);

  if (!defect) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex">
      <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Defect Details</h2>

        <div className="flex justify-between gap-6 items-start">
          {/* Defect Details Section */}
          <div className="space-y-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-600">General Information</h3>
            <p className="text-gray-700">
              <strong className="text-gray-800">Order ID:</strong> {defect.orderId?.orderNo || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Type:</strong> {defect.defectType}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Description:</strong> {defect.description}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Severity:</strong>{" "}
              <span
                className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
                  defect.severity === "High"
                    ? "bg-red-200 text-red-800"
                    : defect.severity === "Medium"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-green-200 text-green-800"
                }`}
              >
                {defect.severity}
              </span>
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Status:</strong> {defect.status}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Detected Date:</strong>{" "}
              {format(new Date(defect.detectedDate), "MMMM d, yyyy")}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Resolved Date:</strong>{" "}
              {defect?.resolvedDate ? format(new Date(defect?.resolvedDate), "MMMM d, yyyy") : undefined || "Not resolved"}
            </p>

            <h3 className="text-lg font-semibold text-gray-600 mt-6">Additional Information</h3>
            <p className="text-gray-700">
              <strong className="text-gray-800">Month:</strong> {defect.month}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Style Name:</strong> {defect.styleName}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Fabric Article:</strong> {defect.fabricArticle}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Line of Production:</strong> {defect.productionLine}
            </p>
          </div>

          {/* Image Section */}
          {defect.image && (
            <div className="h-[300px] w-[300px] lg:h-96 lg:w-96 bg-slate-200 relative p-2 rounded-sm">
              <img
                src={`http://localhost:5000/${defect.image}`}
                alt="Defect"
                className="h-full w-full object-contain rounded-lg"
                onMouseMove={handleZoomImage}
                onMouseLeave={handleLeaveImageZoom}
              />

              {zoomImage && (
                <div className="hidden lg:block absolute min-w-[500px] overflow-hidden min-h-[400px] bg-gray-200 p-1 -right-[510px] top-0">
                  <div
                    className="w-full h-full min-h-[500px] min-w-[400px] mix-blend-multiply scale-125"
                    style={{
                      backgroundImage: `url(http://localhost:5000/${defect.image})`,
                      backgroundPosition: `${zoomImageCoordinate.x * 100}% ${zoomImageCoordinate.y * 100}%`,
                      backgroundRepeat: "no-repeat",
                      cursor: "pointer",
                    }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Update and Resolution Components */}
        <div className="mt-10 space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Update Status</h3>
            <DefectStatus defectId={defectId} currentStatus={defect.status} assignedTo={defect.assignedTo} />
          </div>

          {defect.status !== "Resolved" && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Add Resolution</h3>
              <DefectResolution defectId={defectId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DefectDetail;
