import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaEye, FaShoppingCart, FaHeart } from 'react-icons/fa';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import useSEO from '../hooks/useSEO';
import './Products.css';

const Products = () => {
  useSEO({ title: 'Shop All Products', description: 'Browse our wide range of premium organic food products, cold pressed oils, and A2 Ghee.' });
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Derive categories and counts
  const categories = useMemo(() => {
    const cats = { 'All': products.length };
    products.forEach(p => {
      cats[p.category] = (cats[p.category] || 0) + 1;
    });
    return cats;
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category
    if (category !== 'All') {
      result = result.filter(p => p.category === category);
    }

    // Stock
    // Since we don't have stock data in mock yet, let's assume all are in stock, or filter randomly. 
    // We'll skip actual stock filtering until we have real DB data.

    // Price
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) result = result.filter(p => p.price >= min);
    if (!isNaN(max)) result = result.filter(p => p.price <= max);

    // Sorting
    switch (sortOrder) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'alpha-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'alpha-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'date-desc':
        result.sort((a, b) => b.id - a.id);
        break;
      default:
        break; // featured (original order)
    }

    return result;
  }, [category, minPrice, maxPrice, sortOrder, inStockOnly]);

  return (
    <div className="products-page">

      {/* Banner */}
      <div className="products-banner">
        <img
          src="https://www.nuzvidagrifarms.com/cdn/shop/files/Our_Intro_1200x.jpg?v=1759857682"
          alt="Products Banner"
          className="banner-img"
        />
        <div className="banner-breadcrumb-text">
          Home &nbsp;|&nbsp; <span className="active-crumb">Products</span>
        </div>
      </div>

      {/* Page Body */}
      <div className="products-body">

        <aside className="products-sidebar">
          <button 
            className="mobile-filter-toggle"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          >
            {isMobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </button>

          <div className={`sidebar-content ${isMobileFilterOpen ? 'open' : ''}`}>
            {/* Categories */}
            <div className="sidebar-widget">
            <div className="sidebar-widget-header">
              <span className="widget-title"><span className="dash-mark">--</span><span className="dot-mark">·</span> Categories</span>
            </div>
            <ul className="widget-list">
              {Object.entries(categories).map(([catName, count]) => (
                <li key={catName}>
                  <button 
                    onClick={() => setCategory(catName)}
                    className={`category-btn ${category === catName ? 'active' : ''}`}
                  >
                    <span className="category-name">{catName}</span>
                    <span className="category-count">({count})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Availability */}
          <div className="sidebar-widget">
            <div className="sidebar-widget-header">
              <span className="widget-title"><span className="dash-mark">--</span><span className="dot-mark">·</span> Availability</span>
            </div>
            <ul className="widget-list">
              <li>
                <label className="checkbox-label">
                  <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
                  <span>In Stock</span>
                </label>
              </li>
            </ul>
          </div>

          {/* Price */}
          <div className="sidebar-widget">
            <div className="sidebar-widget-header">
              <span className="widget-title"><span className="dash-mark">--</span><span className="dot-mark">·</span> Price</span>
            </div>
            <div className="price-range-box">
              <div className="price-row">
                <div className="price-col">
                  <label className="price-label">From ₹</label>
                  <input type="number" placeholder="0" className="price-input-box" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                </div>
                <div className="price-col">
                  <label className="price-label">To ₹</label>
                  <input type="number" placeholder="5000" className="price-input-box" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
          </div>

        </aside>

        {/* RIGHT CONTENT */}
        <div className="products-main">

          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="toolbar-left">
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Showing {filteredProducts.length} results</span>
            </div>
            <div className="toolbar-center">
              <select className="sort-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="featured">Sort by: Featured</option>
                <option value="alpha-asc">Alphabetically, A-Z</option>
                <option value="alpha-desc">Alphabetically, Z-A</option>
                <option value="price-asc">Price, low to high</option>
                <option value="price-desc">Price, high to low</option>
                <option value="date-desc">Date, new to old</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="products-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>
                <h3>No products match your criteria.</h3>
                <button onClick={() => { setCategory('All'); setMinPrice(''); setMaxPrice(''); }} className="btn-primary" style={{ marginTop: '16px' }}>Clear Filters</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Products;

