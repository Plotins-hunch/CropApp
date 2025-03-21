import React, { useState, useEffect } from 'react';
import './styles/index.css';
import './App.css';

// Import context provider
import { TimeProvider } from './context/TimeContext';

// Import components
import Field from './components/Field';
import FieldHealthDashboard from './components/FieldHealthDashboard';
import ProductRecommendation from './components/ProductRecommendation';
import WeatherService from './components/WeatherService';
import TimeSlider from './components/TimeSlider';
import FieldLegend from './components/FieldLegend';
import FeedbackButton from './components/FeedbackButton';
import { getCurrentWeather } from './services/weatherApi';

// Import icons
import { Tractor, Leaf, Cloud, History, ChevronUp, ChevronDown } from 'lucide-react';

function App() {
  // State to track current weather
  const [currentWeather, setCurrentWeather] = useState('sunny');
  // State to track if biological products are applied
  const [withTreatment, setWithTreatment] = useState(false);
  // State to track the time period (past, present, future)
  const [timePeriod, setTimePeriod] = useState('present');
  // State to track if panels are collapsed
  const [collapsedPanels, setCollapsedPanels] = useState({
    weather: false,
    fieldHealth: false,
    products: false,
    history: true
  });

  // Toggle treatment state
  const toggleTreatment = () => {
    setWithTreatment(!withTreatment);
  };
  
  // Handle time period changes from TimeSlider
  const handleTimeChange = (newTimePeriod) => {
    setTimePeriod(newTimePeriod);
    console.log(`Time period changed to: ${newTimePeriod}`);
  };

  // Toggle panel collapsed state
  const togglePanel = (panel) => {
    setCollapsedPanels({
      ...collapsedPanels,
      [panel]: !collapsedPanels[panel]
    });
  };

  // Get chevron icon based on panel state
  const getPanelIcon = (panel) => {
    return collapsedPanels[panel] ? 
      <ChevronDown size={16} className="panel-toggle-icon" /> : 
      <ChevronUp size={16} className="panel-toggle-icon" />;
  };

  // Mock historical data for chart
  const historicalData = [
    { month: 'Jan', yield: 76, average: 65 },
    { month: 'Feb', yield: 85, average: 68 },
    { month: 'Mar', yield: 90, average: 72 },
    { month: 'Apr', yield: 81, average: 75 },
    { month: 'May', yield: 95, average: 80 },
    { month: 'Jun', yield: 92, average: 85 },
  ];

  return (
    <TimeProvider>
      <div className="App">
        {/* Header with logo and title */}
        <header className="App-header stardew-panel">
          <div className="logo">
            <Tractor size={32} className="logo-icon" />
            <h1 className="app-title">Nature's Farming Assistant</h1>
          </div>
        </header>

        <main className="app-content">
          {/* Left sidebar with stacked panels */}
          <div className="sidebar-left">
            {/* Weather Panel */}
            <div className={`sidebar-panel ${collapsedPanels.weather ? 'collapsed' : ''}`}>
              <div 
                className="panel-header"
                onClick={() => togglePanel('weather')}
              >
                <div className="panel-title">
                  <Cloud size={20} className="panel-icon" />
                  <h2>Weather Station</h2>
                </div>
                {getPanelIcon('weather')}
              </div>
              <div className="panel-content">
                <WeatherService onWeatherChange={setCurrentWeather} />
              </div>
            </div>

            {/* Field Health Panel */}
            <div className={`sidebar-panel ${collapsedPanels.fieldHealth ? 'collapsed' : ''}`}>
              <div 
                className="panel-header"
                onClick={() => togglePanel('fieldHealth')}
              >
                <div className="panel-title">
                  <Leaf size={20} className="panel-icon" />
                  <h2>Field Health</h2>
                </div>
                {getPanelIcon('fieldHealth')}
              </div>
              <div className="panel-content">
                <FieldHealthDashboard fieldId={1} />
              </div>
            </div>

            {/* Historical Data Panel (Collapsed by default) */}
            <div className={`sidebar-panel ${collapsedPanels.history ? 'collapsed' : ''}`}>
              <div 
                className="panel-header"
                onClick={() => togglePanel('history')}
              >
                <div className="panel-title">
                  <History size={20} className="panel-icon" />
                  <h2>Historical Data</h2>
                </div>
                {getPanelIcon('history')}
              </div>
              <div className="panel-content">
                <div className="historical-chart stardew-panel">
                  <h3>Yield History</h3>
                  <div className="chart-container">
                    <div className="chart-bars">
                      {historicalData.map((item, index) => (
                        <div className="chart-bar-group" key={index}>
                          <div 
                            className="chart-bar your-yield" 
                            style={{ height: `${item.yield}%` }}
                            title={`Your yield: ${item.yield}%`}
                          ></div>
                          <div 
                            className="chart-bar average-yield" 
                            style={{ height: `${item.average}%` }}
                            title={`Regional average: ${item.average}%`}
                          ></div>
                        </div>
                      ))}
                    </div>
                    <div className="chart-labels">
                      {historicalData.map((item, index) => (
                        <div className="chart-label" key={index}>{item.month}</div>
                      ))}
                    </div>
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color your-yield"></div>
                      <span>Your Yield</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color average-yield"></div>
                      <span>Regional Average</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main field visualization */}
          <div className="main-content">
            {/* Time slider above field, same width as field container */}
            <div className="time-slider-wrapper" style={{ width: '100%', marginBottom: '16px' }}>
              <TimeSlider onTimeChange={handleTimeChange} />
            </div>
            
            <div className="field-container">
              <Field weather={currentWeather} withTreatment={withTreatment} />
            </div>
            
            {/* Field legend above toggle controls, same width as field container */}
            <div className="field-legend-wrapper" style={{ width: '100%', marginTop: '16px', marginBottom: '16px' }}>
              <FieldLegend />
            </div>
            
            <div className="field-controls">
              <div className="treatment-toggle">
                <span className="toggle-label">Regular Farming</span>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={withTreatment} 
                    onChange={toggleTreatment}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">With Biological Products</span>
              </div>
            </div>
          </div>

          {/* Right sidebar for product recommendations */}
          <div className="sidebar-right">
            <div className={`sidebar-panel ${collapsedPanels.products ? 'collapsed' : ''}`}>
              <div 
                className="panel-header"
                onClick={() => togglePanel('products')}
              >
                <div className="panel-title">
                  <div className="panel-icon">🧪</div>
                  <h2>Product Recommendations</h2>
                </div>
                {getPanelIcon('products')}
              </div>
              <div className="panel-content">
                <ProductRecommendation />
              </div>
            </div>
            
            {/* Feedback Button Panel */}
            <div className="sidebar-panel">
              <div className="panel-content" style={{ padding: '16px', textAlign: 'center' }}>
                <FeedbackButton />
              </div>
            </div>
          </div>
        </main>

        <footer className="app-footer">
          <p>Created with 💚 for farmers everywhere</p>
        </footer>
      </div>
    </TimeProvider>
  );
}

export default App;