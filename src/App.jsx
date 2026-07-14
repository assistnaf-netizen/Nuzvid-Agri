import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import RefundPolicy from './pages/RefundPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import CancellationPolicy from './pages/CancellationPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import Commitment from './pages/Commitment';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyAccount from './pages/MyAccount';
import Wishlist from './pages/Wishlist';
import NotFound from './pages/NotFound';
import Dashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageBanners from './pages/admin/ManageBanners';
import ManageOrders from './pages/admin/ManageOrders';
import ManageCustomers from './pages/admin/ManageCustomers';
import ManageCoupons from './pages/admin/ManageCoupons';
import StoreSettings from './pages/admin/StoreSettings';
import ManageInventory from './pages/admin/ManageInventory';
import AdminAuth from './pages/admin/AdminAuth';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            fontSize: '16px',
            padding: '16px 24px',
            background: '#333',
            color: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          },
          duration: 3000,
        }}
        containerStyle={{ zIndex: 99999 }}
      />
      <Routes>
        {/* Client Routes with Standard Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/collections/all" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/our-commitment" element={<Commitment />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/account/*" element={<MyAccount />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Standalone Auth Routes (No Header/Footer) */}
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/admin/login" element={<AdminAuth />} />

        {/* Admin Routes with Admin Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="inventory" element={<ManageInventory />} />
          <Route path="banners" element={<ManageBanners />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="customers" element={<ManageCustomers />} />
          <Route path="coupons" element={<ManageCoupons />} />
          <Route path="settings" element={<StoreSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

