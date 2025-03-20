import React, { useState, useEffect } from 'react';
import '../styles/FarmerAdvisor.css';
import FarmersAlmanacModal from './FarmersAlmanacModal';

const FarmerAdvisor = ({ weather, cropType, withTreatment }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tipVisible, setTipVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  const [tipIndex, setTipIndex] = useState(0);
  const [isAlmanacOpen, setIsAlmanacOpen] = useState(false);

  // Define farming tips based on different conditions
  const generalTips = [
    "Rotate your crops each season to maintain soil health!",
    "Biological products can help your plants withstand extreme weather.",
    "Did you know? Healthy soil means healthy crops!",
    "Consider using less water with drought-resistant crops.",
    "Plant diversity helps create a resilient farm ecosystem."
  ];

  const weatherTips = {
    sunny: [
      "On sunny days, check soil moisture more frequently.",
      "Consider using our Stress Buster during hot, dry periods!",
      "Morning watering helps reduce evaporation on hot days."
    ],
    cloudy: [
      "Cloudy days are perfect for transplanting seedlings.",
      "Use Nutrient Booster to maximize growth even with less sunlight.",
      "Take advantage of cooler temps to apply treatments."
    ],
    rainy: [
      "Heavy rain can leach nutrients - consider a Nutrient Booster application.",
      "Check drainage to prevent waterlogging during rainy days.",
      "Rainy days are perfect for planning your next season's crops!"
    ]
  };

  const treatmentTips = [
    "Biological products work with nature, not against it!",
    "Our Yield Booster can increase production by up to 15%!",
    "Healthy soil microbiomes support plant immune systems.",
    "Biological treatments help build long-term soil health."
  ];

  // Select tips based on current conditions
  useEffect(() => {
    let tipPool = [...generalTips];
    
    // Add weather-specific tips
    if (weather && weatherTips[weather]) {
      tipPool = [...tipPool, ...weatherTips[weather]];
    }
    
    // Add treatment-specific tips if treatments are being used
    if (withTreatment) {
      tipPool = [...tipPool, ...treatmentTips];
    }
    
    // Set initial tip
    setCurrentTip(tipPool[Math.floor(Math.random() * tipPool.length)]);
    
    // Rotate tips every 15 seconds
    const tipInterval = setInterval(() => {
      const newIndex = (tipIndex + 1) % tipPool.length;
      setTipIndex(newIndex);
      setCurrentTip(tipPool[newIndex]);
      
      // Show the tip with a brief animation
      setTipVisible(true);
      setTimeout(() => setTipVisible(false), 12000); // Hide after 12 seconds
    }, 15000);
    
    // Show first tip after a short delay
    setTimeout(() => setTipVisible(true), 2000);
    setTimeout(() => setTipVisible(false), 14000);
    
    return () => clearInterval(tipInterval);
  }, [weather, withTreatment, tipIndex]);

  // Handle click to open Farmer's Almanac
  const handleFarmerClick = () => {
    setIsAlmanacOpen(true);
  };

  return (
    <div className="farmer-advisor-wrapper">
      <div className="farmer-advisor-container">
        <div 
          className={`farmer-character ${isHovered ? 'hovered' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleFarmerClick}
        >
          {/* Temporary CSS farmer representation until images are set up */}
          <div className="farmer-image-temp pixel-art">
            <div className="farmer-body"></div>
            <div className="farmer-head"></div>
            <div className="farmer-hair"></div>
            <div className="farmer-hat"></div>
            <div className="farmer-eyes left"></div>
            <div className="farmer-eyes right"></div>
            <div className="farmer-mouth"></div>
            <div className="farmer-arm left"></div>
            <div className="farmer-arm right"></div>
            <div className="farmer-legs left"></div>
            <div className="farmer-legs right"></div>
          </div>
          
          <div className="farmer-interaction-hint">
            Click for Farmer's Almanac
          </div>
        </div>

        <div className={`speech-bubble ${tipVisible ? 'visible' : ''}`}>
          <p>{currentTip}</p>
        </div>
      </div>
      
      {/* Farmer's Almanac Modal */}
      <FarmersAlmanacModal 
        isOpen={isAlmanacOpen} 
        onClose={() => setIsAlmanacOpen(false)} 
      />
    </div>
  );
};

export default FarmerAdvisor;