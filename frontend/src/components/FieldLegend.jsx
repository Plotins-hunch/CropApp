import React from 'react';
import '../styles/FieldLegend.css';

const FieldLegend = () => {
  return (
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
          <div className="legend-label">Well-watered</div>
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
  );
};

export default FieldLegend;