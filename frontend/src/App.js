import React, { useState } from 'react';
import './styles/index.css';
import './styles/WeatherButton.css';
import './App.css';
import WeatherButton from './components/WeatherButton';
import FieldHealthDashboard from './components/FieldHealthDashboard';
import ProductRecommendation from './components/ProductRecommendation';
import TimeSlider from './components/TimeSlider';
import FieldLegend from './components/FieldLegend'; // Add this import
import FeedbackButton from './components/FeedbackButton';

function App() {
  const [timeState, setTimeState] = useState('present');
  
  const handleTimeChange = (newTimeState) => {
    setTimeState(newTimeState);
    console.log(`Time shifted to: ${newTimeState}`);
    // You can pass this state to other components or fetch different data based on the time state
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="flex justify-center items-center px-6 py-4">
          <h1 className="text-2xl text-stardew-cream">Nature's Farming Assistant</h1>
        </div>
      </header>
      
      <div className="relative">
        <div className="weather-wrapper">
          <WeatherButton />
        </div>
      </div>

      <main className="min-h-screen bg-stardew-green-dark pt-16">
        <div className="container mx-auto px-4 py-8">
          <TimeSlider onTimeChange={handleTimeChange} />
          <FieldHealthDashboard fieldId={1} timeState={timeState} />
          <FieldLegend /> {/* Add the component here */}
          <ProductRecommendation cropType="corn" timeState={timeState} />
          <FeedbackButton />
        </div>
      </main>
      
      <footer className="mt-10 mb-6 text-center text-stardew-cream">
        <p>Created with 💚 for farmers everywhere</p>
      </footer>
    </div>
  );
}

export default App;