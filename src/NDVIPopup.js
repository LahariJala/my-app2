// src/NDVIPopup.js
import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { getTranslation } from "./i18n";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function NDVIPopup({ mapCenter, onClose, selectedLanguage = "en" }) {
  const t = getTranslation(selectedLanguage);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const lat = Array.isArray(mapCenter)
    ? mapCenter[0]
    : mapCenter?.lat ?? 20.5937;
  const lon = Array.isArray(mapCenter)
    ? mapCenter[1]
    : mapCenter?.lng ?? mapCenter?.lon ?? 78.9629;

  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      setChartData(null);
      setError("");

      try {
        const today = new Date();
        const doy = String(
          Math.ceil((today - new Date(today.getFullYear(), 0, 0)) / 86_400_000)
        ).padStart(3, "0");
        const endDate = `A${today.getFullYear()}${doy}`;
        const startDate = `A${today.getFullYear() - 1}${doy}`;

        const url =
          `https://modis.ornl.gov/rst/api/v1/MOD13Q1/subset` +
          `?latitude=${lat}&longitude=${lon}` +
          `&band=NDVI_250m` +
          `&startDate=${startDate}&endDate=${endDate}` +
          `&kmAboveBelow=1&kmLeftRight=1`;

        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(res.statusText || "Network error");
        const json = await res.json();

        if (!json.subset?.length) throw new Error("NDVI: empty subset");

        const dataset = json.subset.map((p) => {
          const raw = Array.isArray(p.data) ? p.data[0] : p.data;
          return {
            date: p.calendar_date,
            ndvi: raw == null ? null : raw * 0.0001,
          };
        }).filter(d => d.ndvi != null);

        if (!dataset.length) throw new Error("NDVI: cloud-masked/no valid pixels");

        setChartData({
          labels: dataset.map((d) => d.date),
          datasets: [
            {
              label: t.ndviLabel ?? "NDVI",
              data: dataset.map((d) => d.ndvi),
              fill: true,
              borderColor: "#7e22ce",
              backgroundColor: "rgba(126,34,206,0.15)",
              pointRadius: 3,
              tension: 0.3,
            },
          ],
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("NDVI fetch: ", err);
          setError(t.ndviError ?? "NDVI data unavailable for this location.");
        }
      }
    })();

    return () => ctrl.abort();
  }, [lat, lon, t]);

  if (!mapCenter) return null;

  return (
    <div style={{
      position: "absolute",
      top: 80,
      left: 20,
      width: 360,
      maxWidth: "90vw",
      padding: "1rem",
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
      zIndex: 1000,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>{t.ndviTitle ?? "NDVI"}</h3>
        <button
          onClick={onClose}
          style={{ border: "none", background: "none", fontSize: "1.25rem", cursor: "pointer" }}
          aria-label={t.close ?? "Close"}
        >
          &times;
        </button>
      </div>

      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      {!error && !chartData && <p>{t.loading}</p>}
      {chartData && (
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => ctx.parsed.y.toFixed(3),
                },
              },
            },
            scales: {
              y: {
                min: 0,
                max: 1,
                title: { display: true, text: "NDVI" },
              },
              x: { title: { display: true, text: t.date ?? "Date" } },
            },
          }}
          height={220}
        />
      )}
    </div>
  );
}
