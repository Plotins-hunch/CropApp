// Weather API service for fetching real-time weather data

// Toggle to use fake data instead of real API calls (for testing)
const USE_FAKE_DATA = true;

// API keys and endpoints
const API_KEY = 'd4f087c7-7efc-41b4-9292-0f22b6199215'; // Example key from the docs
const API_ENDPOINT = 'https://services.cehub.syngenta-ais.com/api/Forecast/ShortRangeForecastHourly';

/**
 * Get current weather for a location
 * @param {Object} coords - { lat, lng } or null for default location
 * @returns {Promise<Object>} Weather data including type (sunny, cloudy, rainy)
 */
export const getCurrentWeather = async (coords = null) => {
  if (USE_FAKE_DATA) {
    return getFakeWeather();
  }
  
  try {
    // Default coordinates if none provided
    const latitude = coords?.lat || 47.558399;
    const longitude = coords?.lng || 7.57327;
    
    // Current date for the request
    const today = new Date().toISOString().split('T')[0];
    
    // Build the URL with query parameters
    const url = new URL(API_ENDPOINT);
    url.searchParams.append('latitude', latitude);
    url.searchParams.append('longitude', longitude);
    url.searchParams.append('startDate', today);
    url.searchParams.append('endDate', today);
    url.searchParams.append('supplier', 'Meteoblue');
    url.searchParams.append('measureLabel', 'TempAir_Hourly (C);CloudCover_Hourly (pct);Precip_HourlySum (mm)');
    url.searchParams.append('format', 'json');
    url.searchParams.append('ApiKey', API_KEY);
    
    // Make the API request
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the response to determine weather type
    return processWeatherData(data);
    
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Fallback to fake data on error
    return getFakeWeather();
  }
};

/**
 * Process weather data from the API response
 * @param {Object} data - API response data
 * @returns {Object} Simplified weather object with type
 */
const processWeatherData = (data) => {
  // Extract relevant weather information
  // This would need to be adjusted based on the actual API response structure
  try {
    if (!data || !data.results || data.results.length === 0) {
      throw new Error('Invalid weather data response');
    }
    
    // Get the first hourly record
    const currentWeather = data.results[0];
    
    // Extract temperature, cloud cover, and precipitation
    const temperature = findMeasure(currentWeather.measures, 'TempAir_Hourly');
    const cloudCover = findMeasure(currentWeather.measures, 'CloudCover_Hourly');
    const precipitation = findMeasure(currentWeather.measures, 'Precip_HourlySum');
    
    // Determine weather type based on conditions
    let weatherType = 'sunny';
    
    if (precipitation > 0) {
      weatherType = 'rainy';
    } else if (cloudCover > 50) {
      weatherType = 'cloudy';
    }
    
    return {
      type: weatherType,
      temperature: temperature,
      cloudCover: cloudCover,
      precipitation: precipitation,
      timestamp: currentWeather.timestamp
    };
  } catch (error) {
    console.error('Error processing weather data:', error);
    return getFakeWeather();
  }
};

/**
 * Helper to find measure value from the API response
 * @param {Array} measures - Array of measure objects
 * @param {String} label - Measure label to find
 * @returns {Number} The measure value or 0 if not found
 */
const findMeasure = (measures, label) => {
  if (!measures || !Array.isArray(measures)) return 0;
  
  const measure = measures.find(m => m.label.startsWith(label));
  return measure ? parseFloat(measure.value) : 0;
};

/**
 * Generate fake weather data for testing
 * @returns {Object} Fake weather data
 */
const getFakeWeather = () => {
  const weatherTypes = ['sunny', 'cloudy', 'rainy'];
  const randomIndex = Math.floor(Math.random() * weatherTypes.length);
  
  return {
    type: weatherTypes[randomIndex],
    temperature: Math.round(15 + Math.random() * 15), // 15-30°C
    cloudCover: weatherTypes[randomIndex] === 'sunny' ? 
                Math.round(Math.random() * 20) : 
                Math.round(50 + Math.random() * 50),
    precipitation: weatherTypes[randomIndex] === 'rainy' ?
                  Math.round(Math.random() * 10 * 10) / 10 : 0,
    timestamp: new Date().toISOString()
  };
};