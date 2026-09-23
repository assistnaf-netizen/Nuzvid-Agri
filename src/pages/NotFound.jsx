import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import './NotFound.css';

const NotFound = () => {
  
  return (
    <div className="not-found-page">
      <SEO title="Page Not Found" description="The page you are looking for does not exist." />
      <div className="container text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="not-found-code">404</div>
          <h1 className="not-found-title">Oops! Page Not Found</h1>
          <p className="not-found-desc">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          
          <div className="not-found-actions">
            <Link to="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Home size={18} /> Go to Homepage
            </Link>
            <Link to="/collections/all" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', color: '#27130F', border: '1px solid #27130F' }}>
              <ShoppingBag size={18} /> Shop Products
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;

