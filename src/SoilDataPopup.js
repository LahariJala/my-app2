import React from "react";
import { Popup } from "react-leaflet";

export default function SoilDataPopup({ lat, lon, data, onClose }) {
  return (
    <Popup
      position={[lat, lon]}
      closeOnClick={false}
      autoClose={false}
      eventHandlers={{ remove: onClose }}
    >
      <strong>Soil data (0‑5 cm)</strong>
      <br />pH: {data?.pH ?? "N/A"}
      <br />OC (g kg⁻¹): {data?.ocd ?? "N/A"}
      <br />Clay %: {data?.clay ?? "N/A"}
    </Popup>
  );
}
