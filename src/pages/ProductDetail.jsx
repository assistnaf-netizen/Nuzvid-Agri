import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Heart, Check, ChevronRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import useSEO from '../hooks/useSEO';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  useSEO({
    title: product ? product.title : 'Loading Product...',
    description: product ? product.description : '',
    image: product ? product.image : undefined,
    type: 'product',
    productSchema: product ? {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.title,
      "image": product.image,
      "description": product.description,
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "INR",
        "price": product.price,
        "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    } : null
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) {
        const foundProduct = {
          id: data.id,
          title: data.name,
          price: data.price,
          mrp: data.original_price,
          category: data.category,
          image: data.image_url,
          hoverImage: data.image_url,
          description: data.description,
          isNew: data.is_featured,
          sale: data.is_featured,
          rating: 5.0,
          reviews: 12
        };
        setProduct(foundProduct);

        let recentlyViewed = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
        recentlyViewed = recentlyViewed.filter(pId => pId !== foundProduct.id);
        recentlyViewed.unshift(foundProduct.id);
        if (recentlyViewed.length > 4) recentlyViewed.pop();
        localStorage.setItem('recently_viewed', JSON.stringify(recentlyViewed));

        // Fetch related products
        const { data: relatedData } = await supabase.from('products').select('*').eq('category', data.category).neq('id', data.id).limit(4);
        if (relatedData) {
          setRelatedProducts(relatedData.map(rp => ({
             id: rp.id,
             title: rp.name,
             price: rp.price,
             mrp: rp.original_price,
             category: rp.category,
             image: rp.image_url,
             hoverImage: rp.image_url,
             description: rp.description,
             isNew: rp.is_featured,
             sale: rp.is_featured,
             rating: 5.0,
             reviews: 12
          })));
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="product-not-found" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#d68d3c', marginBottom: '20px' }} />
        <h2>Loading product...</h2>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <Link to="/collections/all" className="btn-primary mt-4">Return to Shop</Link>
      </div>
    );
  }

  const handleQuantityChange = (type) => {
    if (type === 'increment') setQuantity(q => q + 1);
    if (type === 'decrement' && quantity > 1) setQuantity(q => q - 1);
  };

  const handleAddToCart = () => {
    // We add the product, but CartContext would need to handle quantity eventually.
    // For now, we simulate adding the quantity.
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="detail-breadcrumb">
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#4b5563', fontWeight: 600, marginRight: '16px' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <Link to="/">Home</Link> <ChevronRight size={14} /> 
          <Link to="/collections/all">Products</Link> <ChevronRight size={14} /> 
          <span className="current">{product.title}</span>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row detail-main-row">
          
          {/* Left Column: Image Gallery */}
          <div className="col-lg-6 col-md-12">
            <div className="detail-gallery">
              <div className="detail-main-img-wrapper">
                {product.sale && <span className="detail-badge sale">Sale</span>}
                {product.isNew && <span className="detail-badge new">New</span>}
                <button 
                  className={`detail-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart size={24} fill={isWishlisted ? "var(--color-primary)" : "none"} color={isWishlisted ? "var(--color-primary)" : "#333"} />
                </button>
                <img src={product.image} alt={product.title} className="detail-main-img" />
              </div>
              
              {/* Optional thumbnails if we had multiple images, reusing the same image for demo */}
              <div className="detail-thumbnails">
                <div className="thumbnail active">
                  <img src={product.image} alt={product.title} />
                </div>
                {product.hoverImage && (
                  <div className="thumbnail">
                    <img src={product.hoverImage} alt={product.title} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="col-lg-6 col-md-12">
            <div className="detail-info">
              <h1 className="detail-title">{product.title}</h1>
              
              <div className="detail-rating-wrapper">
                <div className="detail-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < Math.floor(product.rating) ? "var(--color-secondary)" : "none"}
                      color={i < Math.floor(product.rating) ? "var(--color-secondary)" : "#ccc"}
                    />
                  ))}
                </div>
                <span className="detail-reviews">{product.reviews} reviews</span>
              </div>

              <div className="detail-price-wrapper">
                {product.mrp && product.mrp > product.price && (
                  <span className="detail-price-old">₹{product.mrp.toFixed(2)}</span>
                )}
                <span className="detail-price">₹{product.price.toFixed(2)}</span>
              </div>

              <p className="detail-short-desc">
                {product.description || "Premium quality product sourced directly from our farms to your home."}
              </p>

              <div className="detail-stock-status">
                <Check size={18} color="#2d7a5c" /> <span>In Stock & Ready to Ship</span>
              </div>

              {/* Add to Cart Area */}
              <div className="detail-action-area">
                <div className="quantity-selector">
                  <button onClick={() => handleQuantityChange('decrement')}>-</button>
                  <input type="text" value={quantity} readOnly />
                  <button onClick={() => handleQuantityChange('increment')}>+</button>
                </div>
                <button className="btn-primary detail-add-btn" onClick={handleAddToCart}>
                  <ShoppingBag size={20} /> Add to Cart
                </button>
              </div>

              {/* Guarantees */}
              <div className="detail-guarantees">
                <div className="guarantee-item">
                  <img src="https://cdn-icons-png.flaticon.com/512/2956/2956820.png" alt="Pure" width="30"/>
                  <span>100% Pure</span>
                </div>
                <div className="guarantee-item">
                  <img src="https://cdn-icons-png.flaticon.com/512/814/814513.png" alt="Shipping" width="30"/>
                  <span>Fast Delivery</span>
                </div>
                <div className="guarantee-item">
                  <img src="https://cdn-icons-png.flaticon.com/512/272/272290.png" alt="Secure" width="30"/>
                  <span>Secure Pay</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tabs */}
        <div className="detail-tabs-section mt-5">
          <div className="detail-tabs-nav">
            <button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>Description</button>
            <button className={activeTab === 'shipping' ? 'active' : ''} onClick={() => setActiveTab('shipping')}>Shipping & Returns</button>
            <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reviews ({product.reviews})</button>
          </div>
          
          <div className="detail-tab-content">
            {activeTab === 'description' && (
              <div className="tab-pane active fade-in">
                <p>Welcome to the finest quality products from Nuzvid Agri Farms. {product.description}</p>
                <p>Our commitment to purity and traditional practices ensures that every product reaching your kitchen is packed with natural nutrition and authentic flavor. All our ingredients are hand-picked, organically processed, and rigorously tested to meet our premium quality standards.</p>
                <ul>
                  <li>100% Natural and pure.</li>
                  <li>Sourced directly from farmers.</li>
                  <li>No added preservatives or chemicals.</li>
                  <li>Ethically produced with sustainable methods.</li>
                </ul>
              </div>
            )}
            
            {activeTab === 'shipping' && (
              <div className="tab-pane active fade-in">
                <h4>Shipping Information</h4>
                <p>We process all orders within 24 hours. Standard shipping takes 3-5 business days depending on your location.</p>
                <ul>
                  <li>Free shipping on orders over ₹1000.</li>
                  <li>Tracking number provided for all orders.</li>
                  <li>Secure and eco-friendly packaging.</li>
                </ul>
                <h4 className="mt-4">Returns Policy</h4>
                <p>If you are not 100% satisfied with your purchase, you can return the product and get a full refund or exchange the product for another one. You can return a product for up to 7 days from the date you purchased it.</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-pane active fade-in">
                <div className="d-flex align-items-center mb-4">
                  <h4 className="m-0 me-3">Customer Reviews</h4>
                  <div className="detail-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} fill="var(--color-secondary)" color="var(--color-secondary)" />
                    ))}
                  </div>
                  <span className="ms-2 fw-bold">{product.rating} out of 5</span>
                </div>
                
                <div className="reviews-list" style={{ marginBottom: '30px' }}>
                  <div className="review-item" style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ width: '40px', height: '40px', background: '#d68d3c', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>RS</div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1a1d2e' }}>Rahul Sharma</div>
                        <div style={{ display: 'flex', color: '#d68d3c' }}><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /></div>
                      </div>
                      <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9ca3af' }}>2 days ago</span>
                    </div>
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>Excellent quality! The taste is completely natural and authentic. Will definitely buy again.</p>
                  </div>
                  <div className="review-item" style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ width: '40px', height: '40px', background: '#10b981', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>PP</div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1a1d2e' }}>Priya Patel</div>
                        <div style={{ display: 'flex', color: '#d68d3c' }}><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} /></div>
                      </div>
                      <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9ca3af' }}>1 week ago</span>
                    </div>
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>Good packaging and fast delivery. Product is exactly as described.</p>
                  </div>
                </div>

                <div className="write-review-form" style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                  <h4 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>Write a Review</h4>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', color: '#d1d5db', cursor: 'pointer' }}>
                    <Star size={24} /><Star size={24} /><Star size={24} /><Star size={24} /><Star size={24} />
                  </div>
                  <textarea rows="4" placeholder="What did you think about this product?" style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '16px', outline: 'none', resize: 'vertical' }}></textarea>
                  <button className="btn-primary" onClick={() => alert('Review submitted!')}>Submit Review</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="related-products-section" style={{ marginTop: '60px', borderTop: '1px solid #e5e7eb', paddingTop: '40px', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '30px' }}>You May Also Like</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px' }}>
            {relatedProducts.map(relatedProduct => (
              <div key={relatedProduct.id} style={{ width: '100%', maxWidth: '280px' }}>
                <ProductCard product={relatedProduct} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
