import React, { useEffect, useState } from 'react';
import '../styles/FieldHealthDashboard.css';

function FieldHealthDashboard({ fieldId = 1, lat = 47.5596, lon = 7.5886 }) {
  const [soilData, setSoilData] = useState(null);
  const [nutrientsData, setNutrientsData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFieldData() {
      try {
        setLoading(true);
        // Get current date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch all data in parallel
        const [soilResponse, nutrientsResponse, healthResponse, riskResponse] = await Promise.all([
          fetch(`/api/soil-moisture/${today}/${lat}/${lon}`),
          fetch(`/api/nutrients/${fieldId}`),
          fetch(`/api/crop-health/${fieldId}`),
          fetch(`/api/risk-level/${fieldId}/${today}`)
        ]);

        // Check responses
        if (!soilResponse.ok || !nutrientsResponse.ok || !healthResponse.ok || !riskResponse.ok) {
          throw new Error('One or more API calls failed');
        }

        // Parse JSON
        const soilData = await soilResponse.json();
        const nutrientsData = await nutrientsResponse.json();
        const healthData = await healthResponse.json();
        const riskData = await riskResponse.json();

        // Update state
        setSoilData(soilData);
        setNutrientsData(nutrientsData);
        setHealthData(healthData);
        setRiskData(riskData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching field data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFieldData();
  }, [fieldId, lat, lon]);

  // Loading state
  if (loading) {
    return (
      <div className="field-dashboard stardew-panel">
        <h2>Field Health Dashboard</h2>
        <div className="kpi-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="kpi-card loading">
              <div className="loading-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="field-dashboard stardew-panel">
        <h2>Field Health Dashboard</h2>
        <div className="dashboard-error">
          <p>Error loading field data: {error}</p>
          <button className="stardew-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="field-dashboard stardew-panel">
      <h2>Field Health Dashboard</h2>
      
      <div className="kpi-grid">
        {/* Soil Moisture KPI */}
        <div className="kpi-card">
          <div className="kpi-icon soil-icon">💧</div>
          <div className="kpi-content">
            <h3>Soil Moisture</h3>
            <div className="kpi-value">{soilData?.moisture || 'N/A'}%</div>
            <div className="kpi-status" data-status={getSoilMoistureStatus(soilData?.moisture)}>
              {getSoilMoistureLabel(soilData?.moisture)}
            </div>
          </div>
        </div>

        {/* Nutrients KPI */}
        <div className="kpi-card">
          <div className="kpi-icon nutrients-icon">🌱</div>
          <div className="kpi-content">
            <h3>Nutrients</h3>
            <div className="kpi-value">{nutrientsData?.level || 'N/A'}/10</div>
            <div className="kpi-status" data-status={getNutrientStatus(nutrientsData?.level)}>
              {getNutrientLabel(nutrientsData?.level)}
            </div>
          </div>
        </div>

        {/* Crop Health KPI */}
        <div className="kpi-card">
          <div className="kpi-icon health-icon">🌾</div>
          <div className="kpi-content">
            <h3>Crop Health</h3>
            <div className="kpi-value">{healthData?.score || 'N/A'}%</div>
            <div className="kpi-status" data-status={getHealthStatus(healthData?.score)}>
              {getHealthLabel(healthData?.score)}
            </div>
          </div>
        </div>

        {/* Risk Level KPI */}
        <div className="kpi-card">
          <div className="kpi-icon risk-icon">⚠️</div>
          <div className="kpi-content">
            <h3>Risk Level</h3>
            <div className="kpi-value">{riskData?.level || 'N/A'}</div>
            <div className="kpi-status" data-status={riskData?.level?.toLowerCase()}>
              {getRiskLabel(riskData?.level)}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <button className="stardew-button details-button">
          View Detailed Field Report
        </button>
      </div>
    </div>
  );
}

// Helper functions for displaying appropriate statuses and labels
function getSoilMoistureStatus(value) {
  if (!value) return 'unknown';
  if (value < 20) return 'critical';
  if (value < 40) return 'warning';
  if (value > 80) return 'warning';
  return 'good';
}

function getSoilMoistureLabel(value) {
  if (!value) return 'Unknown';
  if (value < 20) return 'Very Dry';
  if (value < 40) return 'Dry';
  if (value > 80) return 'Saturated';
  return 'Optimal';
}

function getNutrientStatus(value) {
  if (!value) return 'unknown';
  if (value < 3) return 'critical';
  if (value < 5) return 'warning';
  return 'good';
}

function getNutrientLabel(value) {
  if (!value) return 'Unknown';
  if (value < 3) return 'Deficient';
  if (value < 5) return 'Low';
  if (value < 8) return 'Adequate';
  return 'Optimal';
}

function getHealthStatus(value) {
  if (!value) return 'unknown';
  if (value < 50) return 'critical';
  if (value < 70) return 'warning';
  return 'good';
}

function getHealthLabel(value) {
  if (!value) return 'Unknown';
  if (value < 50) return 'Poor';
  if (value < 70) return 'Fair';
  if (value < 90) return 'Good';
  return 'Excellent';
}

function getRiskLabel(level) {
  if (!level) return 'Unknown';
  switch(level.toLowerCase()) {
    case 'high': return 'High Risk';
    case 'medium': return 'Medium Risk';
    case 'low': return 'Low Risk';
    default: return 'Unknown';
  }
}

export default FieldHealthDashboard;