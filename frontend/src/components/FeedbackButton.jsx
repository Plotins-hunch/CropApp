import React, { useState } from 'react';
import '../styles/FeedbackButton.css';

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    value1: '',
    value2: '',
    value3: ''
  });

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Feedback submitted:', formData);
    // Here you would typically send the data to your backend
    // For example: fetch('/api/feedback', { method: 'POST', body: JSON.stringify(formData) })
    
    // Reset form and close
    setFormData({ value1: '', value2: '', value3: '' });
    setIsOpen(false);
  };

  return (
    <div className="feedback-container">
      <button className="stardew-button feedback-button" onClick={handleOpen}>
        Feedback
      </button>

      {isOpen && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal stardew-panel">
            <h2 className="feedback-title">Share Your Feedback</h2>
            
            <form onSubmit={handleSubmit} className="feedback-form">
              <div className="form-group">
                <label htmlFor="value1">How much yield did you get?</label>
                <textarea 
                  id="value1"
                  name="value1"
                  value={formData.value1}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter your thoughts here..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="value2">What soil did you use?</label>
                <textarea
                  id="value2"
                  name="value2"
                  value={formData.value2}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter your suggestions here..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="value3">What kind of product did you use?</label>
                <textarea
                  id="value3"
                  name="value3"
                  value={formData.value3}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter any other feedback here..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="stardew-button cancel-button" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="stardew-button submit-button">
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackButton;