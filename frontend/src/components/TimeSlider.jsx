import React, { useState, useRef, useEffect } from 'react';
import '../styles/TimeSlider.css';

const TimeSlider = ({ onTimeChange }) => {
  const [sliderValue, setSliderValue] = useState(50); // 0-100 range (0=past, 50=present, 100=future)
  const [timeState, setTimeState] = useState('present');
  const [snapToPresent, setSnapToPresent] = useState(false);
  const sliderRef = useRef(null);
  
  // Update timeState based on sliderValue
  useEffect(() => {
    let newTimeState = 'present';
    if (sliderValue < 48) {
      newTimeState = 'past';
    } else if (sliderValue > 52) {
      newTimeState = 'future';
    }
    
    if (newTimeState !== timeState) {
      setTimeState(newTimeState);
      if (onTimeChange) {
        onTimeChange(newTimeState);
      }
    }
    
    // Set snapToPresent flag when very close to present
    setSnapToPresent(sliderValue >= 48 && sliderValue <= 52);
  }, [sliderValue, timeState, onTimeChange]);
  
  // Calculate the year based on slider value
  const calculateYear = () => {
    const today = new Date();
    // Calculate year offset (-10 to +10 years)
    const yearOffset = Math.round((sliderValue - 50) / 50 * 10);
    
    return today.getFullYear() + yearOffset;
  };
  
  // Handle slider change
  const handleSliderChange = (e) => {
    let newValue = parseInt(e.target.value, 10);
    
    // Add "magnetic" effect near present (value 50)
    if (newValue >= 48 && newValue <= 52) {
      // If moving slowly near center point, snap to center (present)
      if (Math.abs(newValue - sliderValue) < 2) {
        newValue = 50;
      }
    }
    
    setSliderValue(newValue);
  };

  // Handle slider release - adds a snapping behavior when close to present
  const handleSliderRelease = () => {
    if (snapToPresent) {
      setSliderValue(50); // Snap to exact present
    }
  };
  
  // Icon based on time period - keeping this function in case it's needed elsewhere
  const getTimeIcon = () => {
    if (sliderValue < 40) return '🕰️'; // Deep past
    if (sliderValue < 48) return '📜'; // Recent past
    if (sliderValue <= 52) return '📆'; // Present
    if (sliderValue < 70) return '🔮'; // Near future
    return '🚀'; // Far future
  };

  return (
    <div className="time-slider-container">
      {/* Removed the title "Time Machine" */}
      
      <div className="date-display">
        <div className="date-chip">
          <span className="date-text">{calculateYear()}</span>
        </div>
      </div>
      
      <div className="slider-component">
        <span className="slider-label">Past<br/>(10 years)</span>
        <div className="range-slider-wrapper">
          <input
            ref={sliderRef}
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            onMouseUp={handleSliderRelease}
            onTouchEnd={handleSliderRelease}
            className="range-slider"
            aria-label="Time slider"
          />
          <div className="slider-track">
            <div 
              className="slider-fill" 
              style={{ width: `${sliderValue}%` }}
            ></div>
            <div className="present-marker" title="Present day"></div>
          </div>
        </div>
        <span className="slider-label">Future<br/>(10 years)</span>
      </div>
    </div>
  );
};

export default TimeSlider;