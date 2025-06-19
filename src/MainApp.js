// src/MainApp.js
import React, { useState } from "react";
import FilterBox from "./FilterBox";
import SoilMoisturePopup from "./SoilMoisturePopup";
import WeatherPopup from "./WeatherPopup";
import FloodPopup from "./FloodPopup";
import ActivityLogger from "./ActivityLogger";
import ActivityCalendar from "./ActivityCalendar";
import MapComponent from "./MapComponent";

const MainApp = (props) => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  return (
    <>
      <FilterBox
        selectedLayers={props.selectedLayers}
        setSelectedLayers={props.setSelectedLayers}
        selectedLanguage={props.selectedLanguage}
        setSelectedLanguage={props.setSelectedLanguage}
        onSoilMoistureToggle={props.onSoilMoistureToggle}
        onWeatherToggle={props.onWeatherToggle}
        onFloodToggle={props.onFloodToggle}
        onToggleCalendar={props.onToggleCalendar}
        onAddActivity={props.onAddActivity}
      />

      {props.showSoilMoisture && (
        <SoilMoisturePopup
          mapCenter={props.mapCenter}
          onClose={() => props.handleClosePopup("soilMoisture")}
          selectedLanguage={selectedLanguage}
        />
      )}
      {props.showWeather && (
        <WeatherPopup
          mapCenter={props.mapCenter}
          onClose={() => props.handleClosePopup("weather")}
        />
      )}
      {props.showFlood && (
        <FloodPopup
          mapCenter={props.mapCenter}
          onClose={() => props.handleClosePopup("flood")}
        />
      )}

      {props.showLogger && props.selectedLocation && (
        <ActivityLogger
          location={props.selectedLocation}
          editingActivity={props.editingActivity}
          onSave={props.onSaveActivity}
          onClose={() => {
            props.setShowLogger(false);
            props.setEditingActivity(null);
          }}
        />
      )}

      {props.showActivityCalendar && (
        <ActivityCalendar
          activities={props.activityLog}
          onDelete={props.onDeleteActivity}
          onEdit={props.onEditActivity}
          onClose={props.onCloseCalendar}
        />
      )}

      <MapComponent
        mapCenter={props.mapCenter}
        onMapClick={props.handleMapClick}
        selectedLayers={props.selectedLayers}
        selectedWeatherCondition={props.selectedWeatherCondition}
      />
    </>
  );
};

export default MainApp;
