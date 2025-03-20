import React, { useState } from 'react';
import '../styles/Field.css';
import Weather from './Weather';

const FieldTile = ({ type, x, y, moisture, onHover, isHovered, isEdgeTile, weather }) => {
  const getContent = () => {
    switch (type) {
      case 'corn':
        return (
          <div className="tile-content">
            <div className="crop-icon corn-icon"></div>
          </div>
        );
      case 'wheat':
        return (
          <div className="tile-content">
            <div className="crop-icon wheat-icon"></div>
          </div>
        );
      case 'soybean':
        return (
          <div className="tile-content">
            <div className="crop-icon soybean-icon"></div>
          </div>
        );
      case 'tree':
        return (
          <div className="tile-content">
            <div className="crop-icon tree-icon"></div>
          </div>
        );
      default:
        return null;
    }
  };

  // Apply weather-specific classes to tiles
  let tileClasses = `field-tile ${type} ${moisture || ''} ${isHovered ? 'hovered' : ''}`;
  
  // Add weather effect classes
  if (weather === 'rainy') tileClasses += ' rain-effect';
  if (weather === 'sunny' && moisture === 'dry') tileClasses += ' sun-effect';
  
  if (isEdgeTile) tileClasses += ' edge-tile';

  return (
    <div 
      className={tileClasses}
      style={{
        gridColumn: x + 1,
        gridRow: y + 1
      }}
      onMouseEnter={() => onHover({ x, y, type, moisture })}
      onMouseLeave={() => onHover(null)}
    >
      {getContent()}
      
      {/* Field tiles with rain puddles - only show in rainy weather and not on water tiles */}
      {weather === 'rainy' && type !== 'water' && Math.random() > 0.85 && (
        <div className="rain-puddle"></div>
      )}
      
      {/* For edge tiles, add visible soil sides based on isometric perspective */}
      {isEdgeTile && (
        <>
          {/* Bottom edge gets a front soil face */}
          {y === 11 && <div className="tile-soil-front"></div>}
          
          {/* Left edge gets a left soil face */}
          {x === 0 && <div className="tile-soil-left"></div>}
          
          {/* Bottom-left corner needs both faces to connect properly */}
          {x === 0 && y === 11 && <div className="tile-soil-corner"></div>}
        </>
      )}
    </div>
  );
};

const Field = ({ weather = 'sunny' }) => {
  const [hoveredTile, setHoveredTile] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Define field layout with rows and columns
  const fieldLayout = [
    // Field layout - 12x12 grid
    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wheat', 'wheat', 'wheat', 'wheat', 'grass'],
    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wheat', 'wheat', 'wheat', 'wheat', 'wheat', 'grass'],
    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wheat', 'wheat', 'wheat', 'wheat', 'wheat', 'grass'],
    ['grass', 'tree', 'tree', 'grass', 'grass', 'grass', 'wheat', 'wheat', 'wheat', 'wheat', 'wheat', 'grass'],
    ['grass', 'tree', 'tree', 'tree', 'grass', 'water', 'water', 'grass', 'grass', 'grass', 'grass', 'grass'],
    ['grass', 'grass', 'grass', 'grass', 'grass', 'water', 'water', 'grass', 'grass', 'soybean', 'soybean', 'grass'],
    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'soybean', 'soybean', 'soybean', 'grass'],
    ['grass', 'corn', 'corn', 'corn', 'corn', 'grass', 'grass', 'grass', 'soybean', 'soybean', 'soybean', 'grass'],
    ['grass', 'corn', 'corn', 'corn', 'corn', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
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

  // Check if a tile is on the edge of the field
  const isEdgeTile = (x, y) => {
    // For our isometric view, we only care about left and bottom edges
    return x === 0 || y === 11;
  };

  // Render specific weather effects directly on the field
  const renderFieldWeatherEffects = () => {
    switch(weather) {
      case 'rainy':
        return (
          <div className="field-weather rainy-field">
            {/* Field-level rain */}
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={`field-rain-${i}`} 
                className="field-raindrop" 
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1.5}s`
                }}
              />
            ))}
          </div>
        );
      case 'sunny':
        return (
          <div className="field-weather sunny-field">
            {/* Heat shimmer effect */}
            <div className="heat-shimmer"></div>
            
            {/* Light rays */}
            <div className="light-ray ray1"></div>
            <div className="light-ray ray2"></div>
          </div>
        );
      case 'cloudy':
        return (
          <div className="field-weather cloudy-field">
            {/* Cloud shadows moving across the field */}
            <div className="cloud-shadow shadow1"></div>
            <div className="cloud-shadow shadow2"></div>
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
    <div className={`field-container ${weather}-weather`}>
      {/* Weather component provides the environment */}
      <Weather type={weather} />
      
      {/* Isometric field sits on top of the landscape */}
      <div className="isometric-field">
        {/* Weather effects specific to the field */}
        {renderFieldWeatherEffects()}
        
        {/* Field grid */}
        <div className="field-grid">
          {fieldLayout.map((row, y) => (
            row.map((tileType, x) => (
              <FieldTile 
                key={`tile-${x}-${y}`}
                type={tileType}
                x={x}
                y={y}
                moisture={moistureMap[y][x]}
                onHover={handleTileHover}
                isHovered={hoveredTile && hoveredTile.x === x && hoveredTile.y === y}
                isEdgeTile={isEdgeTile(x, y)}
                weather={weather}
              />
            ))
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