import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Thermometer, Droplet, Wind } from 'lucide-react';
import '../styles/WeatherService.css';
import { useTime } from '../context/TimeContext';

const WeatherService = ({ onWeatherChange }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use time context
  const { currentYear, timePeriod, getWeatherData } = useTime();
  
  // Get weather data based on current year
  const weatherData = getWeatherData(currentYear);

  useEffect(() => {
    // Simulate data loading
    setLoading(true);
    
    // Short timeout to simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Call the onWeatherChange callback if provided
      if (onWeatherChange) {
        onWeatherChange(weatherData.type);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentYear, weatherData.type, onWeatherChange]);
  
  // Render weather icon based on current conditions
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

  return (
    <div className={`weather-widget weather-${weatherData.type}`}>
      <div className="weather-header">
        <h3>Weather Conditions</h3>
        <div className="weather-main">
          {renderWeatherIcon(weatherData.type)}
          <span className="weather-condition">
            {weatherData.type.charAt(0).toUpperCase() + weatherData.type.slice(1)}
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
          <span>{weatherData.precipitation} mm</span>
        </div>
        <div className="weather-detail-item">
          <Cloud size={16} />
          <span>{weatherData.cloudCover}% Cover</span>
        </div>
        <div className="weather-detail-item">
          <Wind size={16} />
          <span>{Math.round(5 + weatherData.cloudCover / 10)} m/s</span>
        </div>
      </div>

      <div className="weather-footer">
        {timePeriod === 'present' ? (
          <div className="weather-updated">
            Current weather conditions
          </div>
        ) : timePeriod === 'past' ? (
          <div className="weather-historical">
            Historical data from {currentYear}
          </div>
        ) : (
          <div className="weather-forecast">
            Predicted for {currentYear}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherService;