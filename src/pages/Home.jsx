import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { FaArrowRight, FaArrowLeft, FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
import { Award, Handshake, HeartHandshake, Truck } from 'lucide-react';
import { getProducts, getFallbackProducts } from '../services/productService';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import { blogsContent } from '../utils/blogData';
import './Home.css';
import './Home-premium.css';

const Home = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [heroBanners, setHeroBanners] = useState([{
    desktop: '/hero-banner.webp',
    mobile: '/hero-banner.webp'
  }]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState(() => getFallbackProducts());
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Curated products for ticker — clean product names without quantities (e.g. 1 Liter, 500 ml)
  const tickerProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const cleanTitle = (title) => {
      if (!title) return '';
      return title
        .replace(/[-–—]?\s*\d+(\.\d+)?\s*(liters?|litres?|ltr|l|ml|kgs?|gm?|grams?)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const priorityKeywords = [
      'safflower',
      'a2 cow ghee',
      'groundnut',
      'coconut',
      'sesame',
      'mustard',
      'buffalo',
      'honey',
      'turmeric',
      'jaggery'
    ];

    const selected = [];
    const addedNames = new Set();

    // 1. Add priority products (guarantees key wood-pressed staples appear, unique names)
    for (const kw of priorityKeywords) {
      const match = products.find(p => {
        const cleaned = cleanTitle(p.title);
        return p.title?.toLowerCase().includes(kw) && !addedNames.has(cleaned.toLowerCase());
      });
      if (match) {
        const cleaned = cleanTitle(match.title);
        selected.push({ ...match, tickerTitle: cleaned });
        addedNames.add(cleaned.toLowerCase());
      }
    }

    // 2. Fill remaining slots up to 10 products
    for (const p of products) {
      const cleaned = cleanTitle(p.title);
      if (!addedNames.has(cleaned.toLowerCase())) {
        selected.push({ ...p, tickerTitle: cleaned });
        addedNames.add(cleaned.toLowerCase());
      }
      if (selected.length >= 10) break;
    }

    return selected.length > 0 ? selected : products.map(p => ({ ...p, tickerTitle: cleanTitle(p.title) }));
  }, [products]);

  useEffect(() => {
    let isMounted = true;
    getProducts().then(data => {
      if (isMounted && data && data.length > 0) {
        setProducts(data);
      }
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      // Use localStorage first (instant)
      const localBanners = localStorage.getItem('hero_banners');
      if (localBanners) {
        try {
          const parsed = JSON.parse(localBanners);
          setHeroBanners(parsed.map(b => typeof b === 'string' ? { desktop: b, mobile: b } : b));
        } catch {}
      }

      // Then try Supabase with a strict 2s timeout (won't block UI)
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_banners')
          .single()
          .abortSignal(controller.signal);
        clearTimeout(timeout);
        if (data?.value) {
          const parsed = JSON.parse(data.value);
          const banners = parsed.map(b => typeof b === 'string' ? { desktop: b, mobile: b } : b);
          setHeroBanners(banners);
          localStorage.setItem('hero_banners', JSON.stringify(parsed));
        }
      } catch {
        // DB paused or timeout — already showing fallback/local banner, nothing to do
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [heroBanners]);

  const blogs = blogsContent;

  const blogScrollRef = useRef(null);

  const scrollBlogs = (direction) => {
    if (blogScrollRef.current) {
      const scrollAmount = blogScrollRef.current.offsetWidth / 2; // scroll by half container width
      blogScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const filteredProducts = products.filter(p => p.category === activeTab || activeTab === 'all');

  return (
    <div className="home-page">
      <SEO 
        title="Home" 
        description="Welcome to Nuzvid Agri Farms. Pure wood-pressed oils, A2 Ghee, and organic groceries from our farm to your table." 
        productSchema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://www.nuzvidagrifarms.com/#organization",
              "name": "Nuzvid Agri Farms",
              "url": "https://www.nuzvidagrifarms.com/",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.nuzvidagrifarms.com/cdn/shop/files/Nuzvid_logo_463bcf9e-fbf0-4e1b-9f12-2734584a22df.png"
              },
              "sameAs": [
                "https://www.facebook.com/profile.php?id=61579403908868",
                "https://www.instagram.com/nuzvidagrifarms/",
                "https://www.youtube.com/@NuzvidAgriFarms"
              ]
            },
            {
              "@type": "WebSite",
              "@id": "https://www.nuzvidagrifarms.com/#website",
              "url": "https://www.nuzvidagrifarms.com/",
              "name": "Nuzvid Agri Farms",
              "publisher": {
                "@id": "https://www.nuzvidagrifarms.com/#organization"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.nuzvidagrifarms.com/products?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          ]
        }}
      />
      {/* Hero Section */}
      <section className="hero-section">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="hero-background-wrapper"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            <div className="hero-background desktop-bg" style={{ backgroundImage: `url(${heroBanners[currentSlide]?.desktop})` }} />
            <div className="hero-background mobile-bg" style={{ backgroundImage: `url(${heroBanners[currentSlide]?.mobile})` }} />
          </motion.div>
        </AnimatePresence>

        {heroBanners.length > 1 && (
          <div className="hero-dots">
            {heroBanners.map((_, idx) => (
              <button
                key={idx}
                className={`hero-dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Product Ticker Section */}
      <div className="product-ticker-container">
        <div className="product-ticker-track">
          {[...tickerProducts, ...tickerProducts].map((product, index) => (
            <Link
              key={`${product.id || index}-${index}`}
              to={product.id ? `/product/${product.id}` : '#'}
              className="ticker-item"
            >
              <span className="ticker-bullet">✦</span> {product.tickerTitle || product.title}
            </Link>
          ))}
        </div>
      </div>

      {/* Promotional Banners Section (3 Cards) */}
      <motion.section
        className="promo-banners-section py-4"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container">
          <div className="promo-banners-grid">
            {/* Left Large Banner */}
            <div className="promo-banner-large hover-zoom">
              <Link to="/our-commitment" className="promo-img-link">
                <img src="https://www.nuzvidagrifarms.com/cdn/shop/files/our_commitment_1200x.jpg?v=1759857822" alt="Our Commitment" className="promo-bg-img" />
                <div className="banner-overlay"></div>
                <div className="banner-arrow-btn">
                  <FaArrowRight />
                </div>
              </Link>
            </div>

            {/* Right Stacked Banners */}
            <div className="promo-banners-stacked">
              <div className="promo-banner-small hover-zoom">
                <Link to="/about-us" className="promo-img-link">
                  <img src="https://www.nuzvidagrifarms.com/cdn/shop/files/ABOUT_US_1200x.jpg?v=1759149023" alt="About Us" className="promo-bg-img" />
                  <div className="banner-overlay"></div>
                  <div className="banner-arrow-btn">
                    <FaArrowRight />
                  </div>
                </Link>
              </div>

              <div className="promo-banner-small hover-zoom">
                <Link to="/our-intro" className="promo-img-link">
                  <img src="https://www.nuzvidagrifarms.com/cdn/shop/files/Our_Intro_1200x.jpg?v=1759857682" alt="Our Intro" className="promo-bg-img" />
                  <div className="banner-overlay"></div>
                  <div className="banner-arrow-btn">
                    <FaArrowRight />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Mid Banner Section */}
      <motion.section
        className="mid-banner-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <img
          src="/home-mid-banner.jpeg"
          alt="Nuzvid Agri Farms Highlights"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </motion.section>

      {/* The Goodness We Share */}
      <motion.section
        className="goodness-section py-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container">
          <h2 className="section-title text-center">The Goodness We Share</h2>
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              ALL
            </button>
            <button
              className={`tab-btn ${activeTab === 'wood-pressed-oils' ? 'active' : ''}`}
              onClick={() => setActiveTab('wood-pressed-oils')}
            >
              WOOD PRESSED OILS
            </button>
            <button
              className={`tab-btn ${activeTab === 'a2-ghee' ? 'active' : ''}`}
              onClick={() => setActiveTab('a2-ghee')}
            >
              GHEE
            </button>
            <button
              className={`tab-btn ${activeTab === 'natural-sweeteners' ? 'active' : ''}`}
              onClick={() => setActiveTab('natural-sweeteners')}
            >
              NATURAL SWEETNERS
            </button>
            <button
              className={`tab-btn ${activeTab === 'countryside-grocery' ? 'active' : ''}`}
              onClick={() => setActiveTab('countryside-grocery')}
            >
              COUNTRYSIDE GROCERY
            </button>
          </div>

          <div className="product-grid">
            {loadingProducts ? (
              <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="no-products">No products found in this category.</p>
            )}
          </div>
        </div>
      </motion.section>

      {/* Health Basket Banner */}
      <section className="health-basket-section">
        <div className="container position-relative">
          <div className="row">
            <div className="col-12">
              <div className="health-basket-content text-center">
                <h2 className="basket-subtitle">Health Basket of the Month</h2>
                <h1 className="basket-title">Your monthly pack of Pure Health<br /></h1>
                <p className="basket-desc">Smart Savings, and Traditional Goodness</p>
                <div className="btn-wrapper mt-4">
                  <Link to="/collections/all" className="basket-shop-btn">Shop now</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Absolutely positioned product composition image on the left */}
        <div className="basket-left-img">
          <img
            src="https://www.nuzvidagrifarms.com/cdn/shop/files/Monthly_banner_b0109ce9-ef11-4669-aab8-936a4c64223f_514x.png?v=1759637551"
            alt="Health Basket Collage"
          />
        </div>
      </section>

      {/* Video Hub */}
      <section className="video-hub py-4">
        <div className="container">
          <h2 className="section-title text-center">Experience Our Tradition</h2>
          <div className="video-container">
            <div className="video-placeholder position-relative overflow-hidden">
              <img
                src="/farm-video-thumbnail.png"
                alt="Farm to Table Showcase"
                className="w-100 h-100 object-fit-cover"
              />
            </div>
          </div>
        </div>
      </section>



      {/* Blog & Insights */}
      <motion.section
        className="blog-insights py-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
      >
        <div className="container position-relative">
          <h2 className="section-title text-center text-uppercase fw-bold" style={{ letterSpacing: '2px', color: '#333' }}>BLOG & INSIGHTS<span style={{ color: '#8B4513' }}>.</span></h2>
          <div className="blog-slider-container position-relative mt-4">

            <div className="blog-grid-scroll" ref={blogScrollRef}>
              {blogs.map(blog => (
                <div className="blog-card" key={blog.slug}>
                  <Link to={`/blogs/${blog.slug}`} className="blog-img-wrapper">
                    <img src={blog.image} alt={blog.title} />
                  </Link>
                  <div className="blog-content">
                    <h3 className="blog-title">
                      <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
                    </h3>
                    <Link to={`/blogs/${blog.slug}`} className="read-more-link">Read More</Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </motion.section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us py-4">
        <div className="container">
          <h2 className="section-title text-center text-uppercase fw-bold" style={{ letterSpacing: '2px', color: '#333' }}>Why Choose Us<span style={{ color: '#8B4513' }}>.</span></h2>
          <div className="features-grid mt-4">
            <div className="feature-card">
              <div className="feature-icon"><Award size={40} /></div>
              <h3>Quality Products</h3>
              <p>Every product is carefully selected to ensure safety, authenticity, and the highest quality.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Handshake size={40} /></div>
              <h3>Trust</h3>
              <p>We stand by every product, ensuring confidence in every purchase.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><HeartHandshake size={40} /></div>
              <h3>Health</h3>
              <p>Carefully chosen to promote true wellness and well-being.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Truck size={40} /></div>
              <h3>Free home delivery</h3>
              <p>Free delivery for all orders over ₹1999/-.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-4">
        <div className="container">
          <h2 className="section-title text-center text-uppercase fw-bold" style={{ letterSpacing: '2px', color: '#333' }}>What Our Customers Say<span style={{ color: '#8B4513' }}>.</span></h2>
          <div className="testimonials-scroll-container mt-4">
            <div className="testimonials-scroll-track">
              {/* Original 3 Cards */}
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => <FaStar key={i} color="#ffc107" />)}
                </div>
                <p className="testimonial-text">"The A2 Ghee from Nuzvid Agri Farms is incredibly authentic. The aroma takes me back to my childhood village!"</p>
                <h4 className="testimonial-author">- Priya S.</h4>
              </div>
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => <FaStar key={i} color="#ffc107" />)}
                </div>
                <p className="testimonial-text">"I've been using their wood-pressed groundnut oil for all my cooking. You can literally taste the purity."</p>
                <h4 className="testimonial-author">- Rahul M.</h4>
              </div>
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => <FaStar key={i} color="#ffc107" />)}
                </div>
                <p className="testimonial-text">"Excellent quality natural sweeteners. The forest honey is a staple in my morning tea now. Highly recommend!"</p>
                <h4 className="testimonial-author">- Anita K.</h4>
              </div>

              {/* Duplicated for Seamless Infinite Loop */}
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => <FaStar key={i} color="#ffc107" />)}
                </div>
                <p className="testimonial-text">"The A2 Ghee from Nuzvid Agri Farms is incredibly authentic. The aroma takes me back to my childhood village!"</p>
                <h4 className="testimonial-author">- Priya S.</h4>
              </div>
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => <FaStar key={i} color="#ffc107" />)}
                </div>
                <p className="testimonial-text">"I've been using their wood-pressed groundnut oil for all my cooking. You can literally taste the purity."</p>
                <h4 className="testimonial-author">- Rahul M.</h4>
              </div>
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => <FaStar key={i} color="#ffc107" />)}
                </div>
                <p className="testimonial-text">"Excellent quality natural sweeteners. The forest honey is a staple in my morning tea now. Highly recommend!"</p>
                <h4 className="testimonial-author">- Anita K.</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Viewed Products */}
      {(() => {
        const viewedIds = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
        if (viewedIds.length === 0) return null;

        const viewedProducts = viewedIds
          .map(id => products.find(p => p.id === id))
          .filter(Boolean)
          .slice(0, 4);
        if (viewedProducts.length === 0) return null;

        return (
          <section className="recently-viewed-section py-4" style={{ backgroundColor: '#f9fafb' }}>
            <div className="container">
              <h2 className="section-title text-center text-uppercase fw-bold" style={{ letterSpacing: '2px', color: '#333' }}>Recently Viewed<span style={{ color: '#8B4513' }}>.</span></h2>
              <div className="recently-viewed-grid">
                {viewedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        );
      })()}


    </div>
  );
};

export default Home;

