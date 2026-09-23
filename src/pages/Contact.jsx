import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import './Contact.css';

const Contact = () => {
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Thank you! Your message has been sent successfully.");
      setFormData({ name: '', email: '', phone: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="contact-page-wrapper">
      <SEO title="Contact Us" description="Get in touch with Nuzvid Agri Farms for inquiries about our organic products, orders, or partnerships." />
      {/* Hero Banner */}
      <section className="contact-hero">
        <motion.div 
          className="contact-hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1>Connect With Our Farm</h1>
          <p>We'd love to hear from you. Let's start a conversation.</p>
        </motion.div>
      </section>

      {/* Main Content */}
      <motion.section 
        className="contact-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Side: Contact Information */}
        <motion.div className="contact-info-side" variants={itemVariants}>
          <h2>Get In Touch</h2>
          <p>Whether you have a question about our traditional farming practices, need help with an order, or just want to say hello, we are here for you.</p>

          <div className="info-item">
            <div className="info-icon-box">
              <MapPin size={24} />
            </div>
            <div className="info-details">
              <h4>Visit Our Farm</h4>
              <p>19-55, Thummala Vari Street<br/>Nuzvid, Eluru - AP</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon-box">
              <Phone size={24} />
            </div>
            <div className="info-details">
              <h4>Call Us</h4>
              <p>+91 (123) 456-7890</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon-box">
              <Mail size={24} />
            </div>
            <div className="info-details">
              <h4>Email Us</h4>
              <p>assist.naf@gmail.com</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon-box">
              <Clock size={24} />
            </div>
            <div className="info-details">
              <h4>Opening Hours</h4>
              <p>Monday - Saturday<br/>9:00 AM - 6:00 PM</p>
            </div>
          </div>

          <div className="contact-social">
            <h4>Follow Our Journey</h4>
            <div className="social-icons-wrapper">
              <a href="#" className="social-circle"><FaFacebook size={20} /></a>
              <a href="#" className="social-circle"><FaInstagram size={20} /></a>
              <a href="#" className="social-circle"><FaTwitter size={20} /></a>
            </div>
          </div>
        </motion.div>

        {/* Right Side: The Premium Form */}
        <motion.div className="contact-form-side" variants={itemVariants}>
          <h2>Send a Message</h2>
          <form className="premium-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <input 
                  type="text" 
                  name="name"
                  id="name"
                  className="floating-input" 
                  placeholder=" " 
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
                <label htmlFor="name" className="floating-label">Your Name</label>
              </div>
              <div className="form-group">
                <input 
                  type="email" 
                  name="email"
                  id="email"
                  className="floating-input" 
                  placeholder=" " 
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
                <label htmlFor="email" className="floating-label">Email Address</label>
              </div>
            </div>

            <div className="form-group">
              <input 
                type="tel" 
                name="phone"
                id="phone"
                className="floating-input" 
                placeholder=" "
                value={formData.phone}
                onChange={handleChange}
              />
              <label htmlFor="phone" className="floating-label">Phone Number (Optional)</label>
            </div>

            <div className="form-group">
              <textarea 
                name="message"
                id="message"
                className="floating-input" 
                placeholder=" " 
                required
                value={formData.message}
                onChange={handleChange}
              ></textarea>
              <label htmlFor="message" className="floating-label">How can we help you?</label>
            </div>

            <button type="submit" className="btn-submit-premium" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'} <Send size={18} />
            </button>
          </form>
        </motion.div>
      </motion.section>

      {/* Embedded Map Section */}
      <motion.section 
        className="map-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15278.487920390184!2d80.8354!3d16.7903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3674cfb1552a4b%3A0x6b45a0ed79b76b2!2sNuzvid%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1714493012893!5m2!1sen!2sin" 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Nuzvid Agri Farms Location Map"
        ></iframe>
      </motion.section>

    </div>
  );
};

export default Contact;

