import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

const Layout = () => {
  const [showBubble, setShowBubble] = useState(true);

  // Auto-hide the bubble after 5 seconds
  useEffect(() => {
    if (!showBubble) return;
    const timer = setTimeout(() => setShowBubble(false), 5000);
    return () => clearTimeout(timer);
  }, [showBubble]);

  return (
    <>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      {/* Floating WhatsApp Widget */}
      <div className="whatsapp-float-wrapper">
        {showBubble && (
          <div className="wa-bubble">
            Hey, order here for discounts!
            <button
              className="wa-bubble-close"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowBubble(false); }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
        <a href="https://wa.me/919985555525" className="whatsapp-float" target="_blank" rel="noopener noreferrer">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
        </a>
      </div>
    </>
  );
};

export default Layout;
