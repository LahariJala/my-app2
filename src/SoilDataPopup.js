// src/SoilDataPopup.js
import React from "react";

export default function SoilDataPopup({ lat, lon, data, onClose }) {
  return (
    <div style={{
      position: "absolute",
      top: 80,
      left: 20,
      width: 300,
      padding: 12,
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
      zIndex: 1000
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h4>Soil Data</h4>
        <button onClick={onClose} style={{
          border: "none",
          background: "none",
          fontSize: 18,
          cursor: "pointer"
        }}>✖</button>
      </div>
      <p><strong>Lat:</strong> {lat.toFixed(4)}, <strong>Lon:</strong> {lon.toFixed(4)}</p>
      <p><strong>pH:</strong> {data?.pH ?? "N/A"}</p>
      <p><strong>Organic Carbon (g/kg):</strong> {data?.ocd ?? "N/A"}</p>
      <p><strong>Clay %:</strong> {data?.clay ?? "N/A"}</p>
    </div>
  );
}
