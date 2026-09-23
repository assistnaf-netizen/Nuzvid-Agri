import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import './About.css';

const About = () => {
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page-wrapper">
      <SEO title="About Us" description="Learn more about Nuzvid Agri Farms, our mission to provide pure, wood-pressed oils, and our commitment to sustainable farming." />
      {/* Hero Banner Section */}
      <section className="about-hero" style={{ backgroundImage: "url('https://www.nuzvidagrifarms.com/cdn/shop/files/new_1920x.jpg?v=1759635977')" }}>
        <div className="about-hero-text">
          <Link to="/">Home</Link> | <span>About Us</span>
        </div>
      </section>

      {/* Section 1: Our Story */}
      <section className="about-section">
        <div className="story-container">
          {/* Left: Image with overlapping badge */}
          <div className="story-image-side">
            {/* REPLACE THIS IMAGE SRC WITH YOUR EXACT FAMILY IMAGE URL */}
            <img 
              src="/about-family.png" 
              alt="Farming Family" 
              className="main-story-img" 
            />
            <div className="experience-badge">
              <h3>10+</h3>
              <p>Years Experience</p>
            </div>
          </div>
          
          {/* Right: Text content */}
          <div className="story-text-side">
            <h4 className="subtitle">KNOW MORE ABOUT Nuzvid Agri Farms</h4>
            <h2>We didn't build to start a business.</h2>
            <div className="vertical-line-text">
              We built it because something was missing!
            </div>
            <p className="story-body-text">
              Coming from farming families, we've seen food change not just in how it's made, but in how it's valued. What once grew with care in our backyards is now rushed, processed, and far from what it used to be. Somewhere along the way, in the race for convenience, we left behind what truly mattered : purity, patience, and health.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Our Mission */}
      <section className="about-section" style={{ paddingTop: '20px' }}>
        <div className="mission-header">
          <h2>We felt that loss. In our health. In our homes. In our children. And we couldn't look away.</h2>
          <h4>That's why we chose to return to our roots.</h4>
          <p>
            At Nuzvid Agri Farms, we don't just source. We understand. We go to the farms, walk the fields, speak with farmers, and support those who still believe in clean, traditional practices. We don't cut corners or chase shortcuts because we know real health can't be rushed.
          </p>
        </div>

        <div className="mission-container">
          {/* Left: Graphic image with vertical bar */}
          <div className="mission-image-side">
             {/* REPLACE THIS IMAGE SRC WITH YOUR EXACT BULL OIL-PRESS GRAPHIC URL */}
            <img 
              src="/about-bull.png" 
              alt="Purity Patience Health" 
              className="mission-img" 
            />
          </div>

          {/* Right: Text Content */}
          <div className="mission-text-side">
            <p>
              <strong>At Nuzvid Agri Farms</strong>, Every product we bring to you, be it wood-pressed oils, A2 ghee, stone-ground flours, raw honey, or organic jaggery, is made with the same thought: Would we feed this to our own family?
            </p>
            <p>
              We put in hard work not to sell something new but to revive something old. To protect what once protected us. And to make sure the next generation grows up with food that truly nourishes.
            </p>
            <p>
              This isn't just a brand. It's a quiet movement for better food, better health, and a better tomorrow. We believe in a future where food truly nourishes, and health is not compromised. We started this for our families. Now, we share it with you. We started this for our own families. Today, we open it to you with the same honesty and intention.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

