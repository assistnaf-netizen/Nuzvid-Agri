import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import './OurIntro.css';

const OurIntro = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="intro-page-wrapper">
      <SEO title="Our Intro" description="Discover the story and tradition behind Nuzvid Agri Farms." />
      
      {/* Hero Banner Section */}
      <section className="intro-hero">
        <div className="intro-hero-text">
          <Link to="/">Home</Link> | <span>Our Intro</span>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="intro-section">
        <div className="intro-container">
          
          <div className="intro-top-grid">
            <div className="intro-text-side">
              <h2>When Food Was Love, Not Industry</h2>
              <p>
                Remember the days when our grandparents cooked with pure oils, fresh flours, natural sweeteners, and grains that were stored with care ? Those were the days when food was simple, clean, and full of life. But somewhere along the way, we moved faster and left those practices behind. And we felt the gap in our health, our energy, and our connection to what we eat.
              </p>
              
              <h2>Reason behind the Nuzvid Agri Farms.</h2>
              <p>
                Our mission at Nuzvid Agri Farms is to bring back what was good and pass it on to the next generation, not as a trend but as a way of life. We are committed to preserving these traditional methods for a healthier future.
              </p>
              
              <p>
                At Nuzvid Agri Farms, we follow traditional methods that respect both nature and health. Every product we make begins with a simple question: Would we give this to our own family? This personal commitment ensures that our products are of the highest quality and safety.
              </p>
            </div>
            
            <div className="intro-image-side">
              <img 
                src="https://www.nuzvidagrifarms.com/cdn/shop/files/Our_Intro_1200x.jpg?v=1759857682" 
                alt="Traditional farming family" 
                className="intro-main-img" 
              />
            </div>
          </div>

          <div className="intro-bottom-content">
            <ul className="intro-list">
              <li>
                Our <strong>wood-pressed oils</strong>, extracted slowly without heat or chemicals, keep the natural antioxidants, healthy fats, and essential nutrients that support heart health, digestion, and overall wellness. These oils are unique because they enhance both taste and nutrition, making everyday meals better for your body.
              </li>
              <li>
                Our <strong>A2 ghee</strong>, made from native cow milk using the bilona method, supports immunity and gut health, while bringing back that golden aroma to your food.
              </li>
              <li>
                Our <strong>stone-ground flours</strong> are made without high-speed machines, preserving the fiber and texture that refined flours lose, helping you stay fuller and energized longer.
              </li>
              <li>
                We bring you <strong>unpolished grains and cereals</strong> that are rich in minerals, slow to digest, and naturally nourishing.
              </li>
              <li>
                Our <strong>forest honey</strong> is raw and unfiltered, rich in antioxidants, and collected with care from natural sources, free from added sugar.
              </li>
              <li>
                And our <strong>organic jaggery</strong> is made in small batches without sulphur or chemicals, providing a cleaner, healthier alternative to sugar.
              </li>
            </ul>

            <p className="intro-conclusion">
              These aren't just products. They are a bridge between tradition and today, between health and habit. We started this for our families. And today, we share it with you and the generations to come.
            </p>
          </div>
          
        </div>
      </section>
    </div>
  );
};

export default OurIntro;
