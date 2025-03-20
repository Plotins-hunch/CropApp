import React from 'react';
import './styles/index.css';
import './styles/WeatherButton.css';
import WeatherButton from './components/WeatherButton';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-center text-4xl mt-6 mb-8 text-stardew-cream">Nature's Farming Assistant</h1>
      </header>
      
      <main>
        <WeatherButton />
        <h1> Hello World!</h1>
      </main>
      
      <footer className="mt-10 mb-6 text-center text-stardew-cream">
        <p>Created with 💚 for farmers everywhere</p>
      </footer>
    </div>
  );
}

export default App;