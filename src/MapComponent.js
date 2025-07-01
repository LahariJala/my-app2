// src/MapComponent.js
import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
  GeoJSON,
  Popup
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SoilMoisturePopup from "./SoilMoisturePopup";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

const FlyToLocation = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], 13, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
};

const FloodLayer = ({ show }) => {
  const map = useMap();
  useEffect(() => {
    if (!show) return;
    const layer = L.tileLayer(
      "https://floodmap.modaps.eosdis.nasa.gov/arcgis/rest/services/FloodMap/FloodMap_MODIS_NRT_Global/MapServer/tile/{z}/{y}/{x}",
      { attribution: "NASA GFMS", opacity: 0.6 }
    );
    map.addLayer(layer);
    return () => map.removeLayer(layer);
  }, [show, map]);
  return null;
};

const WeatherOverlay = ({ condition }) => {
  const map = useMap();
  useEffect(() => {
    let overlay;
    if (!condition) return;

    if (condition.includes("rain")) {
      overlay = L.tileLayer(
        `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`,
        { opacity: 0.6 }
      );
    } else if (condition.includes("wind")) {
      overlay = L.tileLayer(
        `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`,
        { opacity: 0.6 }
      );
    } else if (condition.includes("cloud")) {
      overlay = L.tileLayer(
        `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`,
        { opacity: 0.4 }
      );
    }

    if (overlay) map.addLayer(overlay);
    return () => {
      if (overlay) map.removeLayer(overlay);
    };
  }, [condition, map]);
  return null;
};

const FloodLegend = () => (
  <div style={{
    position: "absolute",
    bottom: 20,
    left: 20,
    background: "white",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 0 6px rgba(0,0,0,0.3)",
    fontSize: "12px",
    zIndex: 1000
  }}>
    <strong>Flood Risk Map</strong><br />
    ⬛ Dark Black: High<br />
    ◼️ Black: Medium<br />
    ◾ Light Black: Low
  </div>
);

const MapComponent = ({
  selectedLayers,
  mapCenter,
  digipin,
  selectedWeatherCondition,
  selectedLanguage,
  onMapClick,
  showSoilMoisture
}) => {
  const mapRef = useRef();
  const [indiaBoundary, setIndiaBoundary] = useState(null);
  const [popupLocation, setPopupLocation] = useState(null);

  const centerArray =
    mapCenter && mapCenter.lat && mapCenter.lng
      ? [mapCenter.lat, mapCenter.lng]
      : [20.5937, 78.9629];

  useEffect(() => {
    fetch("/India_borders.geojson")
      .then((res) => res.json())
      .then((data) => setIndiaBoundary(data))
      .catch((err) => console.error("Error loading India border:", err));
  }, []);

  useEffect(() => {
    if (showSoilMoisture && mapCenter?.lat && mapCenter?.lng) {
      setPopupLocation({ lat: mapCenter.lat, lng: mapCenter.lng });
    }
  }, [showSoilMoisture, mapCenter]);

  const handleMapClick = ({ lat, lng }) => {
    setPopupLocation({ lat, lng });
    onMapClick?.({ lat, lng });
  };

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        center={centerArray}
        zoom={6}
        style={{ height: "100vh", width: "100vw" }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToLocation center={mapCenter} />
        <MapEvents onMapClick={handleMapClick} />

        {mapCenter?.lat && mapCenter?.lng && (
          <Marker position={[mapCenter.lat, mapCenter.lng]}>
            <Popup>
              <strong>Location:</strong><br />
              Lat: {mapCenter.lat.toFixed(5)}, Lng: {mapCenter.lng.toFixed(5)}<br />
              <strong>DIGIPIN:</strong> {digipin || "Loading..."}
            </Popup>
          </Marker>
        )}

        <WeatherOverlay condition={selectedWeatherCondition?.toLowerCase()} />
        {selectedLayers?.flood && <FloodLayer show={true} />}
        {indiaBoundary && (
          <GeoJSON
            data={indiaBoundary}
            style={{ color: "#FF0000", weight: 2, fillOpacity: 0 }}
          />
        )}
      </MapContainer>

      {selectedLayers?.flood && <FloodLegend />}

      {/* ✅ Show Soil Moisture Chart Popup */}
      {showSoilMoisture && popupLocation && (
        <SoilMoisturePopup
          mapCenter={[popupLocation.lat, popupLocation.lng]}
          selectedLanguage={selectedLanguage}
          onClose={() => setPopupLocation(null)}
        />
      )}
    </div>
  );
};

export default MapComponent;
