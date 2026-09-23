import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, MapPin, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import './OrderSuccess.css';

const OrderSuccess = () => {
  
  const location = useLocation();
  const orderData = location.state || {};
  const orderId = orderData.orderId || `ORD-${Date.now().toString().slice(-6)}`;
  const total = orderData.total || 0;
  const address = orderData.address || 'Your saved address';
  const paymentMethod = orderData.paymentMethod || 'cod';

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const steps = [
    { label: 'Order Placed', done: true, active: true },
    { label: 'Processing',   done: false, active: false },
    { label: 'Shipped',      done: false, active: false },
    { label: 'Delivered',    done: false, active: false },
  ];

  return (
    <div className="order-success-page">
      <SEO title="Order Confirmation" description="Thank you for your order from Nuzvid Agri Farms." />
      <div className="order-success-container">

        {/* Success Animation */}
        <motion.div
          className="success-icon-wrapper"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        >
          <div className="success-icon-ring">
            <CheckCircle size={64} color="#10b981" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="success-title">Order Placed Successfully!</h1>
          <p className="success-subtitle">
            Thank you for shopping with <strong>Nuzvid Agri Farms</strong>. 
            Your order has been confirmed and will be processed shortly.
          </p>
        </motion.div>

        {/* Order ID Card */}
        <motion.div className="order-id-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="order-id-label">Your Order ID</div>
          <div className="order-id-value">{orderId}</div>
          <div className="order-id-hint">Save this for tracking your order</div>
        </motion.div>

        {/* Order Summary Strip */}
        <motion.div className="order-summary-strip" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="strip-item">
            <Package size={20} />
            <div>
              <div className="strip-label">Order Total</div>
              <div className="strip-value">₹{total.toLocaleString()}</div>
            </div>
          </div>
          <div className="strip-divider" />
          <div className="strip-item">
            <MapPin size={20} />
            <div>
              <div className="strip-label">Delivery To</div>
              <div className="strip-value">{address.length > 40 ? address.substring(0, 40) + '...' : address}</div>
            </div>
          </div>
          <div className="strip-divider" />
          <div className="strip-item">
            <ShoppingBag size={20} />
            <div>
              <div className="strip-label">Payment</div>
              <div className="strip-value">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</div>
            </div>
          </div>
        </motion.div>

        {/* Order Tracking Steps */}
        <motion.div className="tracking-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h3 className="tracking-title">Order Tracking</h3>
          <div className="tracking-steps">
            {steps.map((step, i) => (
              <div key={step.label} className="tracking-step-wrapper">
                <div className={`tracking-dot ${step.done ? 'done' : ''} ${step.active ? 'active' : ''}`}>
                  {step.done ? <CheckCircle size={16} /> : <span>{i + 1}</span>}
                </div>
                <div className={`tracking-label ${step.active ? 'active' : ''}`}>{step.label}</div>
                {i < steps.length - 1 && <div className={`tracking-line ${step.done ? 'done' : ''}`} />}
              </div>
            ))}
          </div>
          <p className="tracking-eta">Estimated delivery: <strong>3–5 business days</strong></p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div className="success-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Link to="/account/orders" className="btn-track-order">
            Track My Order <ArrowRight size={18} />
          </Link>
          <Link to="/products" className="btn-continue-shopping">
            Continue Shopping
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default OrderSuccess;

