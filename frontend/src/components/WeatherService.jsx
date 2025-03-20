import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Thermometer, Droplet, Wind } from 'lucide-react';
import '../styles/WeatherService.css';

const WeatherService = ({ onWeatherChange }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [cloudData, setCloudData] = useState(null);
  const [windData, setWindData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default coordinates for the field
  const lat = -7.5596;
  const lon = -7.5886;

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        // Get current date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Fetch all weather data in parallel - remove "/api" prefix
        const [weatherResponse, cloudResponse, windResponse] = await Promise.all([
          fetch(`/weather/${today}/${lat}/${lon}`),
          fetch(`/cloud/${today}/${lat}/${lon}`),
          fetch(`/wind/${today}/${lat}/${lon}`)
        ]);

        // Log responses for debugging
        console.log('Weather response status:', weatherResponse.status);
        console.log('Cloud response status:', cloudResponse.status);
        console.log('Wind response status:', windResponse.status);

        // Check responses
        if (!weatherResponse.ok || !cloudResponse.ok || !windResponse.ok) {
          throw new Error('One or more weather API calls failed');
        }

        // Parse JSON
        const weather = await weatherResponse.json();
        const cloud = await cloudResponse.json();
        const wind = await windResponse.json();

        console.log('Weather data:', weather);
        console.log('Cloud data:', cloud);
        console.log('Wind data:', wind);

        // Update state
        setWeatherData(weather);
        setCloudData(cloud);
        setWindData(wind);

        // Determine weather type based on data
        const weatherType = determineWeatherType(weather, cloud);

        // Call the onWeatherChange callback to update weather in parent components
        if (onWeatherChange) {
          onWeatherChange(weatherType);
        }
      } catch (err) {
        console.error('Failed to fetch weather data:', err);
        setError('Could not load weather data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Set up interval to refresh weather data every 10 minutes
    const intervalId = setInterval(fetchWeather, 600000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [onWeatherChange, lat, lon]);

  // Rest of the component remains the same...
  // Determine weather type based on conditions
  const determineWeatherType = (weather, cloud) => {
    const rainfall = parseFloat(weather?.rainfall || 0);
    const cloudCover = parseFloat(cloud?.cloud_cover || 0);
    const temperature = parseFloat(weather?.temperature || 20);

    if (rainfall > 5) {
      return 'rainy';
    } else if (cloudCover > 70) {
      return 'cloudy';
    } else if (temperature < 0) {
      return 'snowy';
    } else {
      return 'sunny';
    }
  };

  // Weather icon based on current conditions
  const renderWeatherIcon = (weather) => {
    switch (weather) {
      case 'sunny':
        return <Sun size={24} className="weather-icon sunny" />;
      case 'cloudy':
        return <Cloud size={24} className="weather-icon cloudy" />;
      case 'rainy':
        return <CloudRain size={24} className="weather-icon rainy" />;
      default:
        return <Cloud size={24} className="weather-icon" />;
    }
  };

  // Get current weather type
  const getCurrentWeatherType = () => {
    return determineWeatherType(weatherData, cloudData);
  };

  if (loading) {
    return (
        <div className="weather-widget loading">
          <div className="weather-loading-animation"></div>
          <span>Loading weather data...</span>
        </div>
    );
  }

  if (error) {
    return (
        <div className="weather-widget error">
          <span>{error}</span>
        </div>
    );
  }

  if (!weatherData || !cloudData || !windData) return null;

  const weatherType = getCurrentWeatherType();

  return (
      <div className={`weather-widget weather-${weatherType}`}>
        <div className="weather-header">
          <h3>Current Weather</h3>
          <div className="weather-main">
            {renderWeatherIcon(weatherType)}
            <span className="weather-condition">
            {weatherType.charAt(0).toUpperCase() + weatherType.slice(1)}
          </span>
          </div>
        </div>

        <div className="weather-details">
          <div className="weather-detail-item">
            <Thermometer size={16} />
            <span>{weatherData.temperature}°C</span>
          </div>
          <div className="weather-detail-item">
            <Droplet size={16} />
            <span>{weatherData.rainfall} mm</span>
          </div>
          <div className="weather-detail-item">
            <Cloud size={16} />
            <span>{cloudData.cloud_cover}% Cloud Cover</span>
          </div>
          <div className="weather-detail-item">
            <Wind size={16} />
            <span>{windData.wind_speed} m/s</span>
          </div>
        </div>

        <div className="weather-footer">
          <div className="weather-updated">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
  );
};

export default WeatherService;