import React, { useState } from 'react';
import '../styles/ProductRecommendation.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductRecommendation = ({ fieldId = 1, cropType = "corn", lat = 47.5596, lon = 7.5886 }) => {
  const [products, setProducts] = useState([
    { id: 1, name: "Stress Buster", effectiveness: 0, description: "Helps plants withstand extreme temperature conditions", icon: "🌡️", loading: false },
    { id: 2, name: "Yield Booster", effectiveness: 0, description: "Increases crop yield even in challenging conditions", icon: "🌾", loading: false },
    { id: 3, name: "Nutrient Plus", effectiveness: 0, description: "Enhances nutrient uptake and overall plant health", icon: "🌱", loading: false }
  ]);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const compareAll = async () => {
    try {
      setComparing(true);
      setError(null);
      
      // Update all products to loading state
      setProducts(products.map(product => ({ ...product, loading: true })));
      
      // Get current date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Make parallel API calls for each product
      const [stressBusterRes, yieldBoosterRes, nutrientPlusRes] = await Promise.all([
        fetch(`/api/product-comparison/stress-buster/${cropType}/${today}/${lat}/${lon}`),
        fetch(`/api/product-comparison/yield-booster/${cropType}/${today}/${lat}/${lon}`),
        fetch(`/api/product-comparison/nutrient-plus/${cropType}/${today}/${lat}/${lon}`)
      ]);
      
      // Check for any failed responses
      if (!stressBusterRes.ok || !yieldBoosterRes.ok || !nutrientPlusRes.ok) {
        throw new Error("Failed to fetch product comparison data");
      }
      
      // Parse JSON responses
      const stressBusterData = await stressBusterRes.json();
      const yieldBoosterData = await yieldBoosterRes.json();
      const nutrientPlusData = await nutrientPlusRes.json();
      
      // Update state with fetched data
      setProducts([
        { ...products[0], effectiveness: stressBusterData.effectiveness || 0, loading: false },
        { ...products[1], effectiveness: yieldBoosterData.effectiveness || 0, loading: false },
        { ...products[2], effectiveness: nutrientPlusData.effectiveness || 0, loading: false }
      ]);
    } catch (err) {
      console.error("Error comparing products:", err);
      setError(err.message);
      // Reset loading state on error
      setProducts(products.map(product => ({ ...product, loading: false })));
    } finally {
      setComparing(false);
    }
  };

  const resetComparison = () => {
    setProducts(products.map(product => ({ ...product, effectiveness: 0 })));
    setError(null);
  };

  const nextProduct = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === products.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevProduct = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  };

  const currentProduct = products[currentIndex];

  return (
    <div className="product-recommendation stardew-panel">
      <h2 className="recommendation-title">Products</h2>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button className="stardew-button" onClick={resetComparison}>Try Again</button>
        </div>
      )}
      
      <div className="product-carousel">
        <button 
          className="carousel-nav-button prev-button" 
          onClick={prevProduct}
          aria-label="Previous product"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="carousel-window">
          <div className="product-card">
            <div className="product-icon">{currentProduct.icon}</div>
            <h3 className="product-name">{currentProduct.name}</h3>
            <p className="product-description">{currentProduct.description}</p>
            <div className="effectiveness-meter">
              <div 
                className="effectiveness-fill" 
                style={{ width: `${currentProduct.effectiveness}%` }}
              ></div>
              <span className="effectiveness-label">
                {currentProduct.loading ? 'Calculating...' : `${currentProduct.effectiveness}% Effective`}
              </span>
            </div>
          </div>
        </div>
        
        <button 
          className="carousel-nav-button next-button" 
          onClick={nextProduct}
          aria-label="Next product"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="carousel-indicators">
        {products.map((_, index) => (
          <button 
            key={index}
            className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to product ${index + 1}`}
          />
        ))}
      </div>
      
      <div className="recommendation-actions">
        <button 
          className="stardew-button compare-button" 
          onClick={compareAll}
          disabled={comparing}
        >
          {comparing ? 'Comparing...' : 'Compare All Products'}
        </button>
        
        {products.some(p => p.effectiveness > 0) && (
          <button 
            className="stardew-button reset-button" 
            onClick={resetComparison}
          >
            Reset Comparison
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductRecommendation;