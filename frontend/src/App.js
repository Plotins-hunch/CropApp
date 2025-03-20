

import React from 'react';
import './styles/index.css';
import './styles/Field.css';
import './styles/Weather.css';
import './styles/Tooltip.css';
import './styles/WeatherService.css';
import FieldDemo from './components/FieldDemo';
import './styles/WeatherButton.css';
import './App.css';
import WeatherButton from './components/WeatherButton';
import FieldHealthDashboard from './components/FieldHealthDashboard';
import ProductRecommendation from './components/ProductRecommendation';

function App() {
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
          <FieldHealthDashboard fieldId={1} />
          <ProductRecommendation cropType="corn" />
        </div>
      </main>
      
      <footer className="mt-10 mb-6 text-center text-stardew-cream">
        <p>Created with 💚 for farmers everywhere</p>
      </footer>
    </div>
  );
}

export default App;