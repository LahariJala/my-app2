// src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import MapComponent from "./MapComponent";
import SearchBar from "./SearchBar";
import FilterBox from "./FilterBox";
import SoilMoisturePopup from "./SoilMoisturePopup";
import WeatherPopup from "./WeatherPopup";
import FloodPopup from "./FloodPopup";
import ActivityLogger from "./ActivityLogger";
import ActivityCalendar from "./ActivityCalendar";
import FarmMarket from "./FarmMarket";
import MainApp from "./MainApp";

import "./App.css";

function App() {
  const [activityLog, setActivityLog] = useState(() => {
    const saved = localStorage.getItem("farmActivities");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showLogger, setShowLogger] = useState(false);
  const [showActivityCalendar, setShowActivityCalendar] = useState(false);

  const [selectedLayers, setSelectedLayers] = useState({
    soilMoisture: false,
    weather: false,
    flood: false,
  });

  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showSoilMoisture, setShowSoilMoisture] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [showFlood, setShowFlood] = useState(false);
  const [selectedWeatherCondition, setSelectedWeatherCondition] = useState(null);

  useEffect(() => {
    localStorage.setItem("farmActivities", JSON.stringify(activityLog));
  }, [activityLog]);

  const handleMapClick = async (latlng) => {
    const { lat, lng } = latlng || {};
    if (typeof lat === "number" && typeof lng === "number") {
      setMapCenter([lat, lng]);
      setSelectedLocation({ lat, lng });
      setShowLogger(true);

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`
        );
        const data = await res.json();
        const weatherCondition = data?.weather?.[0]?.main || "";
        setSelectedWeatherCondition(weatherCondition);
      } catch (err) {
        console.error("Failed to fetch weather:", err);
      }
    }
  };

  const toggleSoilMoisture = () => {
    setShowSoilMoisture(true);
    setShowWeather(false);
    setShowFlood(false);
  };

  const toggleWeather = () => {
    setShowWeather(true);
    setShowSoilMoisture(false);
    setShowFlood(false);
  };

  const toggleFlood = () => {
    setShowFlood(true);
    setShowSoilMoisture(false);
    setShowWeather(false);
  };

  const handleClosePopup = (type) => {
    if (type === "soilMoisture") setShowSoilMoisture(false);
    else if (type === "weather") setShowWeather(false);
    else if (type === "flood") setShowFlood(false);
  };

  const handleSaveActivity = (activity) => {
    if (editingActivity) {
      const updated = activityLog.map((a) =>
        a.date === editingActivity.date &&
        a.lat === editingActivity.lat &&
        a.lon === editingActivity.lon
          ? activity
          : a
      );
      setActivityLog(updated);
    } else {
      setActivityLog([...activityLog, activity]);
    }
    setShowLogger(false);
    setEditingActivity(null);
  };

  const handleDeleteActivity = (toDelete) => {
    const updated = activityLog.filter(
      (a) =>
        !(
          a.date === toDelete.date &&
          a.lat === toDelete.lat &&
          a.lon === toDelete.lon
        )
    );
    setActivityLog(updated);
  };

  const handleEditActivity = (activity) => {
    setSelectedLocation({ lat: activity.lat, lng: activity.lon });
    setEditingActivity(activity);
    setShowLogger(true);
  };

  const handleAddActivityManual = () => {
    setSelectedLocation({ lat: 20.5937, lng: 78.9629 });
    setEditingActivity(null);
    setShowLogger(true);
  };

  return (
    <div className="App">
      <SearchBar
        onSelectLocation={(location) => {
          setMapCenter([location.lat, location.lng]);
          setSelectedLocation(location);
          setShowLogger(true);
        }}
      />

      <Routes>
        <Route
          path="/"
          element={
            <MainApp
              selectedLayers={selectedLayers}
              setSelectedLayers={setSelectedLayers}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              onSoilMoistureToggle={toggleSoilMoisture}
              onWeatherToggle={toggleWeather}
              onFloodToggle={toggleFlood}
              onToggleCalendar={() => setShowActivityCalendar(true)}
              onAddActivity={handleAddActivityManual}
              showSoilMoisture={showSoilMoisture}
              showWeather={showWeather}
              showFlood={showFlood}
              handleClosePopup={handleClosePopup}
              mapCenter={mapCenter}
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
              handleMapClick={handleMapClick}
              selectedWeatherCondition={selectedWeatherCondition}
            />
          }
        />
        <Route path="/farm-market" element={<FarmMarket />} />
      </Routes>
    </div>
  );
}

export default App;
