

import React from 'react';
import './styles/index.css';
import './styles/Field.css';
import './styles/Weather.css';
import './styles/Tooltip.css';
import './styles/WeatherService.css';
import FieldDemo from './components/FieldDemo';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-center text-4xl mt-6 mb-8 text-stardew-cream">Nature's Farming Assistant</h1>
      </header>
      
      <main>
        <FieldDemo />
      </main>
      
      <footer className="mt-10 mb-6 text-center text-stardew-cream">
        <p>Created with 💚 for farmers everywhere</p>
      </footer>
    </div>
  );
}

export default App;