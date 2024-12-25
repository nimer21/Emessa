import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { fetchDefectTrends } from "../services/reportService";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from "chart.js";
  // Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DefectReport = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const trends = await fetchDefectTrends();

      // Transform data for Chart.js
      const labels = [];
      const data = [];

      trends.forEach((trend) => {
        labels.push(`${trend._id.month} (${trend._id.severity})`);
        data.push(trend.total);
      });

      setChartData({
        labels,
        datasets: [
          {
            label: "Defects",
            data,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      });
    };

    loadData();
  }, []);

  if (!chartData) return <p>Loading chart...</p>;

  return (
    <div className="p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Defect Trends Report</h2>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Defects by Month and Severity" },
          },
        }}
      />
    </div>
  );
};

export default DefectReport;