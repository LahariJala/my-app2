// src/FloodPopup.js
import React, { useEffect, useState } from 'react';

const FloodPopup = ({ mapCenter, onClose, style }) => {
  const [floodData, setFloodData] = useState(null);
  const [error, setError] = useState("");

  const fallback = [20.5937, 78.9629];
  const [lat, lon] = Array.isArray(mapCenter) && mapCenter.length === 2
    ? mapCenter
    : fallback;

  useEffect(() => {
    const fetchFloodData = async () => {
      try {
        // You can use a different API or service that provides flood data
        // For example, you can use the Global Flood Awareness System (GloFAS) API
        const res = await fetch(`https://api.example.com/flood-data?lat=${lat}&lon=${lon}`);
        const data = await res.json();
        setFloodData(data);
      } catch (err) {
        console.error("Flood data fetch error:", err);
        setError("Failed to fetch flood data.");
      }
    };

    fetchFloodData();
  }, [lat, lon]);

   return (
    <div style={{
      position: "absolute",
      top: "80px",
      left: "20px",
      backgroundColor: "#fff",
      padding: "12px",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h4>Flood Data</h4>
        <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }}>✖</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {floodData && (
        <div>
          {/* Display flood data here */}
          <p>Flood warning: {floodData.warning}</p>
        </div>
      )}
    </div>
  );
};
export default FloodPopup;