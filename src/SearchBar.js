// src/SearchBar.js
import React, { useState } from "react";

const SearchBar = ({ onSelectLocation }) => {
  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    if (query.length < 2) return;

    const API_KEY = process.env.REACT_APP_OPENCAGE_API_KEY;

    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${API_KEY}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      const formatted = data.results[0].formatted; // location name
      onSelectLocation({ lat, lng, name: formatted }); // ✅ FIXED
    } else {
      alert("Location not found.");
    }
  };

  const handleUseLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onSelectLocation({ lat: latitude, lng: longitude, name: "Current Location" });
      },
      () => alert("Location access denied.")
    );
  };

  return (
    <div style={{
      position: "absolute",
      top: 10,
      left: 50,
      zIndex: 1000,
      backgroundColor: "white",
      borderRadius: "8px",
      padding: "8px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      display: "flex",
      gap: "6px"
    }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search location"
        style={{ padding: "6px", width: "180px", borderRadius: "4px", border: "1px solid #ccc" }}
      />
      <button
        onClick={handleSearch}
        style={{ padding: "6px 10px", borderRadius: "4px", backgroundColor: "#007bff", color: "#fff", border: "none" }}
      >
        Search
      </button>
      <button
        onClick={handleUseLocation}
        style={{
          padding: "6px 10px",
          borderRadius: "4px",
          backgroundColor: "#28a745",
          color: "#fff",
          fontSize: "16px",
          border: "none",
          cursor: "pointer"
        }}
        title="Use My Location"
      >
        📍
      </button>
    </div>
  );
};

export default SearchBar;
