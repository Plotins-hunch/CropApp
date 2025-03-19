import React, { useEffect, useState } from 'react';
import './styles/index.css';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error("Error fetching backend:", err));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>{message || "Hello World"}</h1>
      </header>
    </div>
  );
}

export default App;

