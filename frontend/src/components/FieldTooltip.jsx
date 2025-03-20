// Update for src/components/FieldTooltip.jsx
// Fix tooltip positioning issues

import React, { useState, useEffect } from 'react';
import '../styles/Tooltip.css';

const FieldTooltip = ({ tile, position, isIsometric = false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tile) return;
    
    // Simulate fetching data - in real implementation this would be an API call
    const fetchData = async () => {
      setLoading(true);
      
      // Simple timeout to simulate API call
      setTimeout(() => {
        // Generate simple data based on tile type
        let tileData = {};
        
        if (tile.type === 'corn' || tile.type === 'wheat' || tile.type === 'soybean') {
          tileData = {
            growthStage: ['Early', 'Mid', 'Late'][Math.floor(Math.random() * 3)],
            daysToHarvest: Math.floor(Math.random() * 30) + 5,
            diseaseRisk: Math.floor(Math.random() * 100),
            diseases: ['Leaf Blight', 'Stem Rust', 'Root Rot'],
            health: tile.moisture === 'dry' ? 'Stressed' : 'Healthy'
          };
        } else if (tile.type === 'water') {
          tileData = {
            type: 'water',
            quality: 'Good',
            usefulness: 'Suitable for irrigation'
          };
        } else if (tile.type === 'tree') {
          tileData = {
            type: 'tree',
            benefits: ['Provides shade', 'Prevents soil erosion']
          };
        } else if (tile.type === 'grass') {
          tileData = {
            moisture: tile.moisture || 'Normal',
            health: 'Good'
          };
        }
        
        setData(tileData);
        setLoading(false);
      }, 200);
    };

    fetchData();
    
    // Cleanup
    return () => {
      setData(null);
      setLoading(true);
    };
  }, [tile]);

  if (!tile || !position) return null;
  
  // Calculate tooltip position with adjusted offsets for isometric view
  const tooltipStyle = {
    position: 'absolute',
    zIndex: 1000,
    maxWidth: '250px',
  };

  // Position tooltip near the mouse cursor
  tooltipStyle.left = `${position.x + 20}px`; // Offset slightly right of cursor
  tooltipStyle.top = `${position.y - 10}px`;  // Offset slightly above cursor
  
  // Ensure tooltip stays within viewport
  if (position.x > window.innerWidth - 270) { // If close to right edge
    tooltipStyle.left = `${position.x - 270}px`; // Position left of cursor
  }
  
  // Show loading state
  if (loading) {
    return (
      <div className="stardew-tooltip" style={tooltipStyle}>
        <div className="tooltip-loading">Loading...</div>
      </div>
    );
  }
  
  // Render different content based on tile type
  const renderContent = () => {
    if (!data) return <div>No data available</div>;
    
    switch(tile.type) {
      case 'corn':
      case 'wheat':
      case 'soybean':
        return (
          <>
            <h3 className="tooltip-title">{tile.type.charAt(0).toUpperCase() + tile.type.slice(1)}</h3>
            <div className="tooltip-row">
              <span className="tooltip-label">Growth:</span>
              <span className="tooltip-value">{data.growthStage}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Harvest in:</span>
              <span className="tooltip-value">{data.daysToHarvest} days</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Disease Risk:</span>
              <span className={`tooltip-value risk-level-${getRiskLevel(data.diseaseRisk)}`}>
                {getRiskText(data.diseaseRisk)}
              </span>
            </div>
            {data.diseaseRisk > 50 && data.diseases && data.diseases.length > 0 && (
              <div className="tooltip-warning">
                <span>⚠️ Risk of {data.diseases[0]}</span>
              </div>
            )}
            {tile.moisture === 'dry' && (
              <div className="tooltip-warning">
                <span>⚠️ Needs water soon!</span>
              </div>
            )}
          </>
        );
        
      case 'grass':
        return (
          <>
            <h3 className="tooltip-title">Field Grass</h3>
            <div className="tooltip-row">
              <span className="tooltip-label">Moisture:</span>
              <span className="tooltip-value">
                {tile.moisture === 'dry' ? 'Low' : 
                 tile.moisture === 'wet' ? 'High' : 'Normal'}
              </span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Health:</span>
              <span className="tooltip-value">{data.health || 'Normal'}</span>
            </div>
            {tile.moisture === 'dry' && (
              <div className="tooltip-warning">
                <span>⚠️ Soil is drying out</span>
              </div>
            )}
          </>
        );
        
      case 'water':
        return (
          <>
            <h3 className="tooltip-title">Water Source</h3>
            <div className="tooltip-row">
              <span className="tooltip-label">Quality:</span>
              <span className="tooltip-value">{data.quality}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Usage:</span>
              <span className="tooltip-value">{data.usefulness}</span>
            </div>
          </>
        );
        
      case 'tree':
        return (
          <>
            <h3 className="tooltip-title">Tree</h3>
            <div className="tooltip-section">
              <h4>Benefits</h4>
              <ul className="tooltip-list">
                {data.benefits && data.benefits.map((benefit, index) => (
                  <li key={index} className="tooltip-list-item">{benefit}</li>
                ))}
              </ul>
            </div>
          </>
        );
        
      default:
        return (
          <>
            <h3 className="tooltip-title">Field Information</h3>
            <div className="tooltip-row">
              <span className="tooltip-label">Type:</span>
              <span className="tooltip-value">{tile.type}</span>
            </div>
            {tile.moisture && (
              <div className="tooltip-row">
                <span className="tooltip-label">Moisture:</span>
                <span className="tooltip-value">{tile.moisture}</span>
              </div>
            )}
          </>
        );
    }
  };
  
  return (
    <div className="stardew-tooltip" style={tooltipStyle}>
      {renderContent()}
    </div>
  );
};

// Helper functions to determine risk levels
const getRiskLevel = (risk) => {
  if (risk < 30) return 'low';
  if (risk < 60) return 'medium';
  return 'high';
};

const getRiskText = (risk) => {
  if (risk < 30) return 'Low';
  if (risk < 60) return 'Medium';
  return 'High';
};

export default FieldTooltip;