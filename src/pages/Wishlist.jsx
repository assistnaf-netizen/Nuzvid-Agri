import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import './Wishlist.css';

const Wishlist = () => {
  
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="wishlist-page">
      <SEO title="My Wishlist" description="View your saved products at Nuzvid Agri Farms." />
      {/* Breadcrumb */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">My Wishlist</h1>
          <div className="breadcrumb">
            <Link to="/">Home</Link> <ChevronRight size={14} /> 
            <span className="current">Wishlist</span>
          </div>
        </div>
      </div>

      <div className="container pb-5">
        {wishlistItems.length === 0 ? (
          <motion.div 
            className="empty-wishlist text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="empty-wishlist-icon"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <Heart size={54} strokeWidth={1.5} />
            </motion.div>
            <h2>Your Wishlist is Empty</h2>
            <p>You haven't saved any items yet. Start exploring our premium products to build your collection!</p>
            <Link to="/collections/all" className="btn-primary empty-wishlist-btn">
              Explore Products
            </Link>
          </motion.div>
        ) : (
          <div className="wishlist-grid">
            <AnimatePresence>
              {wishlistItems.map((item, i) => (
                <motion.div 
                  key={item.id}
                  className="wishlist-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <div className="wishlist-card-img">
                    <Link to={`/products/${item.id}`}>
                      <img src={item.image} alt={item.title} />
                    </Link>
                    <button 
                      className="btn-remove-wishlist"
                      onClick={() => removeFromWishlist(item.id)}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="wishlist-card-content">
                    <Link to={`/products/${item.id}`} className="wishlist-card-title">
                      {item.title}
                    </Link>
                    <div className="wishlist-card-price">
                      <span className="current-price">₹{item.price.toLocaleString()}</span>
                      {(item.mrp && item.mrp > item.price) && (
                        <span className="original-price">₹{item.mrp.toLocaleString()}</span>
                      )}
                    </div>
                    <button 
                      className="btn-add-cart w-100"
                      onClick={() => addToCart(item)}
                    >
                      <ShoppingCart size={16} /> Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

