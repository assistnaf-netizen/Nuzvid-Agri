import React, { useState } from 'react';
import { Star, Heart, ShoppingBag, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };
  
  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <div className="product-badges">
          {product.isNew && <span className="badge new">New</span>}
          {product.sale && <span className="badge sale">Sale</span>}
        </div>
        <button 
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={() => setIsWishlisted(!isWishlisted)}
          aria-label="Add to wishlist"
        >
          <Heart size={18} fill={isWishlisted ? "var(--color-primary)" : "none"} color={isWishlisted ? "var(--color-primary)" : "#333"} />
        </button>

        <img src={product.image} alt={product.title} className="primary-img" />
        {product.hoverImage && (
          <img src={product.hoverImage} alt={product.title} className="hover-img" />
        )}
        
        <div className="product-actions">
          <button 
            className="action-btn cart-btn" 
            onClick={handleAddToCart} 
            title="Add to Cart"
            style={{ backgroundColor: addedToCart ? '#2e7d32' : '', color: addedToCart ? '#fff' : '' }}
          >
            <ShoppingBag size={18} />
            <span>{addedToCart ? 'Added!' : 'Add to Cart'}</span>
          </button>
          <Link to={`/product/${product.id}`} className="action-btn details-btn" title="View Details">
            <Eye size={18} />
          </Link>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <div className="product-rating">
          {[...Array(5)].map((_, i) => {
            const ratingValue = product.rating ?? 5;
            return (
              <Star
                key={i}
                size={14}
                fill={i < Math.floor(ratingValue) ? "#FFC107" : "none"}
                color={i < Math.floor(ratingValue) ? "#FFC107" : "#ccc"}
              />
            );
          })}
          <span className="review-count">({product.reviews ?? 0})</span>
        </div>
        <div className="product-price-wrapper">
          {product.mrp && product.mrp > product.price && (
            <span className="product-mrp">₹{product.mrp.toFixed(2)}</span>
          )}
          <span className="product-price">₹{product.price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
