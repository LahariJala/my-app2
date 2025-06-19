// src/ActivityLogger.js
import React, { useState, useEffect } from "react";
import { getTranslation } from "./i18n"; // ✅ Import translation utility

const ActivityLogger = ({ location, onSave, onClose, selectedLanguage = "en" }) => {
  const [activity, setActivity] = useState("");
  const [date, setDate] = useState("");
  const [locationName, setLocationName] = useState("Fetching...");

  const t = getTranslation(selectedLanguage); // ✅ Get localized strings

  // ✅ Reverse Geocoding to get location name only if not provided
  useEffect(() => {
    if (location?.name) {
      setLocationName(location.name);
      return;
    }

    const fetchLocationName = async () => {
      try {
        const API_KEY = process.env.REACT_APP_OPENCAGE_API_KEY;
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${location.lat}+${location.lng}&key=${API_KEY}`
        );
        const data = await response.json();
        const name = data?.results?.[0]?.formatted || t.unknownLocation;
        setLocationName(name);
      } catch (error) {
        console.error("Error fetching location name:", error);
        setLocationName(t.unknownLocation);
      }
    };

    if (location?.lat && location?.lng) {
      fetchLocationName();
    }
  }, [location, t.unknownLocation]);

  const handleSubmit = () => {
    if (!activity || !date) {
      alert(t.enterActivityAndDate);
      return;
    }

    onSave({
      activity,
      date,
      locationName,
      lat: location.lat,
      lon: location.lng
    });

    setActivity("");
    setDate("");
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        background: "#fff",
        padding: "12px",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        zIndex: 10000,
        width: "270px"
      }}
    >
      <h4>{t.logActivity}</h4>
      <p><strong>📍 {t.location}:</strong> {locationName}</p>
      <p style={{ fontSize: "12px", color: "#555" }}>
        🌍 {t.coordinates}: {location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}
      </p>

      <input
        type="text"
        placeholder={t.activityPlaceholder}
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
        style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
      />
      <button onClick={handleSubmit} style={{ marginRight: "6px" }}>
        ✅ {t.save}
      </button>
      <button onClick={onClose}>❌ {t.cancel}</button>
    </div>
  );
};


export default ActivityLogger;
