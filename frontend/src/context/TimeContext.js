// src/context/TimeContext.js
import React, { createContext, useContext, useState } from 'react';

// Create a context for time-related state
const TimeContext = createContext();

// Custom hook to use the time context
export const useTime = () => useContext(TimeContext);

// Provider component to wrap around parts of the app that need time context
export const TimeProvider = ({ children }) => {
  const [currentYear, setCurrentYear] = useState(2025); // Default to current year
  const [timePeriod, setTimePeriod] = useState('present'); // 'past', 'present', or 'future'

  // Function to update the current year
  const updateYear = (year) => {
    setCurrentYear(year);
  };

  // Function to update the time period
  const updateTimePeriod = (period) => {
    setTimePeriod(period);
  };

  // Generate deterministic pseudo-random value based on year (between 0 and 1)
  const getYearBasedValue = (year, seed = 0) => {
    // Simple hash function to generate a value between 0 and 1
    const hash = (year * 9301 + seed * 49297) % 233280;
    return (hash / 233280);
  };

  // Generate risk values based on year
  const getRiskValues = (year) => {
    // Define risk patterns by year
    const futureDroughtPattern = year > 2027 ? 0.7 : 0.5; // More drought in far future
    const futureHeatPattern = year > 2026 ? 0.8 : 0.5; // More heat in future
    const pastYieldPattern = year < 2023 ? 0.5 : 0.7; // Lower yields in past
    
    return {
      drought: Math.round(getYearBasedValue(year, 1) * 10 * (year > 2025 ? futureDroughtPattern : 0.4)), // 0-10 scale
      heat: Math.round(getYearBasedValue(year, 2) * 9 * (year > 2025 ? futureHeatPattern : 0.6)),     // 0-9 scale
      yield: Math.round(20 + getYearBasedValue(year, 3) * 80 * (year < 2025 ? pastYieldPattern : 0.9)), // 20-100%
      // Add more risk values as needed
    };
  };

  // Generate weather data based on year
  const getWeatherData = (year) => {
    const types = ['sunny', 'cloudy', 'rainy'];
    const typeIndex = Math.floor(getYearBasedValue(year, 4) * types.length);
    
    return {
      type: types[typeIndex],
      temperature: Math.round(10 + getYearBasedValue(year, 5) * 25), // 10-35°C
      precipitation: Math.round(getYearBasedValue(year, 6) * 100) / 10, // 0-10mm
      humidity: Math.round(40 + getYearBasedValue(year, 7) * 50), // 40-90%
      cloudCover: Math.round(getYearBasedValue(year, 8) * 100) // 0-100%
    };
  };

  // Generate soil data based on year
  const getSoilData = (year) => {
    return {
      moisture: Math.round(30 + getYearBasedValue(year, 9) * 50), // 30-80%
      health: Math.round(50 + getYearBasedValue(year, 10) * 50), // 50-100%
      nutrients: Math.round(40 + getYearBasedValue(year, 11) * 60) // 40-100%
    };
  };

  // Generate product effectiveness data based on year
  const getProductEffectiveness = (year, productType) => {
    // Seed values for different products
    const seedMap = {
      'stress-buster': 12,
      'yield-booster': 13,
      'nutrient-plus': 14
    };
    
    const seed = seedMap[productType] || 12;
    
    return Math.round(50 + getYearBasedValue(year, seed) * 50); // 50-100%
  };

  // Value object to provide through context
  const value = {
    currentYear,
    timePeriod,
    updateYear,
    updateTimePeriod,
    getRiskValues,
    getWeatherData,
    getSoilData,
    getProductEffectiveness
  };

  return (
    <TimeContext.Provider value={value}>
      {children}
    </TimeContext.Provider>
  );
};