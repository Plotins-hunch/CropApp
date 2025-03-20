import React, { useState, useEffect } from 'react';
import Field from './Field';
import { SunIcon, CloudIcon, CloudRainIcon } from 'lucide-react';
import { getCurrentWeather } from '../services/weatherApi';

const FieldDemo = () => {
  const [weather, setWeather] = useState('sunny');
  const [showComparison, setShowComparison] = useState(false);
  const [useApiWeather, setUseApiWeather] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  
  // Fetch weather from API when enabled
  useEffect(() => {
    if (!useApiWeather) return;
    
    const fetchWeather = async () => {
      try {
        const data = await getCurrentWeather();
        
        if (data && data.type) {
          setWeather(data.type);
          setWeatherData(data);
          console.log('Weather updated from API:', data);
        }
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      }
    };
    
    // Fetch weather initially
    fetchWeather();
    
    // Set up interval to refresh weather every 10 minutes
    const intervalId = setInterval(fetchWeather, 600000);
    
    // Clean up interval on component unmount or when API weather is disabled
    return () => clearInterval(intervalId);
  }, [useApiWeather]);
  
  return (
    <div className="field-demo-container">
      <div className="demo-header stardew-panel">
        <h1>Your Farm Visualizer</h1>
        <p>See how your field looks under different conditions and how our biological products can help!</p>
      </div>
      
      <div className="demo-controls stardew-panel">
        <div className="control-group">
          <h3>Weather Control</h3>
          <div className="api-weather-toggle">
            <span>Manual</span>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={useApiWeather} 
                onChange={() => setUseApiWeather(!useApiWeather)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span>API Weather</span>
          </div>
          
          {!useApiWeather && (
            <div className="weather-buttons">
              <button 
                className={`stardew-button ${weather === 'sunny' ? 'active' : ''}`} 
                onClick={() => setWeather('sunny')}
              >
                <SunIcon size={16} /> Sunny
              </button>
              <button 
                className={`stardew-button ${weather === 'cloudy' ? 'active' : ''}`} 
                onClick={() => setWeather('cloudy')}
              >
                <CloudIcon size={16} /> Cloudy
              </button>
              <button 
                className={`stardew-button ${weather === 'rainy' ? 'active' : ''}`} 
                onClick={() => setWeather('rainy')}
              >
                <CloudRainIcon size={16} /> Rainy
              </button>
            </div>
          )}
          
          {useApiWeather && weatherData && (
            <div className="current-weather-display">
              <div className="current-weather-icon">
                {weather === 'sunny' && <SunIcon size={24} />}
                {weather === 'cloudy' && <CloudIcon size={24} />}
                {weather === 'rainy' && <CloudRainIcon size={24} />}
              </div>
              <div className="current-weather-text">
                <p>Current: {weather.charAt(0).toUpperCase() + weather.slice(1)}</p>
                {weatherData.temperature && (
                  <p>{weatherData.temperature}°C</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="control-group">
          <h3>See the Difference</h3>
          <div className="comparison-toggle">
            <span>Without Treatment</span>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={showComparison} 
                onChange={() => setShowComparison(!showComparison)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span>With Biological Products</span>
          </div>
        </div>
      </div>
      
      <div className="field-visualization">
        {showComparison ? (
          <div className="comparison-view">
            <div className="comparison-half">
              <h3 className="comparison-label">Without Treatment</h3>
              <Field weather={weather} withTreatment={false} />
            </div>
            <div className="comparison-half">
              <h3 className="comparison-label">With Biological Products</h3>
              <Field weather={weather} withTreatment={true} />
            </div>
          </div>
        ) : (
          <Field weather={weather} />
        )}
      </div>
      
      <div className="field-legend stardew-panel">
        <h2>Field Legend</h2>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color grass"></div>
            <div className="legend-label">Healthy Grass</div>
          </div>
          <div className="legend-item">
            <div className="legend-color water"></div>
            <div className="legend-label">Water Source</div>
          </div>
          <div className="legend-item">
            <div className="legend-color moisture-dry"></div>
            <div className="legend-label">Dry Soil</div>
          </div>
          <div className="legend-item">
            <div className="legend-color moisture-wet"></div>
            <div className="legend-label">Well-watered Soil</div>
          </div>
          <div className="legend-item">
            <div className="legend-color corn-color"></div>
            <div className="legend-label">Corn</div>
          </div>
          <div className="legend-item">
            <div className="legend-color wheat-color"></div>
            <div className="legend-label">Wheat</div>
          </div>
          <div className="legend-item">
            <div className="legend-color soybean-color"></div>
            <div className="legend-label">Soybean</div>
          </div>
        </div>
      </div>
      
      <div className="field-insights stardew-panel">
        <h2>Current Field Insights</h2>
        <p>
          {weather === 'sunny' && "Hot and dry conditions may stress your crops, especially in the dry soil areas. Our Stress Buster biological product can help plants tolerate heat stress and preserve yields."}
          {weather === 'cloudy' && "Moderate conditions are good for growth, but some areas could benefit from improved nutrient uptake. Our Nutrient Booster product can optimize plant nutrition even in cloudy conditions."}
          {weather === 'rainy' && "Excess moisture can affect nutrient availability. Our Yield Booster product helps maximize productivity in various weather conditions and ensures efficient nutrient use."}
        </p>
        <button className="stardew-button product-recommendation">
          Get Product Recommendations
        </button>
      </div>
      
      <style jsx>{`
        /* Main container */
        .field-demo-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        /* Header styling */
        .demo-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .demo-header h1 {
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .demo-header p {
          font-family: 'VT323', monospace;
          font-size: 18px;
        }
        
        /* Controls panel */
        .demo-controls {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          padding: 16px;
        }
        
        .control-group {
          display: flex;
          flex-direction: column;
        }
        
        .control-group h3 {
          font-size: 14px;
          margin-bottom: 10px;
        }
        
        /* Weather API toggle */
        .api-weather-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          font-family: 'VT323', monospace;
          font-size: 16px;
        }
        
        /* Current weather display */
        .current-weather-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
          padding: 8px;
          background-color: rgba(255, 250, 205, 0.1);
          border-radius: 4px;
          border: 1px solid rgba(255, 250, 205, 0.3);
        }
        
        .current-weather-icon {
          color: var(--stardew-cream);
          display: flex;
          align-items: center;
        }
        
        .current-weather-text {
          font-family: 'VT323', monospace;
          font-size: 16px;
          color: var(--stardew-cream);
        }
        
        .current-weather-text p {
          margin: 0;
          line-height: 1.2;
        }
        
        /* Weather button styling */
        .weather-buttons {
          display: flex;
          gap: 10px;
        }
        
        .stardew-button {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .stardew-button.active {
          background-color: #3D7D27;
        }
        
        /* Comparison toggle */
        .comparison-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'VT323', monospace;
          font-size: 16px;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 30px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #5c4425;
          transition: .4s;
          border-radius: 30px;
          border: 2px solid #6e4a1f;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 4px;
          bottom: 2px;
          background-color: #fffacd;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: #3D7D27;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(30px);
        }
        
        /* Field visualization */
        .field-visualization {
          margin-bottom: 20px;
          min-height: 600px;
        }
        
        .comparison-view {
          display: flex;
          gap: 20px;
        }
        
        .comparison-half {
          flex: 1;
          position: relative;
        }
        
        .comparison-label {
          position: absolute;
          top: -30px;
          left: 0;
          right: 0;
          text-align: center;
          font-family: 'Press Start 2P', cursive;
          font-size: 12px;
          color: #fffacd;
          text-shadow: 2px 2px 0 #3D7D27;
          z-index: 10;
        }
        
        /* Legend styling */
        .field-legend {
          margin-bottom: 20px;
        }
        
        .field-legend h2 {
          font-size: 16px;
          text-align: center;
          margin-bottom: 15px;
        }
        
        .legend-items {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .legend-color {
          width: 24px;
          height: 24px;
          border: 2px solid #6e4a1f;
        }
        
        .legend-color.grass {
          background-color: #58A63C;
        }
        
        .legend-color.water {
          background-color: #5dbcd2;
        }
        
        .legend-color.moisture-dry {
          background-color: #d4b483;
        }
        
        .legend-color.moisture-wet {
          background-color: #58A63C;
          background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h6v6H0zm12 0h6v6h-6zM0 12h6v6H0zm12 12h6v6h-6z' fill='%233e97ae' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
        
        .legend-color.corn-color {
          background-color: #a9db7a;
        }
        
        .legend-color.wheat-color {
          background-color: #f9dc5c;
        }
        
        .legend-color.soybean-color {
          background-color: #a9db7a;
          background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='2' fill='%2358A63C'/%3E%3C/svg%3E");
        }
        
        .legend-label {
          font-family: 'VT323', monospace;
          font-size: 16px;
        }
        
        /* Insights panel */
        .field-insights {
          margin-bottom: 20px;
        }
        
        .field-insights h2 {
          font-size: 16px;
          text-align: center;
          margin-bottom: 15px;
        }
        
        .field-insights p {
          font-family: 'VT323', monospace;
          font-size: 18px;
          line-height: 1.4;
          margin-bottom: 15px;
        }
        
        .product-recommendation {
          display: block;
          margin: 0 auto;
          font-size: 14px;
          padding: 10px 20px;
        }
        
        /* Media query for responsive design */
        @media (max-width: 768px) {
          .demo-controls {
            flex-direction: column;
            gap: 15px;
          }
          
          .comparison-view {
            flex-direction: column;
          }
          
          .comparison-half {
            margin-bottom: 40px;
          }
        }
      `}</style>
    </div>
  );
};

export default FieldDemo;