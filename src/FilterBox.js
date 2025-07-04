import React, { useState } from "react";
import { getTranslation } from "./i18n";

const FilterBox = ({
  selectedLayers,
  setSelectedLayers,
  selectedLanguage,
  setSelectedLanguage,
  onSoilMoistureToggle,
  onWeatherToggle,
  onFloodToggle,
  onNDVIToggle,
  onSoilDataToggle,
  onToggleCalendar,
  onAddActivity,
}) => {
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const t = getTranslation(selectedLanguage);

  const handleButtonClick = (layer) => {
   const newState = { soilMoisture:false, soilData:false, weather:false, flood:false, ndvi:false };
    newState[layer] = true;
    setSelectedLayers(newState);

    if (layer === "soilMoisture") {
      onSoilMoistureToggle();
    } else if (layer === "weather") {
      onWeatherToggle();
    } else if (layer === "flood") {
      onFloodToggle?.();
      alert("⚠️ Flood-prone areas displayed. Check dark blue zones for potential flood risk.");
    }else if (layer === "soilData") {
     onSoilDataToggle?.(); 
   } else if (layer === "ndvi") {
      onNDVIToggle?.();
    }
    
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: chatInput,
          language: selectedLanguage
        })
      });

      const data = await response.json();
      setChatResponse(data.reply);
    } catch (error) {
      console.error("❌ Chatbot Error:", error);
      setChatResponse("❌ Error: Unable to connect to farming assistant backend.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "absolute",
      top: 10,
      right: 10,
      background: "#fff",
      borderRadius: "10px",
      padding: "12px",
      boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      zIndex: 5000,
      fontFamily: "Arial",
      width: "200px"
    }}>
      {/* 🔘 Filter Buttons */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ fontWeight: "bold" }}>{t.filterTitle}</label>
        <button onClick={() => handleButtonClick("soilMoisture")} style={{ width: "100%", marginBottom: "6px", padding: "6px" }}>{t.soilMoisture}</button>
        <button onClick={() => handleButtonClick("weather")} style={{ width: "100%", marginBottom: "6px", padding: "6px" }}>{t.weather}</button>
        <button onClick={() => handleButtonClick("flood")} style={{ width: "100%", marginBottom: "6px", padding: "6px" }}>{t.flood}</button>
        <button onClick={() => handleButtonClick("ndvi")} style={{ width: "100%", marginBottom: "6px", padding: "6px" }}>🛰️ NDVI</button>
        <button
   onClick={() => handleButtonClick("soilData")} 
   style={{ width: "100%", marginBottom: 6, padding: 6 }} 
 > 
   {t.soilData ?? "Soil Data"} 
 </button>
      </div>

      {/* 🌐 Language Selector */}
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="language-select" style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>{t.regionLabel}</label>
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={handleLanguageChange}
          style={{ width: "100%", padding: "6px" }}
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="bn">বাংলা</option>
          <option value="te">తెలుగు</option>
          <option value="ta">தமிழ்</option>
          <option value="mr">मराठी</option>
          <option value="gu">ગુજરાતી</option>
          <option value="kn">ಕನ್ನಡ</option>
        </select>
      </div>

      {/* 🗓 Activity Buttons */}
      <div style={{ marginBottom: "10px" }}>
        <button onClick={onAddActivity} style={{
          width: "100%",
          padding: "6px",
          background: "#673ab7",
          color: "white",
          border: "none",
          marginBottom: "6px",
          cursor: "pointer"
        }}>
          {t.addActivity}
        </button>
        <button onClick={onToggleCalendar} style={{
          width: "100%",
          padding: "6px",
          background: "#2196f3",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}>
          {t.viewActivity}
        </button>
      </div>

      {/* 🛒 Farm Market Link */}
      <a
        href="/farm-market"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          width: "100%",
          padding: "6px",
          background: "#ff9800",
          color: "white",
          textAlign: "center",
          textDecoration: "none",
          borderRadius: "4px",
          marginTop: "6px"
        }}
      >
        🛒 Farm-to-Market
      </a>

      {/* 🤖 Chatbot */}
      <div style={{ marginTop: "10px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>{t.askHelp}</label>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder={t.placeholder}
          style={{ width: "100%", padding: "6px", marginBottom: "6px" }}
        />
        <button
          onClick={handleChatSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "6px",
            background: "#4caf50",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? t.waiting : t.askAI}
        </button>

        {chatResponse && (
          <div style={{
            marginTop: "10px",
            padding: "6px",
            background: "#f0f0f0",
            borderRadius: "6px"
          }}>
            <strong>{t.response}</strong><br />
            {chatResponse}
          </div>
        )}
      </div>
    </div> 
  );
};

export default FilterBox;
 