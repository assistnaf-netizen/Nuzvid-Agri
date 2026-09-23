import React, { useEffect } from 'react';
import SEO from '../components/SEO';
import './Commitment.css';

const Commitment = () => {
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="commitment-page-wrapper">
      <SEO title="Our Commitment" description="Learn about our dedication to organic farming, purity, and sustainability." />
      <div className="commitment-container">
        
        {/* Top Section */}
        <div className="commitment-top-section">
          {/* Left: Image with offset block */}
          <div className="commitment-image-side">
            {/* REPLACE THIS IMAGE SRC WITH YOUR EXACT FARMER SOIL GRAPHIC URL */}
            <img 
              src="/commitment-new-farmer.jpg" 
              alt="Farmer holding soil" 
              className="commitment-main-img" 
            />
          </div>
          
          {/* Right: Text Content */}
          <div className="commitment-text-side">
            <h2>Our Commitment Starts at the Farm. Where It All Begins with the Farmer!</h2>
            <p>
              Our roots are in the soil, and so is our responsibility. This soil has given us life, and preserving it is our promise to the future.
            </p>
            <p>
              At Nuzvid Agri Farms, we come from farming families. We've seen the early morning walks to the fields, the hands that work in the sun, and the hope in every harvest. Farming isn't just something we support; it's where we come from. It's who we are.
            </p>
            <p>
              Today, most of the food around us has lost its purity. It's faster, shinier, and more processed, but far from what our elders grew up eating. At the same time, farmers who still follow traditional, chemical-free practices are struggling to survive. Their way of farming may be slow and mindful, but it's better for our health and for our children's future. We are inspired by these farmers and their commitment to preserving the purity of our food, and we are here to support them.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="commitment-bottom-section">
          <p>
            That's why we work directly with such farmers. We visit their farms, understand their soil, their process, and their heart. We make sure they are paid what they truly deserve, more than just a market rate, because what they grow is not just food, it's nourishment rooted in tradition.
          </p>
          <p>
            By supporting these farmers, we're not only preserving age-old methods but also protecting the health of future generations. And that is the real reason Nuzvid Agri Farms exists. We're not just a business. We are a bridge between good farmers and good food. We invite you to be part of this journey, to connect with the past we respect and the future we want to protect. Together, we can make a difference.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Commitment;

