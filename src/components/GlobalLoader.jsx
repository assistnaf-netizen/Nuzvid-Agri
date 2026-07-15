import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GlobalLoader.css';

const GlobalLoader = ({ onLoaded }) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress from 0 to 100
    const duration = 2000;
    const interval = 20; // update every 20ms
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setProgress(currentProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          setLoading(false);
          if (onLoaded) {
            setTimeout(onLoaded, 800); // Give time for exit animation
          }
        }, 500); // short pause at 100%
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [onLoaded]);

  // Calculate SVG stroke offset for the circle
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {loading && (
        <motion.div 
          className="global-loader-container"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.6, 0.05, -0.01, 0.9] }}
        >
          <div className="global-loader-content">
            
            <div className="circular-loader-wrapper">
              {/* SVG Circular Progress */}
              <svg className="progress-ring" width="200" height="200">
                <circle
                  className="progress-ring-track"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="6"
                  fill="transparent"
                  r={radius}
                  cx="100"
                  cy="100"
                />
                <circle
                  className="progress-ring-fill"
                  stroke="#4ade80"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="transparent"
                  r={radius}
                  cx="100"
                  cy="100"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset,
                    transition: 'stroke-dashoffset 0.1s linear'
                  }}
                />
              </svg>

              {/* Logo in the center */}
              <motion.div 
                className="loader-logo-circle"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <img 
                  src="https://www.nuzvidagrifarms.com/cdn/shop/files/Nuzvid_logo_463bcf9e-fbf0-4e1b-9f12-2734584a22df.png" 
                  alt="Nuzvid Agri Farms Logo" 
                  className="loader-actual-logo"
                />
              </motion.div>
            </div>

            <motion.div 
              className="loader-percentage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {progress}%
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoader;
