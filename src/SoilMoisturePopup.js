// src/SoilMoisturePopup.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { getTranslation } from './i18n';


ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const SoilMoisturePopup = ({ mapCenter, onClose, selectedLanguage, style }) => {
  const [chartData, setChartData] = useState(null);
  const [irrigationRecommendations, setIrrigationRecommendations] = useState(null);
  const [error, setError] = useState("");
  const t = getTranslation(selectedLanguage);
  const fallback = [20.5937, 78.9629];
  const [lat, lon] = Array.isArray(mapCenter) && mapCenter.length === 2
    ? mapCenter
    : fallback;

  useEffect(() => {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      setError("Invalid coordinates.");
      return;
    }

    const fetchSoilMoisture = async () => {
      try {
        // Fetch historical data
        const historicalRes = await fetch(`https://archive-api.open-meteo.com/v1/era5?latitude=${lat}&longitude=${lon}&daily=soil_moisture_0_to_7cm_mean&past_days=7&timezone=auto`);
        const historicalData = await historicalRes.json();

        if (!historicalRes.ok) {
          console.error("API error:", historicalData);
          setError("Failed to fetch soil moisture.");
          return;
        }

        if (!historicalData?.daily?.soil_moisture_0_to_7cm_mean) {
          console.warn("Soil moisture data missing:", historicalData);
          setError("No soil moisture data.");
          setChartData(null);
          return;
        }

        setChartData({
          labels: historicalData.daily.time,
          datasets: [{
            label: t.soilMoisture,
            label: 'Soil Moisture (0–7 cm)',
            data: historicalData.daily.soil_moisture_0_to_7cm_mean,
            borderColor: 'green',
            backgroundColor: 'rgba(0,128,0,0.1)',
            tension: 0.4
          }]
        });

        // Calculate irrigation recommendations
        const latestSoilMoisture = historicalData.daily.soil_moisture_0_to_7cm_mean[historicalData.daily.soil_moisture_0_to_7cm_mean.length - 1];
        if (latestSoilMoisture < 20) {
    setIrrigationRecommendations(t.irrigationLow);
  } else if (latestSoilMoisture < 40) {
    setIrrigationRecommendations(t.irrigationMedium);
  } else {
    setIrrigationRecommendations(t.irrigationGood);
  }

        setError("");
      } catch (err) {
        console.error("Soil moisture fetch error:", err);
        setError("Failed to fetch soil moisture.");
        setChartData(null);
      }
    };

    fetchSoilMoisture();
  }, [lat, lon]);

  return (
    <div style={{ position: 'absolute', top: '80px', left: '20px', width: '340px', background: '#fff', padding: '12px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h4>Soil Moisture</h4>
        <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }}>✖</button>
      </div>
      <h4>{t.soilMoisture}</h4>
      {error && <p style={{ color: 'red' }}>{error}</p>}
       {!error && !chartData && <p>{t.loading}</p>}
      {chartData && (
        <div>
          <Line data={chartData} />
          <p><strong>{t.irrigationTitle}</strong> {irrigationRecommendations}</p>
        </div>
      )}
    </div>
  );
};

export default SoilMoisturePopup;