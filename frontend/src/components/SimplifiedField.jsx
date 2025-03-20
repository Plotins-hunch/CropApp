import React, { useState, useEffect } from 'react';
import '../styles/Field.css';
import Weather from './Weather';
import FieldTooltip from './FieldTooltip';

const FieldTile = ({ type, x, y, moisture, onHover, isHovered, isEdgeTile, weather, withTreatment = false }) => {
  const getContent = () => {
    switch (type) {
      case 'corn':
        return (
          <div className="tile-content">
            <div className={`crop-icon corn-icon ${moisture === 'dry' && !withTreatment ? 'stressed' : ''}`}></div>
          </div>
        );
      case 'wheat':
        return (
          <div className="tile-content">
            <div className={`crop-icon wheat-icon ${moisture === 'dry' && !withTreatment ? 'stressed' : ''}`}></div>
          </div>
        );
      case 'soybean':
        return (
          <div className="tile-content">
            <div className={`crop-icon soybean-icon ${moisture === 'dry' && !withTreatment ? 'stressed' : ''}`}></div>
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
  
  // Add treatment class for visual difference when biological products are applied
  if (withTreatment) {
    tileClasses += ' with-treatment';
  }

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
      onMouseEnter={(e) => onHover({ x, y, type, moisture }, { x: e.clientX, y: e.clientY })}
      onMouseLeave={() => onHover(null, null)}
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

const SimplifiedField = ({ weather = 'sunny', withTreatment = false }) => {
  const [hoveredTile, setHoveredTile] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  
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

  // Soil moisture map - adjusts based on weather and treatment
  const getMoistureMap = () => {
    // Base moisture map
    const baseMoistureMap = [
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
    
    // For rainy weather, reduce dry areas
    if (weather === 'rainy') {
      return baseMoistureMap.map(row => 
        row.map(cell => cell === 'dry' ? '' : cell)
      );
    }
    
    // For sunny weather, increase dry areas unless treatment is applied
    if (weather === 'sunny' && !withTreatment) {
      return baseMoistureMap.map((row, y) => 
        row.map((cell, x) => {
          // Add more dry areas during sunny weather
          if (y > 7 && x > 3 && x < 10 && cell === '') {
            return 'dry';
          }
          // Make existing dry areas stay dry
          return cell;
        })
      );
    }
    
    // For sunny weather with treatment, improve some dry areas
    if (weather === 'sunny' && withTreatment) {
      return baseMoistureMap.map((row, y) => 
        row.map((cell, x) => {
          // Treatment helps some dry areas
          if ((y === 10 && (x === 1 || x === 2)) || (y === 9 && x > 7)) {
            return '';
          }
          return cell;
        })
      );
    }
    
    return baseMoistureMap;
  };
  
  // Get the current moisture map based on weather and treatment
  const moistureMap = getMoistureMap();

  // Handle tile hover with position information
  const handleTileHover = (tileInfo, position) => {
    setHoveredTile(tileInfo);
    setTooltipPosition(position);
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

  // Calculate health status based on weather and treatment
  const getFieldHealth = () => {
    if (weather === 'rainy') {
      return withTreatment ? 'Good' : 'Fair';
    } else if (weather === 'sunny') {
      return withTreatment ? 'Good' : 'Poor';
    } else {
      return withTreatment ? 'Excellent' : 'Good';
    }
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
                withTreatment={withTreatment}
              />
            ))
          ))}
        </div>
      </div>
      
      {/* Field tooltip */}
      {hoveredTile && tooltipPosition && (
        <FieldTooltip 
          tile={hoveredTile} 
          position={tooltipPosition}
          treatment={withTreatment}
        />
      )}
      
      {/* Simplified field status indicator */}
      <div className="field-status-indicator">
        <div className={`status-badge ${getFieldHealth().toLowerCase()}`}>
          {getFieldHealth()} Health
        </div>
        
        {withTreatment && (
          <div className="treatment-badge">
            Biologicals Active
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplifiedField;