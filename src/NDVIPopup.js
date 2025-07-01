// src/NDVIPopup.js
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement, PointElement, LinearScale,
  CategoryScale, Title, Tooltip, Legend
} from "chart.js";
import { getTranslation } from "./i18n";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

export default function NDVIPopup({ mapCenter, onClose, selectedLanguage }) {
  const t = getTranslation(selectedLanguage);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState("");

  /* ── accept both [lat,lon] and {lat,lng} ── */
  const lat = Array.isArray(mapCenter)
              ? mapCenter[0]
              : (mapCenter?.lat ?? 20.5937);     // fallback India
  const lon = Array.isArray(mapCenter)
              ? mapCenter[1]
              : (mapCenter?.lng ?? mapCenter?.lon ?? 78.9629);

  useEffect(() => {
    (async () => {
      setError(""); setChartData(null);
      try {
        /* build date codes: last 12 months of 16‑day composites */
        const today = new Date();
        const doy   = String(Math.ceil((today - new Date(today.getFullYear(),0,0)) / 86400000)).padStart(3,"0");
        const end   = `A${today.getFullYear()}${doy}`;
        const start = `A${today.getFullYear()-1}${doy}`;

        const url = `https://modis.ornl.gov/rst/api/v1/MOD13Q1/subset?latitude=${lat}&longitude=${lon}` +
                    `&band=250m_16_days_NDVI&startDate=${start}&endDate=${end}&kmAboveBelow=0&kmLeftRight=0`;

        const json = await fetch(url).then(r => r.json());
        if (!json.subset) throw new Error("No NDVI data");

        setChartData({
          labels   : json.subset.map(p => p.calendar_date),
          datasets : [{
            label           : "NDVI",
            data            : json.subset.map(p => +p.data[0] / 10000),
            borderColor     : "purple",
            backgroundColor : "rgba(128,0,128,0.12)",
            tension         : 0.25
          }]
        });
      } catch (e) {
        console.error(e);
        setError("NDVI fetch error – data unavailable for this location.");
      }
    })();
  }, [lat, lon]);

  return (
    <div style={{
      position:"absolute", top:80, left:20, width:340, padding:12,
      background:"#fff", borderRadius:10,
      boxShadow:"0 4px 12px rgba(0,0,0,0.25)", zIndex:1000
    }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h4>NDVI</h4>
        <button onClick={onClose}
                style={{border:"none", background:"none", fontSize:18, cursor:"pointer"}}>✖</button>
      </div>

      {error ? (
        <p style={{color:"red"}}>{error}</p>
      ) : !chartData ? (
        <p>{t.loading}</p>
      ) : (
        <Line data={chartData} />
      )}
    </div>
  );
}
