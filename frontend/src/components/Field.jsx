import React, { useState } from 'react';
import '../styles/Field.css';
import { SunIcon, CloudIcon, CloudRainIcon } from 'lucide-react';

const FieldTile = ({ type, x, y, moisture, onHover, isHovered }) => {
  const getContent = () => {
    switch (type) {
      case 'corn':
        return <div className="crop corn"></div>;
      case 'wheat':
        return <div className="crop wheat"></div>;
      case 'soybean':
        return <div className="crop soybean"></div>;
      case 'tree':
        return <div className="crop tree"></div>;
      default:
        return null;
    }
  };

  const getMoistureClass = () => {
    if (moisture === 'dry') return 'moisture-dry';
    if (moisture === 'wet') return 'moisture-wet';
    return '';
  };

  return (
    <div 
      className={`field-tile ${type} ${getMoistureClass()} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => onHover({ x, y, type, moisture })}
      onMouseLeave={() => onHover(null)}
    >
      {getContent()}
    </div>
  );
};

const Field = ({ weather = 'sunny' }) => {
  const [hoveredTile, setHoveredTile] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Define field layout with rows and columns
  const fieldLayout = [
    // Field layout - 10x12 grid
    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wheat', 'wheat', 'wheat', 'wheat', 'grass'],
    ['grass', 'grass', 'grass', 'tree', 'grass', 'grass', 'wheat', 'wheat', 'wheat', 'wheat', 'wheat', 'grass'],
    ['grass', 'grass', 'tree', 'tree', 'grass', 'grass', 'wheat', 'wheat', 'wheat', 'wheat', 'grass', 'grass'],
    ['grass', 'tree', 'tree', 'grass', 'grass', 'grass', 'grass', 'wheat', 'wheat', 'grass', 'grass', 'grass'],
    ['grass', 'grass', 'grass', 'grass', 'water', 'water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
    ['grass', 'grass', 'grass', 'grass', 'water', 'water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
    ['grass', 'corn', 'corn', 'corn', 'corn', 'grass', 'grass', 'grass', 'grass', 'soybean', 'soybean', 'grass'],
    ['grass', 'corn', 'corn', 'corn', 'corn', 'grass', 'grass', 'grass', 'soybean', 'soybean', 'soybean', 'grass'],
    ['grass', 'corn', 'corn', 'corn', 'grass', 'grass', 'grass', 'grass', 'soybean', 'soybean', 'soybean', 'grass'],
    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
  ];

  // Soil moisture map
  const moistureMap = [
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', 'wet', 'wet', '', '', '', '', ''],
    ['', '', '', 'wet', 'wet', 'wet', 'wet', '', '', '', '', ''],
    ['', '', '', '', 'wet', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', 'dry', 'dry', ''],
    ['', '', '', '', '', '', '', 'dry', 'dry', 'dry', 'dry', ''],
    ['', 'dry', 'dry', '', '', '', '', 'dry', 'dry', 'dry', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
  ];

  const handleTileHover = (tileInfo) => {
    setHoveredTile(tileInfo);
    setShowTooltip(!!tileInfo);
  };

  const renderWeatherEffects = () => {
    switch(weather) {
      case 'rainy':
        return (
          <div className="weather-effects rain">
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={i} 
                className="raindrop" 
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.5 + Math.random() * 1}s`
                }}
              />
            ))}
          </div>
        );
      case 'cloudy':
        return (
          <div className="weather-effects clouds">
            <div className="cloud" style={{ left: '10%', top: '20%' }}><CloudIcon size={48} /></div>
            <div className="cloud" style={{ left: '40%', top: '10%' }}><CloudIcon size={64} /></div>
            <div className="cloud" style={{ left: '70%', top: '15%' }}><CloudIcon size={56} /></div>
          </div>
        );
      case 'sunny':
        return (
          <div className="weather-effects sunny">
            <div className="sun"><SunIcon size={64} /></div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderTooltip = () => {
    if (!showTooltip || !hoveredTile) return null;

    let content = '';
    const { type, moisture } = hoveredTile;

    switch(type) {
      case 'corn':
        content = `Corn: ${moisture === 'dry' ? 'Needs water!' : 'Growing well'} - Harvest in 14 days`;
        break;
      case 'wheat':
        content = `Wheat: ${moisture === 'dry' ? 'Needs water!' : 'Growing well'} - Harvest in 8 days`;
        break;
      case 'soybean':
        content = `Soybean: ${moisture === 'dry' ? 'Needs water!' : 'Growing well'} - Harvest in 21 days`;
        break;
      case 'water':
        content = 'Water: Good for irrigation';
        break;
      case 'tree':
        content = 'Tree: Provides shade and helps maintain soil moisture';
        break;
      default:
        content = moisture === 'dry' ? 'Dry soil: Needs watering soon!' : 
                 moisture === 'wet' ? 'Well-watered soil' : 'Field grass';
    }

    // Position tooltip based on hover position
    const tooltipStyle = {
      top: '70%',
      left: '50%',
      transform: 'translateX(-50%)'
    };

    return (
      <div className="field-tooltip" style={tooltipStyle}>
        {content}
      </div>
    );
  };

  return (
    <div className="field-container">
      {/* Sky background */}
      <div className={`sky ${weather}`}></div>
      
      {/* Weather effects */}
      {renderWeatherEffects()}
      
      {/* Field layout */}
      <div className="field-perspective">
        <div className="field-grid">
          {fieldLayout.map((row, y) => (
            <div key={`row-${y}`} className="field-row">
              {row.map((tileType, x) => (
                <FieldTile 
                  key={`tile-${x}-${y}`}
                  type={tileType}
                  x={x}
                  y={y}
                  moisture={moistureMap[y][x]}
                  onHover={handleTileHover}
                  isHovered={hoveredTile && hoveredTile.x === x && hoveredTile.y === y}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Field tooltip */}
      {renderTooltip()}
      
      {/* Field info panel */}
      <div className="field-info-panel">
        <h2>Your Field Status</h2>
        <div className="status-item">
          <span className="status-label">Weather:</span>
          <span className="status-value">{weather}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Soil Moisture:</span>
          <span className="status-value">Medium</span>
        </div>
        <div className="status-item">
          <span className="status-label">Risk:</span>
          <span className={`status-value ${weather === 'sunny' ? 'warning' : ''}`}>
            {weather === 'sunny' ? 'Drought' : 'Low'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Field;