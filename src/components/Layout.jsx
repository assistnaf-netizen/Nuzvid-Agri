import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

const Layout = () => {
  const [showBubble, setShowBubble] = useState(true);
  const [showTopBtn, setShowTopBtn] = useState(false);

  // Auto-hide the WhatsApp bubble after 5 seconds
  useEffect(() => {
    if (!showBubble) return;
    const timer = setTimeout(() => setShowBubble(false), 5000);
    return () => clearTimeout(timer);
  }, [showBubble]);

  // Show "Top" button after scrolling down 300px
  useEffect(() => {
    const onScroll = () => setShowTopBtn(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Bottom-Right Widget Column */}
      <div className="floating-widget-col">
        {/* Scroll to Top button — above WhatsApp */}
        {showTopBtn && (
          <button
            className="floating-top-btn"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            title="Back to top"
          >
            ↑
          </button>
        )}

        {/* WhatsApp bubble + icon */}
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
      </div>
    </>
  );
};

export default Layout;

