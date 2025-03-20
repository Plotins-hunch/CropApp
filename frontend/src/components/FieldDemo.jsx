import React, { useState } from 'react';
import Field from './Field';
import { SunIcon, CloudIcon, CloudRainIcon } from 'lucide-react';

const FieldDemo = () => {
  const [weather, setWeather] = useState('sunny');
  const [showComparison, setShowComparison] = useState(false);
  
  return (
    <div className="field-demo-container">
      <div className="demo-header stardew-panel">
        <h1>Your Farm Visualizer</h1>
        <p>See how your field looks under different conditions and how our biological products can help!</p>
      </div>
      
      <div className="demo-controls stardew-panel">
        <div className="control-group">
          <h3>Weather Conditions</h3>
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
        .field-demo-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
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
      `}</style>
    </div>
  );
};

export default FieldDemo;