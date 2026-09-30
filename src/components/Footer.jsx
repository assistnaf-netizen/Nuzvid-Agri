import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import FallingCrystals from './FallingCrystals';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <FallingCrystals />
      <div className="footer-glow"></div>
      {/* Main Sitemap Footer */}
      <div className="main-footer">
        <div className="container footer-grid">
          {/* Column 1 */}
          <div className="footer-col brand-col">
            <img src="https://www.nuzvidagrifarms.com/cdn/shop/files/Nuzvid_logo_463bcf9e-fbf0-4e1b-9f12-2734584a22df.png" alt="Nuzvid Agri Farms" className="footer-logo-img" />
            <div className="contact-info">
              <p><MapPin size={16} className="contact-icon"/> 19-55, Thummala Vari Street, Nuzvid, Eluru District, AP - 521201</p>
              <p><Phone size={16} className="contact-icon"/> +91 99855 55525</p>
              <p><Mail size={16} className="contact-icon"/> assist.naf@gmail.com</p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="footer-col">
            <h3>Company</h3>
            <ul>
              <li><Link to="/" data-text="Home">Home</Link></li>
              <li><Link to="/products" data-text="Our Products">Our Products</Link></li>
              <li><Link to="/about-us" data-text="About Us">About Us</Link></li>
              <li><Link to="/our-commitment" data-text="Our Commitment">Our Commitment</Link></li>
              <li><Link to="/contact" data-text="Contact">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/faqs" data-text="FAQs">FAQs</Link></li>
              <li><Link to="#" data-text="Certifications">Certifications</Link></li>
              <li><Link to="/blogs" data-text="Blog">Blog</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="footer-col">
            <h3>Customer Care</h3>
            <ul>
              <li><Link to="/refund-policy" data-text="Refund Policy">Refund Policy</Link></li>
              <li><Link to="/privacy-policy" data-text="Privacy Policy">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" data-text="Terms & Conditions">Terms & Conditions</Link></li>
              <li><Link to="/cancellation-policy" data-text="Cancellation Policy">Cancellation Policy</Link></li>
              <li><Link to="/shipping-policy" data-text="Shipping Policy">Shipping Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar & Socials */}
      <div className="copyright-bar">
        <div className="container copyright-inner">
          <p className="copy-text">&copy; {new Date().getFullYear()} Nuzvid Agri Farms. All Rights Reserved.</p>
          <div className="social-links-compact">
            <a href="https://www.facebook.com/profile.php?id=61579403908868" target="_blank" rel="noopener noreferrer"><FaFacebook size={16} /></a>
            <a href="https://www.instagram.com/nuzvidagrifarms/" target="_blank" rel="noopener noreferrer"><FaInstagram size={16} /></a>
            <a href="https://www.youtube.com/@NuzvidAgriFarms" target="_blank" rel="noopener noreferrer"><FaYoutube size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
