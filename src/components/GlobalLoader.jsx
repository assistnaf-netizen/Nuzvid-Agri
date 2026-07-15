import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';
import './GlobalLoader.css';

const GlobalLoader = ({ onLoaded }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial asset loading time (at least 2 seconds for effect, or real loading logic)
    const timer = setTimeout(() => {
      setLoading(false);
      if (onLoaded) {
        setTimeout(onLoaded, 800); // Give time for exit animation to finish
      }
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [onLoaded]);

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
            <motion.div 
              className="loader-logo-circle"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Leaf size={48} className="loader-icon" strokeWidth={1.5} />
            </motion.div>
            
            <motion.h1 
              className="loader-brand-name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Nuzvid <span className="highlight">Agri Farms</span>
            </motion.h1>
            
            <motion.p 
              className="loader-tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Pure & Delight
            </motion.p>
            
            <motion.div 
              className="loader-progress-bar-container"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "200px" }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <motion.div 
                className="loader-progress-bar-fill"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoader;
