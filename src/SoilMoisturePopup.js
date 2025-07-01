import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { getTranslation } from './i18n';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const SoilMoisturePopup = ({ mapCenter, onClose, selectedLanguage }) => {
  const [chartData, setChartData] = useState(null);
  const [irrigationRecommendations, setIrrigationRecommendations] = useState(null);
  const [error, setError] = useState("");
  const t = getTranslation(selectedLanguage);

  const fallback = [20.5937, 78.9629];
  const [lat, setLat] = useState(fallback[0]);
  const [lon, setLon] = useState(fallback[1]);

  // ✅ Update lat/lon when mapCenter changes
  useEffect(() => {
    if (
      Array.isArray(mapCenter) &&
      mapCenter.length === 2 &&
      !isNaN(mapCenter[0]) &&
      !isNaN(mapCenter[1])
    ) {
      setLat(mapCenter[0]);
      setLon(mapCenter[1]);
    } else {
      setLat(fallback[0]);
      setLon(fallback[1]);
    }
  }, [mapCenter]);

  // ✅ Fetch soil moisture data when lat/lon changes
  useEffect(() => {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      setError("Invalid coordinates.");
      return;
    }

    const fetchSoilMoisture = async () => {
      try {
        setChartData(null);
        setError("");
        setIrrigationRecommendations(null);

        const res = await fetch(
          `https://archive-api.open-meteo.com/v1/era5?latitude=${lat}&longitude=${lon}&daily=soil_moisture_0_to_7cm_mean&past_days=7&timezone=auto`
        );
        const data = await res.json();

        if (!res.ok || !data?.daily?.soil_moisture_0_to_7cm_mean) {
          setError("No soil moisture data.");
          return;
        }

        const labels = data.daily.time;
        const values = data.daily.soil_moisture_0_to_7cm_mean;

        setChartData({
          labels,
          datasets: [
            {
              label: `${t.soilMoisture} (0–7 cm)`,
              data: values,
              borderColor: 'green',
              backgroundColor: 'rgba(0,128,0,0.1)',
              tension: 0.4
            }
          ]
        });

        const latest = values.slice(-1)[0];
        if (latest < 0.2) {
          setIrrigationRecommendations(t.irrigationLow);
        } else if (latest < 0.4) {
          setIrrigationRecommendations(t.irrigationMedium);
        } else {
          setIrrigationRecommendations(t.irrigationGood);
        }

      } catch (err) {
        console.error("Soil moisture fetch error:", err);
        setError("Failed to fetch soil moisture.");
        setChartData(null);
      }
    };

    fetchSoilMoisture();
  }, [lat, lon]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '80px',
        left: '20px',
        width: '340px',
        background: '#fff',
        padding: '12px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 1000
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h4>{t.soilMoisture}</h4>
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'none',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          ✖
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && !chartData && <p>{t.loading}</p>}
      {chartData && (
        <div>
          <Line data={chartData} />
          <p>
            <strong>{t.irrigationTitle}</strong> {irrigationRecommendations}
          </p>
        </div>
      )}
    </div>
  );
};

export default SoilMoisturePopup;
