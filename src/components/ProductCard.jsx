import React, { useState, useEffect } from 'react';
import { Star, Heart, ShoppingBag, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const isWishlisted = isInWishlist(product.id);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);

  // Initialize selected variant to the first variant if available
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  // Reset or update selected variant when product changes
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product.id, product.variants]);

  // Dynamic pricing based on active weight variant
  const currentPrice = selectedVariant?.price !== undefined
    ? Number(selectedVariant.price)
    : Number(product.price);

  const currentMrp = (selectedVariant?.mrp || selectedVariant?.original_price) !== undefined
    ? Number(selectedVariant.mrp || selectedVariant.original_price)
    : (product.mrp ? Number(product.mrp) : (product.original_price ? Number(product.original_price) : currentPrice));

  const currentWeight = selectedVariant?.weight || product.weight;
  const discountPercent = currentMrp > currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0;

  const handleAddToCart = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addToCart({
      ...product,
      price: currentPrice,
      mrp: currentMrp,
      weight: currentWeight,
      cartItemId: `${product.id}-${currentWeight}`,
      stock_quantity: selectedVariant?.stock_quantity ?? product.stock_quantity ?? 100
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };
  
  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <div className="product-badges">
          {product.isNew && <span className="badge new">New</span>}
          {discountPercent > 0 && <span className="badge sale">{discountPercent}% OFF</span>}
        </div>
        <button 
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label="Add to wishlist"
        >
          <Heart size={18} fill={isWishlisted ? "var(--color-primary)" : "none"} color={isWishlisted ? "var(--color-primary)" : "#333"} />
        </button>

        <Link 
          to={`/product/${product.id}`} 
          style={{ display: 'block', width: '100%', height: '100%' }}
          onMouseEnter={() => setIsCardHovered(true)}
        >
          <img 
            src={product.image || 'https://placehold.co/600x600/f9fafb/9ca3af?text=No+Image'} 
            alt={product.title} 
            className="primary-img" 
            loading="lazy" 
            decoding="async"
            width="400"
            height="400"
          />
          {product.hoverImage && product.hoverImage !== product.image && isCardHovered ? (
            <img 
              src={product.hoverImage} 
              alt={product.title} 
              className="hover-img" 
              loading="lazy" 
              decoding="async"
              width="400"
              height="400"
            />
          ) : null}
        </Link>
        
        <div className="product-actions">
          <button 
            type="button"
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
        <h3 className="product-title">
          <Link to={`/product/${product.id}`}>{product.title}</Link>
        </h3>
        
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
          <span className="review-count">({product.reviews ?? 15})</span>
        </div>

        {/* Interactive Weight Variants Selection */}
        {product.variants && product.variants.length > 0 && (
          <div className="product-variant-selector" onClick={(e) => e.stopPropagation()}>
            {product.variants.map((v, idx) => {
              const isSelected = selectedVariant ? selectedVariant.weight === v.weight : idx === 0;
              return (
                <button
                  key={v.weight || idx}
                  type="button"
                  className={`variant-btn ${isSelected ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVariant(v);
                  }}
                  title={`${v.weight} — ₹${v.price}`}
                >
                  {v.weight}
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Price Display */}
        <div className="product-price-wrapper">
          {currentMrp > currentPrice && (
            <span className="product-mrp">₹{currentMrp.toFixed(2)}</span>
          )}
          <span className="product-price">₹{currentPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
