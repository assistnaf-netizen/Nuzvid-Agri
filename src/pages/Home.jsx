import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { FaArrowRight, FaArrowLeft, FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
import { Leaf, Truck, ShieldCheck, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import useSEO from '../hooks/useSEO';
import './Home.css';

const Home = () => {
  useSEO({ title: 'Home', description: 'Welcome to Nuzvid Agri Farms. Pure wood-pressed oils, A2 Ghee, and organic groceries from our farm to your table.' });
  const [activeTab, setActiveTab] = useState('wood-pressed-oils');
  const [heroBanners, setHeroBanners] = useState([{
    desktop: 'https://www.nuzvidagrifarms.com/cdn/shop/files/new_1920x.jpg?v=1759635977',
    mobile: 'https://www.nuzvidagrifarms.com/cdn/shop/files/new_1920x.jpg?v=1759635977'
  }]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (data) {
        setProducts(data.map(p => ({
          id: p.id,
          title: p.name,
          price: p.price,
          mrp: p.original_price,
          category: p.category,
          image: p.image_url,
          hoverImage: p.image_url,
          description: p.description,
          isNew: p.is_featured,
          sale: p.is_featured
        })));
      }
      setLoadingProducts(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('value').eq('key', 'hero_banners').single();
        if (data?.value) {
          const parsed = JSON.parse(data.value);
          setHeroBanners(parsed.map(b => typeof b === 'string' ? { desktop: b, mobile: b } : b));
        } else {
          const localBanners = localStorage.getItem('hero_banners');
          if (localBanners) {
            const parsed = JSON.parse(localBanners);
            setHeroBanners(parsed.map(b => typeof b === 'string' ? { desktop: b, mobile: b } : b));
          }
        }
      } catch (error) {
        const localBanners = localStorage.getItem('hero_banners');
        if (localBanners) {
          const parsed = JSON.parse(localBanners);
          setHeroBanners(parsed.map(b => typeof b === 'string' ? { desktop: b, mobile: b } : b));
        }
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

  const blogs = [
    {
      id: 'brown-sugar',
      image: "https://www.nuzvidagrifarms.com/cdn/shop/articles/Organic_Brown_sugar_370x.png?v=1759230994",
      link: "/blogs/brown-sugar"
    },
    {
      id: 'buffalo-ghee',
      image: "https://www.nuzvidagrifarms.com/cdn/shop/articles/NAF-FL1-BufaloGhee_370x.jpg?v=1759150769",
      link: "/blogs/buffalo-ghee"
    },
    {
      id: 'mineral-salt',
      image: "https://www.nuzvidagrifarms.com/cdn/shop/articles/NAF-FL-MineralSalt_370x.jpg?v=1759150645",
      link: "/blogs/mineral-salt"
    },
    {
      id: 'real-food',
      image: "https://www.nuzvidagrifarms.com/cdn/shop/articles/Flier_370x.jpg?v=1759298285",
      link: "/blogs/real-food"
    },
    {
      id: 'red-chilli',
      image: "https://www.nuzvidagrifarms.com/cdn/shop/articles/NAF-FL-RedChilliPowder_370x.jpg?v=1759150731",
      link: "/blogs/red-chilli"
    },
    {
      id: 'turmeric',
      image: "https://www.nuzvidagrifarms.com/cdn/shop/articles/NAF-FL-Turmeric_370x.jpg?v=1759150715",
      link: "/blogs/turmeric"
    },
    {
      id: 'jaggery',
      image: "https://www.nuzvidagrifarms.com/cdn/shop/articles/NAF-FL-Jaggery_370x.jpg?v=1759150700",
      link: "/blogs/jaggery"
    },
    {
      id: 'coldpressed-oils',
      image: "https://www.nuzvidagrifarms.com/cdn/shop/articles/NAF-FL-Oils_370x.jpg?v=1759150787",
      link: "/blogs/coldpressed-oils"
    },
    {
      id: 'a2-ghee',
      image: "https://www.nuzvidagrifarms.com/cdn/shop/articles/NAF-FL1-A2GHEE_370x.jpg?v=1759150680",
      link: "/blogs/a2-ghee"
    },
    {
      id: 'forest-honey',
      image: "https://www.nuzvidagrifarms.com/cdn/shop/articles/NAF-FL-Honey_fde9b232-10fa-4e95-8e25-5d109399ddf9_370x.jpg?v=1759150454",
      link: "/blogs/forest-honey"
    }
  ];

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
          {[...products, ...products].map((product, index) => (
            <span key={index} className="ticker-item">
              <span className="ticker-bullet">✦</span> {product.title}
            </span>
          ))}
        </div>
      </div>

      {/* Promotional Banners Section (3 Cards) */}
      <section className="promo-banners-section py-4">
        <div className="container">
          <div className="promo-banners-grid">
            {/* Left Large Banner */}
            <div className="promo-banner-large">
              <Link to="/our-commitment" className="promo-img-link">
                <img src="https://www.nuzvidagrifarms.com/cdn/shop/files/our_commitment_1200x.jpg?v=1759857822" alt="Our Commitment" className="promo-bg-img" />
                <div className="banner-arrow-btn">
                  <FaArrowRight />
                </div>
              </Link>
            </div>

            {/* Right Stacked Banners */}
            <div className="promo-banners-stacked">
              <div className="promo-banner-small">
                <Link to="/about-us" className="promo-img-link">
                  <img src="https://www.nuzvidagrifarms.com/cdn/shop/files/ABOUT_US_1200x.jpg?v=1759149023" alt="About Us" className="promo-bg-img" />
                  <div className="banner-arrow-btn">
                    <FaArrowRight />
                  </div>
                </Link>
              </div>

              <div className="promo-banner-small">
                <Link to="/our-intro" className="promo-img-link">
                  <img src="https://www.nuzvidagrifarms.com/cdn/shop/files/Our_Intro_1200x.jpg?v=1759857682" alt="Our Intro" className="promo-bg-img" />
                  <div className="banner-arrow-btn">
                    <FaArrowRight />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Goodness We Share */}
      <section className="goodness-section py-4">
        <div className="container">
          <h2 className="section-title text-center">The Goodness We Share</h2>
          <div className="tabs">
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
              A2 GHEE
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
            <button
              className={`tab-btn ${activeTab === 'market-products' ? 'active' : ''}`}
              onClick={() => setActiveTab('market-products')}
            >
              MARKET PRODUCTS
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
      </section>

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
      <section className="blog-insights py-4">
        <div className="container position-relative">
          <h2 className="section-title text-center text-uppercase fw-bold" style={{ letterSpacing: '2px', color: '#333' }}>BLOG & INSIGHTS<span style={{ color: '#8B4513' }}>.</span></h2>
          <div className="blog-slider-container position-relative mt-4">

            <div className="blog-grid-scroll" ref={blogScrollRef}>
              {blogs.map(blog => (
                <div className="blog-card" key={blog.id}>
                  <Link to={blog.link} className="blog-img-wrapper">
                    <img src={blog.image} alt={blog.id} />
                  </Link>
                  <div className="blog-content">
                    <h3 className="blog-title">
                      <Link to={blog.link}>{blog.title}</Link>
                    </h3>
                    <Link to={blog.link} className="read-more-link">Read More</Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us py-4">
        <div className="container">
          <h2 className="section-title text-center text-uppercase fw-bold" style={{ letterSpacing: '2px', color: '#333' }}>Why Choose Us<span style={{ color: '#8B4513' }}>.</span></h2>
          <div className="features-grid mt-4">
            <div className="feature-card">
              <div className="feature-icon"><Leaf size={40} /></div>
              <h3>100% Organic</h3>
              <p>Grown without synthetic pesticides or harmful fertilizers.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Award size={40} /></div>
              <h3>Premium Quality</h3>
              <p>Carefully handpicked and processed to retain maximum nutrition.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><ShieldCheck size={40} /></div>
              <h3>Lab Tested</h3>
              <p>Every batch is rigorously tested to ensure purity and safety.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Truck size={40} /></div>
              <h3>Fast Delivery</h3>
              <p>Direct from our farm to your doorstep in pristine condition.</p>
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

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container text-center">
          <h2>Join Our Farm Family</h2>
          <p>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
          <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }}>
            <input type="email" placeholder="Enter your email address" required />
            <button type="submit" className="btn-primary">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;

