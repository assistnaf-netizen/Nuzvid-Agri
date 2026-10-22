import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ArrowUp, 
  ShieldCheck, 
  HeartHandshake, 
  Leaf, 
  Award,
  ChevronRight,
  Sprout,
  FileCheck2,
  PackageCheck
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMsg, setSubscribeMsg] = useState('');
  const [subscribeError, setSubscribeError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setSubscribeError('Please enter a valid email address.');
      return;
    }

    setSubscribing(true);
    setSubscribeError('');
    setSubscribeMsg('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setIsSubscribed(true);
        setSubscribeMsg(data.message || 'Subscribed successfully!');
        setEmail('');
      } else {
        setSubscribeError(data.error || 'Could not subscribe. Please try again.');
      }
    } catch (err) {
      setSubscribeError('Network error. Please check your connection.');
    } finally {
      setSubscribing(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-glow"></div>

      {/* =========================================
          NEWSLETTER & COMMUNITY (COMPACT & SLEEK)
          ========================================= */}
      <div className="footer-newsletter-wrap">
        <div className="container">
          <div className="newsletter-card">
            <div className="newsletter-content">
              <div className="newsletter-badge">
                <Sparkles size={13} className="badge-icon" />
                <span>Pure & Delight Newsletter</span>
              </div>
              <h3 className="newsletter-title">
                Experience Pure Tradition In Every Drop
              </h3>
              <p className="newsletter-desc">
                Subscribe for harvest updates, authentic Vedic recipes, lab purity reports, and special subscriber offers.
              </p>
              <div className="newsletter-trust-tags">
                <span><Leaf size={12} /> 100% Organic</span>
                <span><ShieldCheck size={12} /> Zero Chemicals</span>
                <span><HeartHandshake size={12} /> Direct Farm Fresh</span>
              </div>
            </div>

            <div className="newsletter-form-box">
              {isSubscribed ? (
                <div className="newsletter-success">
                  <CheckCircle2 size={22} className="success-icon" />
                  <span>{subscribeMsg || 'Thank you! Welcome to the Nuzvid Agri Farms family 🌿'}</span>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubscribe} className="newsletter-unified-form">
                    <Mail size={18} className="unified-mail-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setSubscribeError(''); }}
                      placeholder="Enter your email address..."
                      aria-label="Email Address for newsletter"
                      className={`unified-newsletter-input${subscribeError ? ' input-error' : ''}`}
                    />
                    <button 
                      type="submit" 
                      className="unified-newsletter-btn" 
                      disabled={subscribing}
                    >
                      <span>{subscribing ? 'Joining...' : 'Subscribe'}</span>
                      <Send size={14} className="btn-send-icon" />
                    </button>
                  </form>
                  {subscribeError && (
                    <p className="newsletter-error">{subscribeError}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          PURITY HIGHLIGHTS STRIP (COMPACT)
          ========================================= */}
      <div className="footer-highlights-bar">
        <div className="container">
          <div className="highlights-grid">
            <div className="highlight-pill">
              <Sprout className="pill-icon" size={17} />
              <span><strong>Native seed selection</strong></span>
            </div>
            <div className="highlight-pill">
              <Award className="pill-icon" size={17} />
              <span><strong>Traditional process</strong></span>
            </div>
            <div className="highlight-pill">
              <FileCheck2 className="pill-icon" size={17} />
              <span><strong>Lab Certified reports</strong></span>
            </div>
            <div className="highlight-pill">
              <PackageCheck className="pill-icon" size={17} />
              <span><strong>Food grade packing</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          MAIN SITEMAP & BRAND (BALANCED & PROPORTIONAL)
          ========================================= */}
      <div className="main-footer">
        <div className="container footer-grid">
          
          {/* Brand & Compact Contact Column */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo-link" onClick={scrollToTop}>
              <div className="footer-logo-box">
                <img 
                  src="/Nuzvid Agri Farms Logo.png" 
                  alt="Nuzvid Agri Farms" 
                  className="footer-logo-img" 
                />
              </div>
            </Link>
            
            <p className="brand-mission-text">
              Reviving Vedic food wisdom from the fertile soil of Nuzvid. Pure wood-pressed oils, 
              authentic A2 Bilona cow ghee, wild honey, and natural farm groceries.
            </p>

            <div className="compact-contact-block">
              <div className="contact-row">
                <MapPin size={15} className="contact-row-icon" />
                <span>19-55, Thummala Vari Street, Nuzvid, Eluru Dist, AP - 521201</span>
              </div>
              <div className="contact-row">
                <Phone size={15} className="contact-row-icon" />
                <a href="tel:+919985555525" className="contact-link">+91 99855 55525</a>
                <span className="contact-sep">|</span>
                <Mail size={15} className="contact-row-icon" />
                <a href="mailto:assist.naf@gmail.com" className="contact-link">assist.naf@gmail.com</a>
              </div>
              <div className="contact-row">
                <Clock size={15} className="contact-row-icon" />
                <span>Mon – Sat: 9:00 AM – 7:00 PM</span>
              </div>
            </div>
          </div>

          {/* Column 2: Farm Collections */}
          <div className="footer-col">
            <h4 className="col-heading">Our Collections</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/collections/all" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Wood-Pressed Oils</span>
                </Link>
              </li>
              <li>
                <Link to="/collections/all" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>A2 Vedic Bilona Ghee</span>
                </Link>
              </li>
              <li>
                <Link to="/collections/all" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Raw Forest Honey</span>
                </Link>
              </li>
              <li>
                <Link to="/collections/all" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Organic Jaggery & Sugar</span>
                </Link>
              </li>
              <li>
                <Link to="/collections/all" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Stone-Ground Spices</span>
                </Link>
              </li>
              <li>
                <Link to="/collections/all" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Himalayan Mineral Salt</span>
                </Link>
              </li>
              <li>
                <Link to="/collections/all" onClick={scrollToTop} className="footer-nav-link special-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Health Basket of the Month ✦</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: The Farm & Philosophy */}
          <div className="footer-col">
            <h4 className="col-heading">Our Heritage</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/about-us" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>About Our Farm</span>
                </Link>
              </li>
              <li>
                <Link to="/our-commitment" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Purity & Farmer Commitment</span>
                </Link>
              </li>
              <li>
                <Link to="/our-intro" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Our Vedic Story</span>
                </Link>
              </li>
              <li>
                <Link to="/blogs" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Health & Wellness Journal</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Visit Our Farm & Reach Out</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Care & Policies */}
          <div className="footer-col">
            <h4 className="col-heading">Customer Care</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/faqs" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Frequently Asked Questions</span>
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Shipping & Delivery Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Returns & Refund Guarantee</span>
                </Link>
              </li>
              <li>
                <Link to="/cancellation-policy" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Order Cancellation Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Privacy & Data Protection</span>
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" onClick={scrollToTop} className="footer-nav-link">
                  <ChevronRight size={13} className="nav-arrow" />
                  <span>Terms & Conditions</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* =========================================
          BOTTOM COPYRIGHT & UTILITY BAR (COMPACT)
          ========================================= */}
      <div className="copyright-bar">
        <div className="container copyright-inner">
          <p className="copy-text">
            &copy; {new Date().getFullYear()} <strong>Nuzvid Agri Farms</strong>. Pure Wood Pressed &amp; Vedic Living. All Rights Reserved.
          </p>

          <div className="footer-social-wrapper">
            <span className="social-label">Follow Us:</span>
            <div className="social-links-unique">
              <a 
                href="https://www.facebook.com/profile.php?id=61579403908868" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="social-bubble fb"
              >
                <FaFacebook size={14} />
                <span className="social-tooltip">Facebook</span>
              </a>
              <a 
                href="https://www.instagram.com/nuzvidagrifarms/" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="social-bubble ig"
              >
                <FaInstagram size={14} />
                <span className="social-tooltip">Instagram</span>
              </a>
              <a 
                href="https://www.youtube.com/@NuzvidAgriFarms" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="social-bubble yt"
              >
                <FaYoutube size={14} />
                <span className="social-tooltip">YouTube</span>
              </a>
              <a 
                href="https://wa.me/919985555525" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="social-bubble wa"
              >
                <FaWhatsapp size={14} />
                <span className="social-tooltip">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
