import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getDisplayName } from '../utils/productUtils';
import './CartDrawer.css';

const FREE_SHIPPING_THRESHOLD = 3000;

const CartDrawer = () => {
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeFromCart, totalAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isCartOpen]);

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalAmount);
  const freeShippingProgress = Math.min(100, (totalAmount / FREE_SHIPPING_THRESHOLD) * 100);

  const handleCheckout = () => {
    closeCart();
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const handleViewCart = () => {
    closeCart();
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    closeCart();
    navigate('/products');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="cart-drawer-root">
          {/* Backdrop Overlay */}
          <motion.div
            className="cart-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            aria-label="Close cart drawer backdrop"
          />

          {/* Slide-in Drawer Container */}
          <motion.aside
            className="cart-drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            aria-modal="true"
            role="dialog"
            aria-label="Shopping Cart Drawer"
          >
            {/* Header */}
            <div className="cart-drawer-header">
              <div className="cart-drawer-title-wrap">
                <ShoppingBag size={20} className="cart-drawer-bag-icon" />
                <h2 className="cart-drawer-title">Your Cart</h2>
                <span className="cart-drawer-badge">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                className="cart-drawer-close-btn"
                onClick={closeCart}
                aria-label="Close cart"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Progress Meter */}
            <div className="cart-drawer-shipping-meter">
              <div className="cart-drawer-shipping-info">
                <Truck size={16} className="truck-icon" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Add <strong>₹{remainingForFreeShipping.toFixed(0)}</strong> more to get <strong>FREE Delivery</strong>
                  </span>
                ) : (
                  <span className="unlocked-text">
                    🎉 <strong>Congratulations! You unlocked FREE Delivery!</strong>
                  </span>
                )}
              </div>
              <div className="cart-drawer-progress-track">
                <div
                  className={`cart-drawer-progress-bar ${remainingForFreeShipping === 0 ? 'completed' : ''}`}
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* Drawer Body / Items List */}
            <div className="cart-drawer-body">
              {cartItems.length === 0 ? (
                <div className="cart-drawer-empty">
                  <div className="cart-drawer-empty-icon-wrap">
                    <ShoppingBag size={52} />
                  </div>
                  <h3>Your cart is empty</h3>
                  <p>Discover pure, unrefined & wholesome farm products fresh from our farms.</p>
                  <button className="cart-drawer-shop-btn" onClick={handleContinueShopping}>
                    Explore Our Farm
                  </button>
                </div>
              ) : (
                <div className="cart-drawer-items-list">
                  {cartItems.map((item) => {
                    const itemId = item.cartItemId || item.id;
                    const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);

                    return (
                      <div key={itemId} className="cart-drawer-item">
                        <div className="cart-drawer-item-img-wrap">
                          <img
                            src={item.image || 'https://placehold.co/120x120/f9fafb/9ca3af?text=NAF'}
                            alt={item.title}
                            className="cart-drawer-item-img"
                            loading="lazy"
                          />
                        </div>

                        <div className="cart-drawer-item-content">
                          <div className="cart-drawer-item-top">
                            <h4 className="cart-drawer-item-name" title={item.title}>
                              {getDisplayName(item.title)}
                            </h4>
                            <button
                              className="cart-drawer-item-remove"
                              onClick={() => removeFromCart(itemId)}
                              title="Remove item"
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {item.weight && (
                            <span className="cart-drawer-item-weight">
                              Weight/Size: <strong>{item.weight}</strong>
                            </span>
                          )}

                          <div className="cart-drawer-item-bottom">
                            <div className="cart-drawer-qty-selector">
                              <button
                                className="qty-btn"
                                onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                aria-label="Decrease quantity"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="qty-number">{item.quantity}</span>
                              <button
                                className="qty-btn"
                                onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                aria-label="Increase quantity"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            <div className="cart-drawer-item-price-col">
                              <span className="cart-drawer-item-price">
                                ₹{itemTotal.toFixed(2)}
                              </span>
                              {item.quantity > 1 && (
                                <span className="cart-drawer-unit-price">
                                  ₹{Number(item.price).toFixed(2)} each
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {cartItems.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-drawer-summary-row">
                  <span className="subtotal-label">Subtotal</span>
                  <span className="subtotal-value">₹{totalAmount.toFixed(2)}</span>
                </div>

                <p className="cart-drawer-tax-note">
                  Shipping & taxes calculated at checkout.
                </p>

                <div className="cart-drawer-actions">
                  <button className="cart-drawer-checkout-btn" onClick={handleCheckout}>
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={18} />
                  </button>

                  <button className="cart-drawer-view-btn" onClick={handleViewCart}>
                    View Full Cart
                  </button>
                </div>

                <div className="cart-drawer-trust-badge">
                  <ShieldCheck size={16} />
                  <span>100% Pure Vedic Quality • Direct Farm Delivery</span>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
