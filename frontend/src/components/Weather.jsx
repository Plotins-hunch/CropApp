import React, { useEffect, useState } from 'react';
import { SunIcon, CloudIcon, CloudRainIcon } from 'lucide-react';
import '../styles/Weather.css';

const Weather = ({ type = 'sunny' }) => {
  const [cloudPositions, setCloudPositions] = useState([]);
  
  // Generate initial cloud positions
  useEffect(() => {
    const cloudCount = type === 'rainy' ? 8 : 12;
    const newPositions = Array.from({ length: cloudCount }).map(() => ({
      size: 30 + Math.random() * 50,
      speed: 80 + Math.random() * 120,
      left: Math.random() * 100, // Initial position across the screen
      top: 5 + Math.random() * 20,
      opacity: 0.7 + Math.random() * 0.3,
    }));
    setCloudPositions(newPositions);
  }, [type]);

  const renderSky = () => {
    return <div className={`sky-background sky-${type}`}></div>;
  };

  const renderClouds = () => {
    if (type !== 'cloudy' && type !== 'rainy') return null;
    
    return (
      <div className="clouds-container">
        {/* Background clouds */}
        {cloudPositions.map((cloud, i) => (
          <div 
            key={`bg-cloud-${i}`}
            className="bg-cloud"
            style={{
              width: `${cloud.size}px`,
              height: `${cloud.size/2}px`,
              animationDuration: `${cloud.speed}s`,
              left: `${cloud.left}%`,
              top: `${cloud.top}%`,
              opacity: cloud.opacity
            }}
          ></div>
        ))}
        
        {/* Foreground cloud icons */}
        {type === 'rainy' ? (
          <div className="foreground-clouds rainy">
            <div className="cloud-icon" style={{ top: '15%', left: '20%' }}>
              <CloudRainIcon size={48} color="#e0e0e0" />
            </div>
            <div className="cloud-icon" style={{ top: '8%', left: '60%' }}>
              <CloudRainIcon size={64} color="#e0e0e0" />
            </div>
            <div className="cloud-icon" style={{ top: '20%', left: '80%' }}>
              <CloudRainIcon size={42} color="#e0e0e0" />
            </div>
          </div>
        ) : (
          <div className="foreground-clouds">
            <div className="cloud-icon moving-cloud" style={{ top: '18%', left: '15%', animationDuration: '120s' }}>
              <CloudIcon size={48} color="#ffffff" />
            </div>
            <div className="cloud-icon moving-cloud" style={{ top: '10%', left: '45%', animationDuration: '100s' }}>
              <CloudIcon size={64} color="#ffffff" />
            </div>
            <div className="cloud-icon moving-cloud" style={{ top: '15%', left: '75%', animationDuration: '110s' }}>
              <CloudIcon size={56} color="#ffffff" />
            </div>
            <div className="cloud-icon moving-cloud" style={{ top: '22%', left: '90%', animationDuration: '90s' }}>
              <CloudIcon size={40} color="#ffffff" />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSun = () => {
    if (type !== 'sunny') return null;
    
    return (
      <div className="sun-container">
        <div className="sun-glow"></div>
        <div className="sun-icon">
          <SunIcon size={64} color="#ffdc5c" />
        </div>
      </div>
    );
  };

  const renderRain = () => {
    if (type !== 'rainy') return null;
    
    // Create multiple rain layers for more depth
    return (
      <div className="rain-container">
        <div className="rain-layer front-rain">
          {Array.from({ length: 60 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 2;
            const duration = 0.6 + Math.random() * 0.4;
            
            return (
              <div 
                key={`raindrop-front-${i}`} 
                className="raindrop"
                style={{
                  left: `${left}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  opacity: 0.7 + Math.random() * 0.3
                }}
              ></div>
            );
          })}
        </div>
        
        <div className="rain-layer back-rain">
          {Array.from({ length: 40 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 2;
            const duration = 0.8 + Math.random() * 0.5;
            
            return (
              <div 
                key={`raindrop-back-${i}`} 
                className="raindrop"
                style={{
                  left: `${left}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  opacity: 0.4 + Math.random() * 0.3
                }}
              ></div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLandscape = () => {
    return (
      <div className="landscape">
        {/* Far background mountains */}
        <div className="far-mountains">
          <div className="mountain mountain-1"></div>
          <div className="mountain mountain-2"></div>
          <div className="mountain mountain-3"></div>
        </div>
        
        {/* Mid-distance hills */}
        <div className="near-hills">
          <div className="hill hill-1"></div>
          <div className="hill hill-2"></div>
          <div className="hill hill-3"></div>
        </div>
        
        {/* Meadow/field where farm sits */}
        <div className="ground-plane"></div>
      </div>
    );
  };

  return (
    <div className={`weather-environment weather-${type}`}>
      {renderSky()}
      {renderLandscape()}
      {renderSun()}
      {renderClouds()}
      {renderRain()}
    </div>
  );
};

export default Weather;