import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Heart } from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartItems } = useCart();
  const { user, isAdmin, logoutMock } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Products', path: '/products' },
    { name: 'About Us', path: '/about-us' },
    { name: 'Our Commitment', path: '/our-commitment' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = async () => {
    logoutMock();
    await supabase.auth.signOut();
    setIsUserDropdownOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <div className="top-bar-left">
            <span>assist.naf@gmail.com</span>
            <span className="separator">|</span>
            <span>Nuzvid, Eluru District, AP</span>
          </div>
          <div className="top-bar-right">
            <a href="#"><FaFacebook size={14} /></a>
            <a href="#"><FaInstagram size={14} /></a>
            <a href="#"><FaYoutube size={14} /></a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="main-nav-wrapper">
        <div className="container main-nav">
          <Link to="/" className="logo">
            <img src="https://www.nuzvidagrifarms.com/cdn/shop/files/Nuzvid_logo_463bcf9e-fbf0-4e1b-9f12-2734584a22df.png" alt="Nuzvid Agri Farms" className="logo-img" />
          </Link>

          {/* Desktop Nav */}
          <nav className="desktop-nav">
            <ul>
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={location.pathname === link.path ? 'active' : ''}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-actions">
            <Link to="/products" className="btn-primary shop-now-btn">Shop Now</Link>
            <button className="icon-btn" aria-label="Search" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search size={22} />
            </button>
            
            {user ? (
              <div className="user-dropdown-container" style={{ position: 'relative' }}>
                <button 
                  className="user-greeting-btn" 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  aria-label="User Account"
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '13px', flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
                  }}>
                    {(user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="user-greeting-text">
                    Hi, {(user?.user_metadata?.full_name || user?.email || '').split('@')[0]}
                  </span>
                </button>
                {isUserDropdownOpen && (
                  <div className="user-dropdown-menu">
                    <Link to="/account" onClick={() => setIsUserDropdownOpen(false)} style={{ display: 'block', padding: '10px 20px', color: '#333', textDecoration: 'none' }}>My Account</Link>
                    <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 20px', color: '#ff4d4f', border: 'none', background: 'none', cursor: 'pointer' }}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="icon-btn" aria-label="Login">
                <User size={22} />
              </Link>
            )}

            <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
              <Heart size={22} />
              {/* If you wanted a count: wishlistItems.length > 0 && <span className="cart-count">{wishlistItems.length}</span> */}
            </Link>

            <Link to="/cart" className="icon-btn" aria-label="Shopping Cart">
              <ShoppingCart size={22} />
              {cartItems.reduce((acc, item) => acc + item.quantity, 0) > 0 && (
                <span className="cart-count">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>
            <button 
              className="icon-btn mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar Dropdown */}
      <div className={`search-bar-container ${isSearchOpen ? 'open' : ''}`}>
        <form className="search-bar-form" onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            placeholder="Search for organic jaggery, honey, oils..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className="search-submit-btn" aria-label="Submit Search">
            <Search size={20} />
          </button>
          <button type="button" className="search-close-btn" onClick={() => setIsSearchOpen(false)} aria-label="Close Search">
            <X size={20} />
          </button>
        </form>
      </div>

      {/* Mobile Nav */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul>
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className={location.pathname === link.path ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/products" className="btn-primary mobile-shop-btn" onClick={() => setIsMobileMenuOpen(false)}>
              Shop Now
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
