import React, { useState, useEffect } from 'react';
import '../styles/Field.css';
import Weather from './Weather';
import FieldTooltip from './FieldTooltip';
import FarmerAdvisor from './FarmerAdvisor';
import { useTime } from '../context/TimeContext';

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
      onMouseEnter={(e) => {
        onHover(
          { x, y, type, moisture }, 
          { 
            x: e.clientX,
            y: e.clientY
          }
        );
      }}
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

const Field = ({ weather = 'sunny', withTreatment = false }) => {
  const [hoveredTile, setHoveredTile] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  
  // Use time context
  const { currentYear, timePeriod, getWeatherData, getSoilData } = useTime();
  
  // Get current weather and soil data based on year
  const yearWeather = getWeatherData(currentYear);
  const soilData = getSoilData(currentYear);
  
  // Use prop weather if provided, otherwise use from year data
  const displayWeather = weather || yearWeather.type;
  
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
    
    // Adjust moisture map based on year
    if (currentYear < 2020) {
      // Past: More wet areas (wetter climate in the past)
      return baseMoistureMap.map(row => 
        row.map(cell => cell === 'dry' ? '' : cell)
      );
    } else if (currentYear > 2027) {
      // Far future: More dry areas (climate change effects)
      return baseMoistureMap.map((row, y) => 
        row.map((cell, x) => {
          if (y > 6 && cell === '') return 'dry';
          return cell;
        })
      );
    } else if (currentYear > 2025) {
      // Near future: Some additional dry areas
      return baseMoistureMap.map((row, y) => 
        row.map((cell, x) => {
          if (y > 8 && x > 2 && x < 10 && cell === '') return 'dry';
          return cell;
        })
      );
    }
    
    // For rainy weather in current year, reduce dry areas
    if (displayWeather === 'rainy') {
      return baseMoistureMap.map(row => 
        row.map(cell => cell === 'dry' ? '' : cell)
      );
    }
    
    // For sunny weather in current year, increase dry areas unless treatment is applied
    if (displayWeather === 'sunny' && !withTreatment) {
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
    
    // For sunny weather with treatment in current year, improve some dry areas
    if (displayWeather === 'sunny' && withTreatment) {
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
    switch(displayWeather) {
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

  // Get soil moisture description
  const getSoilMoistureDescription = () => {
    if (displayWeather === 'rainy') {
      return withTreatment ? 'High (optimal)' : 'High';
    } else if (displayWeather === 'sunny' && !withTreatment) {
      return soilData.moisture < 50 ? 'Low (critical)' : 'Low';
    } else {
      return withTreatment ? 'Good' : 'Medium';
    }
  };
  
  // Get risk description
  const getRiskDescription = () => {
    if (displayWeather === 'sunny' && !withTreatment) {
      return "Drought";
    } else if (displayWeather === 'rainy' && !withTreatment) {
      return "Waterlogging";
    } else if (currentYear > 2027) {
      return "Climate Change";
    } else {
      return "Low";
    }
  };
  
  // Is the risk critical?
  const isRiskCritical = () => {
    return (displayWeather === 'sunny' && !withTreatment) || 
           (currentYear > 2027 && !withTreatment);
  };

  return (
    <div className={`field-container ${displayWeather}-weather`}>
      {/* Weather component provides the environment */}
      <Weather type={displayWeather} />
      
      {/* Isometric field sits on top of the landscape - centered properly and pushed down */}
      <div className="isometric-field" style={{
        position: 'absolute',
        top: '35%',
        left: '50%',
        width: '80%',
        height: '70%',
        transform: 'translateX(-50%)',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        zIndex: 5
      }}>
        {/* Weather effects specific to the field */}
        {renderFieldWeatherEffects()}
        
        {/* Field grid - centered */}
        <div className="field-grid" style={{
          width: '100%',
          height: '100%',
          margin: '0 auto'
        }}>
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
                weather={displayWeather}
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
          isIsometric={true}
          year={currentYear}
        />
      )}
      
      {/* Field info panel */}
      <div className="field-info-panel">
        <h2>Your Field Status</h2>
        <div className="status-item">
          <span className="status-label">Weather:</span>
          <span className="status-value">{displayWeather.charAt(0).toUpperCase() + displayWeather.slice(1)}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Soil Moisture:</span>
          <span className="status-value">
            {getSoilMoistureDescription()}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Risk:</span>
          <span className={`status-value ${isRiskCritical() ? 'warning' : ''}`}>
            {getRiskDescription()}
          </span>
        </div>
        {withTreatment && (
          <div className="treatment-indicator">
            <span>✓ Biological Products Applied</span>
          </div>
        )}
        
        {/* Time indicator */}
        {currentYear !== 2025 && (
          <div className="time-indicator">
            {currentYear < 2025 ? (
              <div className="historical-data-note">Historical data ({currentYear})</div>
            ) : (
              <div className="forecast-data-note">Forecast data ({currentYear})</div>
            )}
          </div>
        )}
      </div>
      
      {/* Add the FarmerAdvisor component at the bottom left */}
      <FarmerAdvisor 
        weather={displayWeather} 
        cropType={hoveredTile?.type || "corn"} 
        withTreatment={withTreatment}
        year={currentYear}
      />
    </div>
  );
};

export default Field;