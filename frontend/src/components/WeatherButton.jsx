import React, { useEffect, useState } from 'react';
import '../styles/WeatherButton.css';

function WeatherButton() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Get current date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Example coordinates (you might want to get these from user's location or props)
        const lat = 47.5596;  // Example: Zürich coordinates
        const lon = 7.5886;

        const response = await fetch(`/api/weather/${today}/${lat}/${lon}`);
        if (!response.ok) {
          throw new Error(`Network response was not ok (status: ${response.status})`);
        }
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  // Loading state
  if (loading) {
    return (
      <button type="button" className="weather-button" disabled>
        Loading...
      </button>
    );
  }

  // Error state
  if (error) {
    return (
      <button type="button" className="weather-button error" disabled>
        Error: {error}
      </button>
    );
  }

  // No weather data
  if (!weather) {
    return (
      <button type="button" className="weather-button" disabled>
        No weather data
      </button>
    );
  }

  const { temperature, rainfall, soil_moisture } = weather;

  return (
    <button type="button" className="weather-button">
      <span role="img" aria-label="weather" className="weather-icon">
        🌡️
      </span>
      {`${temperature}°C | Rain: ${rainfall}mm | Soil: ${soil_moisture}%`}
    </button>
  );
}

export default WeatherButton;