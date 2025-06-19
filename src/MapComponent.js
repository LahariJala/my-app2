// src/MapComponent.js
import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
  GeoJSON // ✅ ADD THIS IMPORT
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

// Component to fly to new center
const FlyToLocation = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

// Capture map clicks
const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }); // ✅ Send full object
      }
    }
  });
  return null;
};

// ✅ FloodLayer component using NASA GFMS tiles
const FloodLayer = ({ show }) => {
  const map = useMap();

  useEffect(() => {
    if (!show) return;

    const layer = L.tileLayer(
      "https://floodmap.modaps.eosdis.nasa.gov/arcgis/rest/services/FloodMap/FloodMap_MODIS_NRT_Global/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "NASA GFMS",
        opacity: 0.6
      }
    );
    map.addLayer(layer);
    return () => {
      map.removeLayer(layer);
    };
  }, [show, map]);

  return null;
};

// ✅ Optional: Legend
const FloodLegend = () => (
  <div
    style={{
      position: "absolute",
      bottom: 20,
      left: 20,
      background: "white",
      padding: "10px",
      borderRadius: "8px",
      boxShadow: "0 0 6px rgba(0,0,0,0.3)",
      fontSize: "12px",
      zIndex: 1000
    }}
  >
    <strong>Flood Risk Map</strong>
    <br />
    ⬛ Dark Black: High
    <br />
    ◼️ Black: Medium
    <br />
    ◾ Light Black: Low
  </div>
);

const MapComponent = ({ selectedLayers, mapCenter, onMapClick }) => {
  const mapRef = useRef();
  const [indiaBoundary, setIndiaBoundary] = useState(null); // ✅ Declare state

  const safeCenter =
    Array.isArray(mapCenter) &&
    mapCenter.length === 2 &&
    !isNaN(mapCenter[0]) &&
    !isNaN(mapCenter[1])
      ? mapCenter
      : [20.5937, 78.9629]; // India fallback

  // ✅ Load India boundary once
  useEffect(() => {
    fetch("/India_borders.geojson")
      .then((res) => res.json())
      .then((data) => setIndiaBoundary(data))
      .catch((err) => console.error("Error loading India border:", err));
  }, []);
// Custom Weather Effect Overlay
const WeatherOverlay = ({ condition }) => {
  const map = useMap();

  useEffect(() => {
    let overlay;

    if (!condition) return;

    // Example effect overlays
    if (condition.includes("rain")) {
      overlay = L.tileLayer(
        "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=YOUR_OPENWEATHER_API_KEY",
        { opacity: 0.6 }
      );
    } else if (condition.includes("wind")) {
      overlay = L.tileLayer(
        "https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=YOUR_OPENWEATHER_API_KEY",
        { opacity: 0.6 }
      );
    } else if (condition.includes("cloud")) {
      overlay = L.tileLayer(
        "https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=YOUR_OPENWEATHER_API_KEY",
        { opacity: 0.4 }
      );
    }

    if (overlay) {
      map.addLayer(overlay);
    }

    return () => {
      if (overlay) {
        map.removeLayer(overlay);
      }
    };
  }, [condition, map]);

  return null;
};

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        center={safeCenter}
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
        <WeatherOverlay condition={selectedWeatherCondition?.toLowerCase()} />

        <FlyToLocation center={safeCenter} />
        <MapEvents onMapClick={onMapClick} />
        {safeCenter && <Marker position={safeCenter} />}

        {/* ✅ Flood Layer */}
        {selectedLayers?.flood && <FloodLayer show={true} />}

        {/* ✅ India boundary */}
        {indiaBoundary && (
          <GeoJSON
            data={indiaBoundary}
            style={{
              color: "#FF0000",
              weight: 2,
              fillOpacity: 0
            }}
          />
        )}
      </MapContainer>

      {/* ✅ Flood Legend */}
      {selectedLayers?.flood && <FloodLegend />}
    </div>
  );
};

export default MapComponent;
