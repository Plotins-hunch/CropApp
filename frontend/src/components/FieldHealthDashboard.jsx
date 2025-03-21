import React from 'react';
import '../styles/FieldHealthDashboard.css';

function FieldHealthDashboard() {
  // Hardcoded data for the three risks
  const riskData = [
    {
      icon: "🌵",
      label: "Drought Risk",
      value: "7/10",
      status: "HIGH",
      statusType: "critical"
    },
    {
      icon: "🌡️",
      label: "Heat Risk",
      value: "5/9",
      status: "MEDIUM",
      statusType: "warning"
    },
    {
      icon: "🌾",
      label: "Yield Risk",
      value: "35%",
      status: "MEDIUM",
      statusType: "warning"
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
    </div>
  );
}

export default FieldHealthDashboard;