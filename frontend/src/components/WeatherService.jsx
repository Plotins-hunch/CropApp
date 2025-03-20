import React, { useState, useEffect } from 'react';
import { getWeatherData } from '../services/api';
import { SunIcon, CloudIcon, CloudRainIcon, ThermometerIcon, DropletIcon, WindIcon } from 'lucide-react';
import '../styles/WeatherService.css';

const WeatherService = ({ onWeatherChange }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        // Default coordinates for the field
        const data = await getWeatherData({ lat: 47.5, lng: 7.6 });
        setWeatherData(data);
        
        // Call the onWeatherChange callback to update weather in parent components
        if (onWeatherChange && data.currentWeather) {
          onWeatherChange(data.currentWeather);
        }
      } catch (err) {
        console.error('Failed to fetch weather data:', err);
        setError('Could not load weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Set up interval to refresh weather data every 10 minutes
    const intervalId = setInterval(fetchWeather, 600000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [onWeatherChange]);

  // Weather icon based on current conditions
  const renderWeatherIcon = (weather) => {
    switch (weather) {
      case 'sunny':
        return <SunIcon size={24} className="weather-icon sunny" />;
      case 'cloudy':
        return <CloudIcon size={24} className="weather-icon cloudy" />;
      case 'rainy':
        return <CloudRainIcon size={24} className="weather-icon rainy" />;
      default:
        return <CloudIcon size={24} className="weather-icon" />;
    }
  };

  // Get appropriate classes for the widget based on weather
  const getWeatherClass = () => {
    if (!weatherData) return '';
    return `weather-${weatherData.currentWeather}`;
  };

  if (loading) {
    return (
      <div className="weather-widget loading">
        <div className="weather-loading-animation"></div>
        <span>Loading weather...</span>
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

  if (!weatherData) return null;

  return (
    <div className={`weather-widget ${getWeatherClass()}`}>
      <div className="weather-header">
        <h3>Current Weather</h3>
        <div className="weather-main">
          {renderWeatherIcon(weatherData.currentWeather)}
          <span className="weather-condition">
            {weatherData.currentWeather.charAt(0).toUpperCase() + weatherData.currentWeather.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="weather-details">
        <div className="weather-detail-item">
          <ThermometerIcon size={16} />
          <span>{weatherData.temperature}°C</span>
        </div>
        <div className="weather-detail-item">
          <DropletIcon size={16} />
          <span>{weatherData.humidity}% Humidity</span>
        </div>
        <div className="weather-detail-item">
          <WindIcon size={16} />
          <span>{weatherData.windSpeed} km/h</span>
        </div>
        {weatherData.precipitation > 0 && (
          <div className="weather-detail-item">
            <CloudRainIcon size={16} />
            <span>{weatherData.precipitation} mm</span>
          </div>
        )}
      </div>
      
      <div className="weather-forecast">
        <p>{weatherData.forecastSummary}</p>
      </div>
    </div>
  );
};

export default WeatherService;