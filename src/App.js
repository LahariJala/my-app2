// src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import MainApp    from "./MainApp";
import FarmMarket from "./FarmMarket";
import { fetchSoilPointData } from "./utils/fetchSoilPointData";

import "./App.css";

export default function App() {
  /* ─────────── STATE ─────────── */
  const [activityLog, setActivityLog] = useState(() => {
    const saved = localStorage.getItem("farmActivities");
    return saved ? JSON.parse(saved) : [];
  });
  const [remindedActivities, setRemindedActivities] = useState([]);

  const [selectedLayers, setSelectedLayers] = useState({
    soilMoisture: false,
    soilData:     false,
    weather:      false,
    flood:        false,
    ndvi:         false          // ✅ NDVI layer flag
  });

  const [mapCenter, setMapCenter]         = useState({ lat: 20.5937, lng: 78.9629 });
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  /* pop‑up flags */
  const [showWeather, setShowWeather] = useState(false);
  const [showFlood,   setShowFlood]   = useState(false);
  const [showNDVI,    setShowNDVI]    = useState(false);
  const [showSoilData,setShowSoilData] = useState(false);
 const [soilPopup,   setSoilPopup]   = useState(null);

  /* activity UI flags */
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [editingActivity,  setEditingActivity]  = useState(null);
  const [showLogger,       setShowLogger]       = useState(false);
  const [showActivityCalendar, setShowActivityCalendar] = useState(false);

  const [selectedWeatherCondition, setSelectedWeatherCondition] = useState(null);

  /* ─────────── EFFECTS ─────────── */
  useEffect(() => {
    localStorage.setItem("farmActivities", JSON.stringify(activityLog));
  }, [activityLog]);

  /* 15‑minute reminder */
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      activityLog.forEach(a => {
        const diff = new Date(a.date) - now;
        if (diff > 0 && diff < 15 * 60 * 1000 && !remindedActivities.includes(a.id)) {
          alert(`⏰ Reminder: ${a.type} at ${a.lat}, ${a.lon}`);
          setRemindedActivities(prev => [...prev, a.id]);
        }
      });
    }, 60000);
    return () => clearInterval(id);
  }, [activityLog, remindedActivities]);

  /* ─────────── LAYER TOGGLES ─────────── */
  const toggleSoilMoisture = () => {
    setSelectedLayers({ soilMoisture:true, weather:false, flood:false, ndvi:false });
    setShowWeather(false); setShowFlood(false); setShowNDVI(false);
  };
  const toggleWeather = () => {
    setSelectedLayers({ soilMoisture:false, weather:true, flood:false, ndvi:false });
    setShowWeather(true); setShowFlood(false); setShowNDVI(false);
  };
  const toggleFlood = () => {
    setSelectedLayers({ soilMoisture:false, weather:false, flood:true, ndvi:false });
    setShowFlood(true); setShowWeather(false); setShowNDVI(false);
  };
  const toggleNDVI = () => {
    setSelectedLayers({ soilMoisture:false, weather:false, flood:false, ndvi:true });
    setShowNDVI(true); setShowWeather(false); setShowFlood(false);
  };
  const toggleSoilData = () => {
   setSelectedLayers({ soilMoisture:false, soilData:true, weather:false, flood:false, ndvi:false }); 
   setShowSoilData(true); 
   setShowWeather(false); setShowFlood(false); setShowNDVI(false); 
   setSoilPopup(null); 
 };

  const handleClosePopup = (type) => {
    if (type === "weather") setShowWeather(false);
    if (type === "flood")   setShowFlood(false);
    if (type === "ndvi")    setShowNDVI(false);   // ✅ close NDVI
   if (type === "soil")    setShowSoilData(false);
  };

  /* ─────────── MAP CLICK ─────────── */
  const handleMapClick = async ({ lat, lng }) => {
    setMapCenter({ lat, lng });

   if (showSoilData) {
  try {
    const data = await fetchSoilPointData(lat, lng);
    setSoilPopup({ lat, lon: lng, data });
  } catch {
    alert("Soil data fetch failed");
  }
} else {
  setSoilPopup(null);
}


    /* weather symbol */
    try {
      const key  = process.env.REACT_APP_OPENWEATHER_API_KEY;
      const json = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${key}`
      ).then(r => r.json());
      setSelectedWeatherCondition(json?.weather?.[0]?.main || "");
    } catch {/* ignore */}

    /* DIGIPIN */
    try {
      const digi = await fetch(
        `https://my-app2-oimj.onrender.com/api/digipin/encode?latitude=${lat}&longitude=${lng}`
      ).then(r => r.json());
      setSelectedLocation({ lat, lng, digipin:digi.digipin || "Unavailable" });
    } catch {
      setSelectedLocation({ lat, lng, digipin:"Unavailable" });
    }
  };

  /* ─────────── ACTIVITY HELPERS ─────────── */
  const handleSaveActivity = (a) => {
    const act = { ...a, id: a.id || Date.now() };
    if (editingActivity) {
      setActivityLog(prev => prev.map(p => p.id===editingActivity.id ? act : p));
    } else {
      setActivityLog(prev => [...prev, act]);
    }
    setShowLogger(false); setEditingActivity(null);
  };
  const handleDeleteActivity = (a) =>
    setActivityLog(prev => prev.filter(p => p.id !== a.id));
  const handleEditActivity = (a) => {
    setSelectedLocation({ lat:a.lat, lng:a.lon });
    setEditingActivity(a); setShowLogger(true);
  };
  const handleAddActivityManual = () => {
    setSelectedLocation({ lat:20.5937, lng:78.9629 });
    setEditingActivity(null); setShowLogger(true);
  };

  /* search bar selection */
  const handleSelectLocation = async ({ lat, lng, name }) => {
  try {
    const digi = await fetch(
      `https://my-app2-oimj.onrender.com/api/digipin/encode?latitude=${lat}&longitude=${lng}`
    ).then(r => r.json());
    setMapCenter({ lat, lng });
    setSelectedLocation({ lat, lng, name, digipin: digi.digipin || "Unavailable" });

    if (showSoilData) {
      try {
        const data = await fetchSoilPointData(lat, lng);
        setSoilPopup({ lat, lon: lng, data });
      } catch {
        alert("Soil data fetch failed");
      }
    } else {
      setSoilPopup(null);
    }
  } catch {/* ignore */}
};
  /* ─────────── ROUTES ─────────── */
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainApp
            /* language */
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}

            /* layers & toggles */
            selectedLayers={selectedLayers}
            setSelectedLayers={setSelectedLayers}
            onSoilMoistureToggle={toggleSoilMoisture}
            onWeatherToggle={toggleWeather}
            onFloodToggle={toggleFlood}
            onNDVIToggle={toggleNDVI}
             onSoilDataToggle={toggleSoilData}

            /* popups */
            showWeather={showWeather}
            showFlood={showFlood}
            showNDVI={showNDVI}
            showSoilData={showSoilData}
            soilPopup={soilPopup}
            handleClosePopup={handleClosePopup}

            /* map */
            mapCenter={mapCenter}
            handleMapClick={handleMapClick}
            selectedWeatherCondition={selectedWeatherCondition}
            onSelectLocation={handleSelectLocation}

            /* activities */
            selectedLocation={selectedLocation}
            showLogger={showLogger}
            editingActivity={editingActivity}
            onSaveActivity={handleSaveActivity}
            setShowLogger={setShowLogger}
            setEditingActivity={setEditingActivity}
            activityLog={activityLog}
            showActivityCalendar={showActivityCalendar}
            onDeleteActivity={handleDeleteActivity}
            onEditActivity={handleEditActivity}
            onCloseCalendar={() => setShowActivityCalendar(false)}
            onToggleCalendar={() => setShowActivityCalendar(true)}
            onAddActivity={handleAddActivityManual}
          />
        }
      />
      <Route path="/farm-market" element={<FarmMarket />} />
    </Routes>
  );
}
