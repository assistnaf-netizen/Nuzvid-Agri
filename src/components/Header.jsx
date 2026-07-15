import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Heart } from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, isAdmin, logoutMock } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <button className="icon-btn" aria-label="Search">
              <Search size={22} />
            </button>
            
            {user ? (
              <div className="user-dropdown-container" style={{ position: 'relative' }}>
                <button 
                  className="icon-btn" 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  aria-label="User Account"
                  style={{ padding: '0 8px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '30px', height: '40px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '13px',
                    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
                  }}>
                    {(user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Hi, {(user?.user_metadata?.full_name || user?.email || '').split('@')[0]}
                  </span>
                </button>
                {isUserDropdownOpen && (
                  <div className="user-dropdown-menu" style={{ position: 'absolute', top: '100%', right: '0', background: 'white', padding: '10px 0', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '150px', zIndex: 100 }}>
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
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
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
