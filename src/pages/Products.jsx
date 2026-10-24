import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2, Search, LayoutGrid, CheckCircle2, IndianRupee } from 'lucide-react';
import { getProducts, getFallbackProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { getDisplayName, getCategoryDisplayName } from '../utils/productUtils';
import './Products.css';

const Products = () => {
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState(() => getFallbackProducts());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getProducts().then(data => {
      if (isMounted && data && data.length > 0) {
        setProducts(data);
      }
    });

    const handleUpdate = (e) => {
      if (isMounted && e.detail && e.detail.length > 0) {
        setProducts(e.detail);
      }
    };
    window.addEventListener('naf_products_updated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('naf_products_updated', handleUpdate);
    };
  }, []);

  const location = useLocation();

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('search');
    if (q) {
      setSearchKeyword(q);
      setCategory('All');
      setMinPrice('');
      setMaxPrice('');
    } else {
      setSearchKeyword('');
    }
    window.scrollTo(0, 0);
  }, [location.search]);

  // Derive categories and counts with curated display order
  const categories = useMemo(() => {
    const counts = { 'All': products.length };
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    // Curated customer-friendly order
    const preferredOrder = [
      'All',
      'wood-pressed-oils',
      'a2-ghee',
      'natural-sweeteners',
      'countryside-grocery'
    ];

    const sortedCats = {};
    for (const key of preferredOrder) {
      if (counts[key] !== undefined) {
        sortedCats[key] = counts[key];
      }
    }

    for (const key of Object.keys(counts)) {
      if (sortedCats[key] === undefined) {
        sortedCats[key] = counts[key];
      }
    }

    return sortedCats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const query = searchKeyword.toLowerCase();

    // Search term filtering
    if (query) {
      result = result.filter(p =>
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
      );
    }

    // Category
    if (category !== 'All') {
      result = result.filter(p => p.category === category);
    }

    // Price
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) result = result.filter(p => p.price >= min);
    if (!isNaN(max)) result = result.filter(p => p.price <= max);

    // In stock filter
    if (inStockOnly) {
      result = result.filter(p => (p.stock_quantity ?? 100) > 0);
    }

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
  }, [products, category, minPrice, maxPrice, sortOrder, inStockOnly, searchKeyword]);

  const searchParams = new URLSearchParams(location.search);
  const activeSearchQuery = searchParams.get('search');

  return (
    <div className="products-page">
      <SEO 
        title="Buy Wood Pressed Oils & Pure A2 Desi Cow Ghee Online"
        description="Explore 100% natural stone-ground wood pressed oils, Vedic bilona A2 cow ghee, raw forest honey, organic jaggery, and chemical-free groceries. Direct farm delivery across India."
        keywords="buy wood pressed oil online, cold pressed groundnut oil, sesame oil, coconut oil, A2 bilona ghee, pure cow ghee, raw forest honey, organic groceries online"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Products', path: '/products' }
        ]}
      />

      {/* Banner */}
      <div className="products-banner">
        <img
          src="/Our_Intro_1200x.webp"
          alt="Products Banner"
          className="banner-img"
        />
        <div className="banner-breadcrumb-text">
          Home &nbsp;|&nbsp; <span className="active-crumb">{searchKeyword ? `Search Results for "${searchKeyword}"` : 'Products'}</span>
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
            {/* Search */}
            <div className="sidebar-widget">
              <div className="sidebar-widget-header">
                <span className="widget-title">
                  <Search size={16} className="widget-icon" /> Search
                </span>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ width: '100%', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '14px', marginTop: '10px' }}
              />
            </div>

            {/* Categories */}
            <div className="sidebar-widget">
              <div className="sidebar-widget-header">
                <span className="widget-title">
                  <LayoutGrid size={16} className="widget-icon" /> Categories
                </span>
              </div>
              <ul className="widget-list">
                {Object.entries(categories).map(([catName, count]) => (
                  <li key={catName}>
                    <button
                      onClick={() => setCategory(catName)}
                      className={`category-btn ${category === catName ? 'active' : ''}`}
                    >
                      <span className="category-name">{getCategoryDisplayName(catName)}</span>
                      <span className="category-count">({count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Availability */}
            <div className="sidebar-widget">
              <div className="sidebar-widget-header">
                <span className="widget-title">
                  <CheckCircle2 size={16} className="widget-icon" /> Availability
                </span>
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
                <span className="widget-title">
                  <IndianRupee size={15} className="widget-icon" /> Price
                </span>
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
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>
                <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', margin: '0 auto', color: '#d68d3c' }} />
                <p style={{ marginTop: '16px' }}>Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
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

