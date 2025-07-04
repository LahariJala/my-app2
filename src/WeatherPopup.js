// src/WeatherPopup.js
import React, { useEffect, useState } from 'react';

const WeatherPopup = ({ mapCenter, onClose, style }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [agricultureAdvice, setAgricultureAdvice] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fallback = [20.5937, 78.9629]; // India default

  useEffect(() => {
    const [lat, lon] = mapCenter?.lat && mapCenter?.lng
      ? [mapCenter.lat, mapCenter.lng]
      : fallback;

    const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

    if (!API_KEY) {
      setError("Missing API key. Please check .env file.");
      return;
    }

    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      setError("Invalid location selected.");
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError("");
      setWeatherData(null);
      setAgricultureAdvice(null);

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        if (!data?.list?.length) {
          setError("No weather data available.");
          return;
        }

        const dailyData = {};
        data.list.forEach(item => {
          const date = item.dt_txt.split(" ")[0];
          if (!dailyData[date]) dailyData[date] = [];
          dailyData[date].push(item);
        });

        const summary = Object.keys(dailyData).slice(0, 4).map((date, i) => {
          const dayData = dailyData[date];
          const temps = dayData.map(d => d.main.temp);
          const clouds = dayData.map(d => d.clouds?.all ?? 0);
          const avgClouds = clouds.length
            ? (clouds.reduce((a, b) => a + b, 0) / clouds.length).toFixed(0)
            : "N/A";

          return {
            date,
            min: Math.min(...temps),
            max: Math.max(...temps),
            desc: dayData[0]?.weather?.[0]?.description || "N/A",
            humidity: dayData[0]?.main?.humidity ?? "N/A",
            clouds: avgClouds,
            isToday: i === 0
          };
        });

        setWeatherData(summary);

        const advice = summary.map(day => {
          if (day.max > 35) {
            return `High temperature expected. Ensure adequate watering and provide shade for crops.`;
          } else if (day.min < 10) {
            return `Low temperature expected. Protect crops from frost and ensure adequate insulation.`;
          } else if (day.desc.includes("rain")) {
            return `Rain expected. Ensure proper drainage and avoid waterlogging.`;
          } else {
            return `Weather conditions are favorable for crops.`;
          }
        });

        setAgricultureAdvice(advice);
      } catch (err) {
        console.error("Weather error:", err);
        setError("Failed to load weather data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [JSON.stringify(mapCenter)]); // ✅ Refetch weather when location changes

  return (
    <div style={{
      position: 'absolute',
      top: '50px',
      left: '20px',
      width: '330px',
      background: '#fff',
      padding: '14px',
      borderRadius: '12px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
      zIndex: 1000,
      ...style
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>Weather Forecast</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer'
          }}
          title="Close"
        >
          ✖
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      {loading && <p style={{ marginTop: '10px' }}>Loading...</p>}

      {weatherData && weatherData.map((day, index) => (
        <div key={day.date} style={{ marginTop: '12px' }}>
          <strong>{day.isToday ? "Today" : new Date(day.date).toDateString()}</strong>
          <p style={{ margin: '6px 0' }}>
            🌤 Condition: <b>{day.desc}</b><br />
            🌡 Temp: <b>{day.min.toFixed(1)}°C</b> – <b>{day.max.toFixed(1)}°C</b><br />
            💧 Humidity: <b>{day.humidity}%</b><br />
            ☁️ Cloud Cover: <b>{day.clouds}%</b>
          </p>
          <p style={{ margin: '6px 0' }}>
            <strong>Agriculture Advice:</strong> {agricultureAdvice[index]}
          </p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default WeatherPopup;
