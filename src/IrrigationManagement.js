// src/IrrigationManagement.js
import React, { useState, useEffect } from 'react';

const IrrigationManagement = ({ mapCenter, onClose, style }) => {
  const [irrigationData, setIrrigationData] = useState(null);
  const [error, setError] = useState("");

  const fallback = [20.5937, 78.9629];
  const [lat, lon] = Array.isArray(mapCenter) && mapCenter.length === 2
    ? mapCenter
    : fallback;

  useEffect(() => {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      setError("Invalid coordinates.");
      return;
    }

    const fetchIrrigationData = async () => {
      try {
        // Fetch historical soil moisture data
        const historicalRes = await fetch(`https://archive-api.open-meteo.com/v1/era5?latitude=${lat}&longitude=${lon}&daily=soil_moisture_0_to_7cm_mean&past_days=7&timezone=auto`);
        const historicalData = await historicalRes.json();

        if (!historicalRes.ok) {
          console.error("API error:", historicalData);
          setError("Failed to fetch irrigation data.");
          return;
        }

        if (!historicalData?.daily?.soil_moisture_0_to_7cm_mean) {
          console.warn("Soil moisture data missing:", historicalData);
          setError("No soil moisture data.");
          setIrrigationData(null);
          return;
        }

        // Calculate irrigation recommendations based on soil moisture levels
        const soilMoistureLevels = historicalData.daily.soil_moisture_0_to_7cm_mean;
        const irrigationRecommendations = soilMoistureLevels.map((level, index) => {
          if (level < 20) {
            return "Irrigation recommended";
          } else if (level < 40) {
            return "Monitor soil moisture";
          } else {
            return "No irrigation needed";
          }
        });

        setIrrigationData({
          labels: historicalData.daily.time,
          datasets: [{
            label: 'Irrigation Recommendations',
            data: irrigationRecommendations,
            borderColor: 'blue',
            backgroundColor: 'rgba(0,0,255,0.1)',
            tension: 0.4
          }]
        });

        setError("");
      } catch (err) {
        console.error("Irrigation data fetch error:", err);
        setError("Failed to fetch irrigation data.");
        setIrrigationData(null);
      }
    };

    fetchIrrigationData();
  }, [lat, lon]);

  return (
    <div style={{ position: 'absolute', top: '80px', left: '20px', width: '340px', background: '#fff', padding: '12px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h4>Irrigation Management</h4>
        <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }}>✖</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && !irrigationData && <p>Loading...</p>}
      {irrigationData && (
        <div>
          <p>Irrigation Recommendations:</p>
          <ul>
            {irrigationData.datasets[0].data.map((recommendation, index) => (
              <li key={index}>{irrigationData.labels[index]}: {recommendation}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default IrrigationManagement;