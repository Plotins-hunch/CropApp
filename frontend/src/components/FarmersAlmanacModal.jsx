import React from 'react';
import '../styles/FarmersAlmanacModal.css';
import { X } from 'lucide-react';

const FarmersAlmanacModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Sample blog posts
  const blogPosts = [
    {
      id: 1,
      title: "The Power of Biological Products in Modern Farming",
      excerpt: "Learn how biological products can increase your yield while promoting sustainable agriculture...",
      date: "March 15, 2025",
      author: "Dr. Emma Johnson",
      tags: ["biologicals", "sustainable farming", "yield improvement"]
    },
    {
      id: 2,
      title: "Preparing Your Soil for Changing Climate Conditions",
      excerpt: "Climate change is affecting farming worldwide. Here's how to prepare your soil to be more resilient...",
      date: "March 12, 2025",
      author: "Miguel Rodriguez",
      tags: ["climate adaptation", "soil health", "drought resistance"]
    },
    {
      id: 3,
      title: "Drought Management Strategies Using Biological Products",
      excerpt: "Drought periods are becoming more common. These strategies can help your crops thrive even in dry conditions...",
      date: "March 8, 2025",
      author: "Sarah Williams",
      tags: ["drought", "water management", "stress buster"]
    },
    {
      id: 4,
      title: "Maximizing Nutrient Use Efficiency: A Guide for Small Farmers",
      excerpt: "Learn how to get the most from your soil nutrients and reduce fertilizer costs with these techniques...",
      date: "March 5, 2025",
      author: "Dr. James Chen",
      tags: ["nutrient efficiency", "cost saving", "small farms"]
    }
  ];

  return (
    <div className="almanac-modal-backdrop">
      <div className="almanac-modal">
        <div className="almanac-header">
          <h2>Farmer's Almanac</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="almanac-tagline">
          Wisdom for the modern farmer, powered by nature
        </div>

        <div className="almanac-content">
          <div className="featured-post">
            <div className="featured-post-badge">Featured Article</div>
            <h3>Biological Solutions for a Changing Climate</h3>
            <p>
              As climate patterns shift and become less predictable, farmers worldwide are turning to nature-based 
              solutions to protect their crops and livelihoods. Biological products offer a powerful toolkit for 
              agricultural resilience...
            </p>
            <div className="post-meta">
              <span className="post-date">March 18, 2025</span>
              <span className="post-author">By Dr. Robert Nguyen</span>
            </div>
            <button className="stardew-button read-more">Read Full Article</button>
          </div>

          <div className="post-grid">
            {blogPosts.map(post => (
              <div className="blog-post-card" key={post.id}>
                <h4 className="post-title">{post.title}</h4>
                <p className="post-excerpt">{post.excerpt}</p>
                <div className="post-meta">
                  <span className="post-date">{post.date}</span>
                  <span className="post-author">By {post.author}</span>
                </div>
                <div className="post-tags">
                  {post.tags.map((tag, index) => (
                    <span className="post-tag" key={index}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmersAlmanacModal;