import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      {/* Value Proposition Grid */}
      <div className="value-prop-section">
        <div className="container value-prop-grid">
          <div className="value-item">
            <h4>Quality Products</h4>
            <p>100% natural and pure</p>
          </div>
          <div className="value-item">
            <h4>Trust</h4>
            <p>Directly from farmers</p>
          </div>
          <div className="value-item">
            <h4>Health</h4>
            <p>No added chemicals</p>
          </div>
          <div className="value-item">
            <h4>Free Home Delivery</h4>
            <p>On orders over ₹1,999/-</p>
          </div>
        </div>
      </div>

      {/* Main Sitemap Footer */}
      <div className="main-footer">
        <div className="container footer-grid">
          {/* Column 1 */}
          <div className="footer-col brand-col">
            <img src="https://www.nuzvidagrifarms.com/cdn/shop/files/Nuzvid_logo_463bcf9e-fbf0-4e1b-9f12-2734584a22df.png" alt="Nuzvid Agri Farms" className="footer-logo-img" />
            <div className="contact-info">
              <p><MapPin size={16} /> 19-55, Thummala Vari Street, Nuzvid, Eluru District, AP - 521201</p>
              <p><Phone size={16} /> +91 99855 55525</p>
              <p><Mail size={16} /> assist.naf@gmail.com</p>
            </div>
            <div className="social-links">
              <a href="https://www.facebook.com/profile.php?id=61579403908868" target="_blank" rel="noopener noreferrer"><FaFacebook size={18} /></a>
              <a href="https://www.instagram.com/nuzvidagrifarms/" target="_blank" rel="noopener noreferrer"><FaInstagram size={18} /></a>
              <a href="https://www.youtube.com/@NuzvidAgriFarms" target="_blank" rel="noopener noreferrer"><FaYoutube size={18} /></a>
            </div>
          </div>

          {/* Column 2 */}
          <div className="footer-col">
            <h3>Company</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Our Products</Link></li>
              <li><Link to="/about-us">About Us</Link></li>
              <li><Link to="/our-commitment">Our Commitment</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/faqs">FAQs</Link></li>
              <li><Link to="#">Certifications</Link></li>
              <li><Link to="/blogs">Blog</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="footer-col">
            <h3>Customer Care</h3>
            <ul>
              <li><Link to="/refund-policy">Refund Policy</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions">Terms & Conditions</Link></li>
              <li><Link to="/cancellation-policy">Cancellation Policy</Link></li>
              <li><Link to="/shipping-policy">Shipping Policy</Link></li>
            </ul>
          </div>

          {/* Column 5 */}
          <div className="footer-col newsletter-col">
            <h3>Stay Updated</h3>
            <p>Subscribe to get updates on new products and special offers.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="email@example.com" required />
              <button type="submit" className="btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="copyright-bar">
        <div className="container copyright-inner">
          <p>&copy; {new Date().getFullYear()} Nuzvid Agri Farms. All Rights Reserved.</p>
          <div className="payment-icons">
            {/* Dummy Payment text since we don't have images */}
            <span>Visa | UPI | GPay | RuPay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
