import React, { useState } from 'react';
import '../styles/HistoricalChart.css';

// Icons
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';

const HistoricalComparisonChart = ({ fieldId = 1 }) => {
  // State for current view type (yield, moisture, nutrients)
  const [viewType, setViewType] = useState('yield');
  // State for year selection
  const [selectedYear, setSelectedYear] = useState(2024);
  
  // Sample data - would come from API in real implementation
  const historicalData = {
    yield: {
      2023: [
        { month: 'Jan', yourData: 70, regionalAvg: 65, withBiologicals: 78 },
        { month: 'Feb', yourData: 74, regionalAvg: 68, withBiologicals: 82 },
        { month: 'Mar', yourData: 76, regionalAvg: 72, withBiologicals: 86 },
        { month: 'Apr', yourData: 71, regionalAvg: 75, withBiologicals: 82 },
        { month: 'May', yourData: 82, regionalAvg: 80, withBiologicals: 93 },
        { month: 'Jun', yourData: 85, regionalAvg: 85, withBiologicals: 96 },
      ],
      2024: [
        { month: 'Jan', yourData: 76, regionalAvg: 65, withBiologicals: 85 },
        { month: 'Feb', yourData: 85, regionalAvg: 68, withBiologicals: 92 },
        { month: 'Mar', yourData: 90, regionalAvg: 72, withBiologicals: 97 },
        { month: 'Apr', yourData: 81, regionalAvg: 75, withBiologicals: 88 },
        { month: 'May', yourData: 95, regionalAvg: 80, withBiologicals: 98 },
        { month: 'Jun', yourData: 92, regionalAvg: 85, withBiologicals: 99 },
      ]
    },
    moisture: {
      2023: [
        { month: 'Jan', yourData: 60, regionalAvg: 65, withBiologicals: 72 },
        { month: 'Feb', yourData: 58, regionalAvg: 68, withBiologicals: 75 },
        { month: 'Mar', yourData: 62, regionalAvg: 70, withBiologicals: 76 },
        { month: 'Apr', yourData: 68, regionalAvg: 72, withBiologicals: 78 },
        { month: 'May', yourData: 72, regionalAvg: 75, withBiologicals: 80 },
        { month: 'Jun', yourData: 70, regionalAvg: 68, withBiologicals: 76 },
      ],
      2024: [
        { month: 'Jan', yourData: 65, regionalAvg: 65, withBiologicals: 75 },
        { month: 'Feb', yourData: 68, regionalAvg: 68, withBiologicals: 78 },
        { month: 'Mar', yourData: 72, regionalAvg: 70, withBiologicals: 82 },
        { month: 'Apr', yourData: 75, regionalAvg: 72, withBiologicals: 85 },
        { month: 'May', yourData: 78, regionalAvg: 75, withBiologicals: 88 },
        { month: 'Jun', yourData: 72, regionalAvg: 68, withBiologicals: 85 },
      ]
    },
    nutrients: {
      2023: [
        { month: 'Jan', yourData: 50, regionalAvg: 60, withBiologicals: 70 },
        { month: 'Feb', yourData: 52, regionalAvg: 62, withBiologicals: 72 },
        { month: 'Mar', yourData: 55, regionalAvg: 65, withBiologicals: 75 },
        { month: 'Apr', yourData: 58, regionalAvg: 68, withBiologicals: 78 },
        { month: 'May', yourData: 62, regionalAvg: 72, withBiologicals: 82 },
        { month: 'Jun', yourData: 65, regionalAvg: 75, withBiologicals: 85 },
      ],
      2024: [
        { month: 'Jan', yourData: 55, regionalAvg: 60, withBiologicals: 75 },
        { month: 'Feb', yourData: 60, regionalAvg: 62, withBiologicals: 80 },
        { month: 'Mar', yourData: 65, regionalAvg: 65, withBiologicals: 85 },
        { month: 'Apr', yourData: 70, regionalAvg: 68, withBiologicals: 90 },
        { month: 'May', yourData: 75, regionalAvg: 72, withBiologicals: 92 },
        { month: 'Jun', yourData: 78, regionalAvg: 75, withBiologicals: 95 },
      ]
    }
  };

  // Get current data based on view type and year
  const currentData = historicalData[viewType][selectedYear] || [];

  // Get title based on view type
  const getTitle = () => {
    switch (viewType) {
      case 'yield':
        return 'Crop Yield Comparison';
      case 'moisture':
        return 'Soil Moisture Retention';
      case 'nutrients':
        return 'Nutrient Efficiency';
      default:
        return 'Historical Comparison';
    }
  };

  // Get unit label based on view type
  const getUnitLabel = () => {
    switch (viewType) {
      case 'yield':
        return '%';
      case 'moisture':
        return '%';
      case 'nutrients':
        return 'NUE';
      default:
        return '';
    }
  };

  // Change view type
  const changeViewType = (type) => {
    setViewType(type);
  };

  // Change year
  const changeYear = (increment) => {
    const years = Object.keys(historicalData[viewType]).map(Number);
    const currentIndex = years.indexOf(selectedYear);
    
    if (increment && currentIndex < years.length - 1) {
      setSelectedYear(years[currentIndex + 1]);
    } else if (!increment && currentIndex > 0) {
      setSelectedYear(years[currentIndex - 1]);
    }
  };

  return (
    <div className="historical-chart stardew-panel">
      <div className="chart-header">
        <h3>{getTitle()}</h3>
        
        <div className="chart-controls">
          <div className="view-type-controls">
            <button 
              className={`view-type-button ${viewType === 'yield' ? 'active' : ''}`}
              onClick={() => changeViewType('yield')}
            >
              Yield
            </button>
            <button 
              className={`view-type-button ${viewType === 'moisture' ? 'active' : ''}`}
              onClick={() => changeViewType('moisture')}
            >
              Moisture
            </button>
            <button 
              className={`view-type-button ${viewType === 'nutrients' ? 'active' : ''}`}
              onClick={() => changeViewType('nutrients')}
            >
              Nutrients
            </button>
          </div>
          
          <div className="year-selector">
            <button 
              className="year-nav-button" 
              onClick={() => changeYear(false)}
              disabled={selectedYear <= Math.min(...Object.keys(historicalData[viewType]).map(Number))}
            >
              <ArrowLeftCircle size={16} />
            </button>
            <span className="year-display">{selectedYear}</span>
            <button 
              className="year-nav-button" 
              onClick={() => changeYear(true)}
              disabled={selectedYear >= Math.max(...Object.keys(historicalData[viewType]).map(Number))}
            >
              <ArrowRightCircle size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-y-axis">
          {[0, 25, 50, 75, 100].map((value) => (
            <div key={value} className="y-axis-label">
              {value}{getUnitLabel()}
            </div>
          ))}
        </div>
        
        <div className="chart-bars">
          {currentData.map((item, index) => (
            <div className="chart-bar-group" key={index}>
              <div 
                className="chart-bar your-data" 
                style={{ height: `${item.yourData}%` }}
                title={`Your data: ${item.yourData}${getUnitLabel()}`}
              ></div>
              <div 
                className="chart-bar regional-avg" 
                style={{ height: `${item.regionalAvg}%` }}
                title={`Regional average: ${item.regionalAvg}${getUnitLabel()}`}
              ></div>
              <div 
                className="chart-bar with-biologicals" 
                style={{ height: `${item.withBiologicals}%` }}
                title={`With biologicals: ${item.withBiologicals}${getUnitLabel()}`}
              ></div>
            </div>
          ))}
        </div>
        
        <div className="chart-grid">
          <div className="grid-line" style={{ bottom: '75%' }}></div>
          <div className="grid-line" style={{ bottom: '50%' }}></div>
          <div className="grid-line" style={{ bottom: '25%' }}></div>
          <div className="grid-line" style={{ bottom: '0%' }}></div>
        </div>
      </div>
      
      <div className="chart-x-axis">
        {currentData.map((item, index) => (
          <div className="x-axis-label" key={index}>{item.month}</div>
        ))}
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color your-data"></div>
          <span>Your Farm</span>
        </div>
        <div className="legend-item">
          <div className="legend-color regional-avg"></div>
          <span>Regional Average</span>
        </div>
        <div className="legend-item">
          <div className="legend-color with-biologicals"></div>
          <span>With Biologicals</span>
        </div>
      </div>
    </div>
  );
};

export default HistoricalComparisonChart;