import React from 'react';
import '../styles/FieldHealthDashboard.css';
import { useTime } from '../context/TimeContext';

function FieldHealthDashboard() {
  // Use time context to get current year and risk values
  const { currentYear, getRiskValues } = useTime();
  
  // Get risk values based on current year
  const risks = getRiskValues(currentYear);
  
  // Format risk values into display data
  const getRiskStatus = (value, max) => {
    const percentage = (value / max) * 100;
    if (percentage >= 70) return { status: 'HIGH', statusType: 'critical' };
    if (percentage >= 40) return { status: 'MEDIUM', statusType: 'warning' };
    return { status: 'LOW', statusType: 'good' };
  };

  // Create risk data for display
  const riskData = [
    {
      icon: "🌵",
      label: "Drought Risk",
      value: `${risks.drought}/10`,
      ...getRiskStatus(risks.drought, 10)
    },
    {
      icon: "🌡️",
      label: "Heat Risk",
      value: `${risks.heat}/9`,
      ...getRiskStatus(risks.heat, 9)
    },
    {
      icon: "🌾",
      label: "Yield Risk",
      value: `${risks.yield}%`,
      ...getRiskStatus(100 - risks.yield, 100)
    }
  ];

  return (
    <div className="field-dashboard stardew-panel">
      <h2>Field Health Dashboard</h2>
      
      <div className="risk-list">
        {riskData.map((risk, index) => (
          <div className="risk-card stardew-panel" key={index}>
            <div className="risk-card-inner">
              <div className={`risk-icon ${risk.statusType}-icon`}>
                {risk.icon}
              </div>
              <div className="risk-content">
                <h3 className="risk-label">{risk.label}</h3>
                <div className="risk-value">{risk.value}</div>
                <div className={`risk-status ${risk.statusType}`}>
                  {risk.status}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {currentYear !== 2025 && (
        <div className="year-specific-warning">
          {currentYear < 2025 ? (
            <p className="historical-note">Historical data from {currentYear}</p>
          ) : (
            <p className="prediction-note">Predicted data for {currentYear}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default FieldHealthDashboard;