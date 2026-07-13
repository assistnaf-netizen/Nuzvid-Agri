import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSEO from '../hooks/useSEO';
import './Cart.css';

const Cart = () => {
  useSEO({ title: 'Your Cart', description: 'Review the items in your shopping cart before checkout.' });
  const { cartItems, removeFromCart, updateQuantity, totalAmount } = useCart();
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
    exit: { x: -50, opacity: 0, transition: { duration: 0.2 } }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page-wrapper">
        <div className="cart-container">
          <motion.div 
            className="cart-empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ShoppingBag size={80} className="cart-empty-icon" />
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added any of our fresh products to your cart yet.</p>
            <Link to="/products" className="btn-primary" style={{ padding: '15px 40px', borderRadius: '50px', fontSize: '16px' }}>
              Explore Our Farm
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <div className="cart-container">
        
        <div className="cart-header" style={{ position: 'relative', textAlign: 'center' }}>
          <button 
            onClick={() => navigate(-1)} 
            className="cart-back-btn"
            style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#4b5563', fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> <span className="back-text">Back</span>
          </button>
          <h1 style={{ margin: 0 }}>Shopping Cart</h1>
        </div>
        
        <div className="cart-content-grid">
          {/* Left Side: Items */}
          <div className="cart-items-section">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <AnimatePresence>
                {cartItems.map(item => {
                  const itemId = item.cartItemId || item.id;
                  return (
                  <motion.div key={itemId} className="cart-item-card" variants={itemVariants} exit="exit">
                    <img src={item.image} alt={item.title} className="cart-item-image" />
                    
                    <div className="cart-item-details">
                      <h3>{item.title}</h3>
                      {item.weight && <span style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Size/Weight: {item.weight}</span>}
                      <p className="cart-item-price">₹{item.price}</p>
                    </div>
                    
                    <div className="cart-quantity-controls">
                      <button className="qty-btn" onClick={() => updateQuantity(itemId, item.quantity - 1)}>-</button>
                      <span className="qty-display">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(itemId, item.quantity + 1)}>+</button>
                    </div>
                    
                    <div className="cart-item-total">
                      ₹{item.price * item.quantity}
                    </div>
                    
                    <button className="cart-remove-btn" onClick={() => removeFromCart(itemId)} title="Remove Item">
                      <Trash2 size={22} />
                    </button>
                  </motion.div>
                )})}
              </AnimatePresence>
            </motion.div>
          </div>
          
          {/* Right Side: Summary */}
          <div className="cart-summary-section">
            <motion.div 
              className="cart-summary-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Calculated at next step</span>
              </div>
              
              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
              
              <button className="btn-checkout" onClick={() => navigate('/checkout')}>
                Proceed to Checkout <ArrowRight size={20} />
              </button>
              
              <div className="secure-checkout-msg">
                <ShieldCheck size={16} /> Secure Checkout
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Cart;

