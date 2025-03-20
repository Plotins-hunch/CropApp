import React from 'react';
import '../styles/StardewBackground.css';

const StardewBackground = ({ weather = 'sunny' }) => {
  return (
    <div className={`stardew-background ${weather}`}>
      {/* Sky layer */}
      <div className="stardew-sky"></div>
      
      {/* Clouds layer */}
      <div className="stardew-clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
        <div className="cloud cloud-4"></div>
      </div>
      
      {/* Mountains layer */}
      <div className="stardew-mountains">
        <div className="mountain-range"></div>
      </div>
      
      {/* Fence layer */}
      <div className="stardew-fence">
        <div className="fence-row"></div>
      </div>
      
      {/* Ground layer */}
      <div className="stardew-ground"></div>
      
      {/* Weather effects */}
      {weather === 'rainy' && (
        <div className="rain-effect">
          {Array.from({ length: 100 }).map((_, i) => (
            <div 
              key={`rain-${i}`} 
              className="raindrop"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${0.6 + Math.random() * 0.4}s`
              }}
            ></div>
          ))}
        </div>
      )}
      
      {weather === 'cloudy' && (
        <div className="cloud-overlay"></div>
      )}
    </div>
  );
};

export default StardewBackground;