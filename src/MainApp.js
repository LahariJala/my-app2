// src/MainApp.js
import React from "react";
import FilterBox from "./FilterBox";
import WeatherPopup from "./WeatherPopup";
import FloodPopup from "./FloodPopup";
import ActivityLogger from "./ActivityLogger";
import ActivityCalendar from "./ActivityCalendar";
import MapComponent from "./MapComponent";
import SearchBar from "./SearchBar";
import NDVIPopup   from "./NDVIPopup";
console.log("NDVI typeof:", typeof NDVIPopup, NDVIPopup);



const MainApp = (props) => {
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
        onNDVIToggle={props.onNDVIToggle}
        onSoilDataToggle={props.onSoilDataToggle}
      />

      <SearchBar onSelectLocation={props.onSelectLocation} />

      {props.showWeather && (
  <WeatherPopup
    key={JSON.stringify(props.mapCenter)} // 👈 Force re-mount on location change
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

      {props.showSoilData && props.soilPopup && (
  <SoilDataPopup
    lat={props.soilPopup.lat}
    lon={props.soilPopup.lon}
    data={props.soilPopup.data}
    onClose={() => props.handleClosePopup("soil")}
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
      {props.showNDVI && (
  <NDVIPopup
     mapCenter={props.mapCenter}
     onClose={()=>props.handleClosePopup("ndvi")}
     selectedLanguage={props.selectedLanguage}
  />
)}

      <MapComponent
        mapCenter={props.mapCenter}
        onMapClick={props.handleMapClick}
        selectedLayers={props.selectedLayers}
        selectedWeatherCondition={props.selectedWeatherCondition}
        digipin={props.selectedLocation?.digipin}
        selectedLanguage={props.selectedLanguage}
        showSoilMoisture={props.selectedLayers.soilMoisture} // ✅ FIXED
        showSoilData={props.selectedLayers.soilData}
    />
    </>
  );
};

export default MainApp;
