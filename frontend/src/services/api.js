// src/services/api.js
// This file contains mock API functions that would be replaced with real API calls
// based on the CEHub API Service Specification

// API keys from the spec
const FORECAST_API_KEYS = [
    'd4f087c7-7efc-41b4-9292-0f22b6199215',
    '3b9ff1ee-c746-457b-a97c-0138ea3e1cc3',
    '7f0544a1-7890-495f-977d-8065b6254a0b',
    'c77ff2a0-014f-4391-8f55-23b75d0e4653',
    '79bb4aea-0c73-46d4-b8fd-c54a7efe6f94'
  ];
  
  const HISTORICAL_API_KEYS = [
    '7b29a207a0de',
    'e4e4d60f7203',
    '105d557f859d',
    '52g435398254',
    '9c579db416ae'
  ];
  
  // Configuration
  const USE_MOCK_DATA = true; // Set to false to use real API endpoints
  const API_BASE_URL = 'https://services.cehub.syngenta-ais.com/api';
  
  // Get a random API key for load balancing
  const getRandomForecastKey = () => FORECAST_API_KEYS[Math.floor(Math.random() * FORECAST_API_KEYS.length)];
  const getRandomHistoricalKey = () => HISTORICAL_API_KEYS[Math.floor(Math.random() * HISTORICAL_API_KEYS.length)];
  
  /**
   * Get weather data for a specific location
   * @param {Object} params - Location parameters { lat, lng }
   * @returns {Promise<Object>} Weather data
   */
  export const getWeatherData = async (params = { lat: 47.5, lng: 7.6 }) => {
    if (USE_MOCK_DATA) {
      return getMockWeatherData(params);
    }
    
    try {
      // Current date for the request
      const today = new Date().toISOString().split('T')[0];
      
      // Build the URL with query parameters for the ShortRangeForecastHourly endpoint
      const url = new URL(`${API_BASE_URL}/Forecast/ShortRangeForecastHourly`);
      url.searchParams.append('latitude', params.lat);
      url.searchParams.append('longitude', params.lng);
      url.searchParams.append('startDate', today);
      url.searchParams.append('endDate', today);
      url.searchParams.append('supplier', 'Meteoblue');
      url.searchParams.append('measureLabel', 'TempAir_Hourly (C);CloudCover_Hourly (pct);Precip_HourlySum (mm);HumidityRel_Hourly (pct);WindSpeed_Hourly (m/s)');
      url.searchParams.append('format', 'json');
      url.searchParams.append('ApiKey', getRandomForecastKey());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process API response to our expected format
      return processWeatherApiResponse(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return getMockWeatherData(params); // Fallback to mock data
    }
  };
  
  /**
   * Get soil data for a specific location and date
   * @param {String} date - Date in YYYY-MM-DD format
   * @param {Number} lat - Latitude
   * @param {Number} lon - Longitude
   * @returns {Promise<Object>} Soil data
   */
  export const getSoilData = async (date, lat, lon) => {
    if (USE_MOCK_DATA) {
      return getMockSoilData(lat, lon);
    }
    
    try {
      // Build the URL for Historical API - soil data
      const url = 'http://my.meteoblue.com/dataset/query';
      
      const requestBody = {
        units: {
          temperature: 'C',
          velocity: 'km/h',
          length: 'metric',
          energy: 'watts'
        },
        geometry: {
          type: 'Point',
          coordinates: [lon, lat] // Note order is longitude, latitude
        },
        format: 'json',
        timeIntervals: [
          `${date}T+00:00/${date}T+00:00`
        ],
        queries: [{
          domain: 'ERA5T',
          gapFillDomain: 'NEMSGLOBAL',
          timeResolution: 'daily',
          codes: [
            { code: 144, level: '0-10 cm down' } // USDA soil texture classes
          ]
        }]
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ApiKey': getRandomHistoricalKey()
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`Soil API error: ${response.status}`);
      }
      
      const data = await response.json();
      return processSoilApiResponse(data);
    } catch (error) {
      console.error('Error fetching soil data:', error);
      return getMockSoilData(lat, lon); // Fallback to mock data
    }
  };
  
  /**
   * Get product effectiveness comparison data
   * @param {String} productType - Type of product
   * @param {String} cropType - Type of crop
   * @param {String} date - Date in YYYY-MM-DD format
   * @param {Number} lat - Latitude
   * @param {Number} lon - Longitude
   * @returns {Promise<Object>} Product effectiveness data
   */
  export const getProductEffectiveness = async (productType, cropType, date, lat, lon) => {
    // In a real implementation, this would call algorithms as described in the 
    // weather-based algorithms document for different products
    
    // For this demo, we'll return mock data
    return getMockProductEffectiveness(productType, cropType);
  };
  
  // Helper function to process weather API response
  const processWeatherApiResponse = (data) => {
    if (!data || !data.results || data.results.length === 0) {
      throw new Error('Invalid weather data response');
    }
    
    // Get the first hourly record
    const currentWeather = data.results[0];
    
    // Extract data from measures
    const getMeasure = (label) => {
      const measure = currentWeather.measures.find(m => m.label.startsWith(label));
      return measure ? parseFloat(measure.value) : 0;
    };
    
    const temperature = getMeasure('TempAir_Hourly');
    const cloudCover = getMeasure('CloudCover_Hourly');
    const precipitation = getMeasure('Precip_HourlySum');
    const humidity = getMeasure('HumidityRel_Hourly');
    const windSpeed = getMeasure('WindSpeed_Hourly');
    
    // Determine weather type based on conditions
    let currentWeatherType = 'sunny';
    
    if (precipitation > 0) {
      currentWeatherType = 'rainy';
    } else if (cloudCover > 50) {
      currentWeatherType = 'cloudy';
    }
    
    // Generate forecast summary text based on conditions
    let forecastSummary = '';
    
    if (currentWeatherType === 'rainy') {
      forecastSummary = precipitation > 5 
        ? 'Heavy rainfall expected. Consider field drainage.' 
        : 'Light precipitation may improve soil moisture.';
    } else if (currentWeatherType === 'cloudy') {
      forecastSummary = temperature > 25 
        ? 'Warm and cloudy conditions expected.' 
        : 'Moderate temperatures with cloud cover.';
    } else {
      forecastSummary = temperature > 28 
        ? 'Hot and sunny. Monitor soil moisture levels.' 
        : 'Clear skies and favorable growing conditions.';
    }
    
    return {
      temperature: temperature.toFixed(1),
      precipitation: precipitation.toFixed(1),
      humidity: Math.round(humidity),
      windSpeed: Math.round(windSpeed * 3.6), // Convert m/s to km/h
      cloudCover: Math.round(cloudCover),
      currentWeather: currentWeatherType,
      forecastSummary,
      timestamp: currentWeather.timestamp
    };
  };
  
  // Helper function to process soil API response
  const processSoilApiResponse = (data) => {
    // This would process the specific soil data format from the API
    // For simplicity, we'll return a mock object
    return {
      moisture: 45,
      type: 'Loam',
      phLevel: 6.2,
      organicMatter: 3.5
    };
  };
  
  // Mock data generators for development and testing
  
  // Mock weather data
  const getMockWeatherData = (params) => {
    const weatherTypes = ['sunny', 'cloudy', 'rainy'];
    const randomIndex = Math.floor(Math.random() * weatherTypes.length);
    const weatherType = weatherTypes[randomIndex];
    
    let temperature, precipitation, humidity, cloudCover;
    
    switch (weatherType) {
      case 'sunny':
        temperature = 22 + Math.random() * 8;
        precipitation = 0;
        humidity = 30 + Math.random() * 20;
        cloudCover = Math.random() * 20;
        break;
      case 'cloudy':
        temperature = 18 + Math.random() * 6;
        precipitation = Math.random() < 0.3 ? Math.random() * 0.5 : 0;
        humidity = 50 + Math.random() * 20;
        cloudCover = 60 + Math.random() * 40;
        break;
      case 'rainy':
        temperature = 15 + Math.random() * 5;
        precipitation = 2 + Math.random() * 8;
        humidity = 70 + Math.random() * 20;
        cloudCover = 80 + Math.random() * 20;
        break;
    }
    
    // Generate forecast summary text based on conditions
    let forecastSummary = '';
    
    if (weatherType === 'rainy') {
      forecastSummary = precipitation > 5 
        ? 'Heavy rainfall expected. Consider field drainage.' 
        : 'Light precipitation may improve soil moisture.';
    } else if (weatherType === 'cloudy') {
      forecastSummary = temperature > 25 
        ? 'Warm and cloudy conditions expected.' 
        : 'Moderate temperatures with cloud cover.';
    } else {
      forecastSummary = temperature > 28 
        ? 'Hot and sunny. Monitor soil moisture levels.' 
        : 'Clear skies and favorable growing conditions.';
    }
    
    return {
      temperature: temperature.toFixed(1),
      precipitation: precipitation.toFixed(1),
      humidity: Math.round(humidity),
      windSpeed: Math.round(5 + Math.random() * 15),
      cloudCover: Math.round(cloudCover),
      currentWeather: weatherType,
      forecastSummary,
      timestamp: new Date().toISOString()
    };
  };
  
  // Mock soil data
  const getMockSoilData = (lat, lon) => {
    return {
      moisture: Math.round(35 + Math.random() * 30),
      type: ['Clay', 'Silt', 'Loam', 'Sandy Loam'][Math.floor(Math.random() * 4)],
      phLevel: (6 + Math.random() * 1.5).toFixed(1),
      organicMatter: (2 + Math.random() * 3).toFixed(1)
    };
  };
  
  // Mock product effectiveness data
  const getMockProductEffectiveness = (productType, cropType) => {
    let baseEffectiveness = 0;
    
    // Different base effectiveness depending on product type
    switch (productType) {
      case 'stress-buster':
        baseEffectiveness = 70 + Math.random() * 20;
        break;
      case 'yield-booster':
        baseEffectiveness = 75 + Math.random() * 15;
        break;
      case 'nutrient-plus':
        baseEffectiveness = 65 + Math.random() * 25;
        break;
      default:
        baseEffectiveness = 60 + Math.random() * 30;
    }
    
    // Adjust based on crop type
    if (cropType === 'corn' && productType === 'yield-booster') {
      baseEffectiveness += 10;
    } else if (cropType === 'wheat' && productType === 'nutrient-plus') {
      baseEffectiveness += 8;
    } else if (cropType === 'soybean' && productType === 'stress-buster') {
      baseEffectiveness += 12;
    }
    
    // Cap at 98% effectiveness
    return {
      effectiveness: Math.min(Math.round(baseEffectiveness), 98),
      recommendedDosage: `${Math.round(2 + Math.random() * 3)} l/ha`,
      expectedYieldIncrease: `${Math.round(5 + Math.random() * 15)}%`,
      costBenefitRatio: (3 + Math.random() * 7).toFixed(1)
    };
  };