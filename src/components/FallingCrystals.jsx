import React, { useEffect, useState } from 'react';
import './FallingCrystals.css';

const FallingCrystals = () => {
  const [crystals, setCrystals] = useState([]);

  useEffect(() => {
    // Generate crystals once on mount to avoid hydration mismatches
    const generated = Array.from({ length: 35 }).map((_, i) => {
      const size = Math.random() * 12 + 8; // Size between 8px and 20px
      const left = Math.random() * 100; // Random horizontal position
      const duration = Math.random() * 8 + 6; // Fall duration between 6s and 14s
      const delay = Math.random() * 10; // Random start delay
      const opacity = Math.random() * 0.4 + 0.1; // Subtle opacity
      
      return {
        id: i,
        style: {
          left: `${left}%`,
          width: `${size}px`,
          height: `${size * 1.8}px`, // Crystals are taller than they are wide
          animationDuration: `${duration}s`,
          animationDelay: `-${delay}s`, // Negative delay so they are already on screen
          opacity: opacity
        }
      };
    });
    setCrystals(generated);
  }, []);

  return (
    <div className="crystals-container">
      {crystals.map((c) => (
        <div key={c.id} className="crystal" style={c.style}></div>
      ))}
    </div>
  );
};

export default FallingCrystals;
