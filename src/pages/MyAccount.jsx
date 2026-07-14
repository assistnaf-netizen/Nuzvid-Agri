import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Phone, Mail, Edit3, Save, LogOut, ChevronRight, ShoppingBag, Heart, Lock, Key, Copy, Download, Printer, Eye, CheckCircle, Clock, Truck, CreditCard, RefreshCcw, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useSEO from '../hooks/useSEO';
import './Account.css';

const STATUS_COLORS = {
  Delivered:  { bg: '#ecfdf5', color: '#10b981' },
  Shipped:    { bg: '#eff6ff', color: '#3b82f6' },
  Processing: { bg: '#fffbeb', color: '#f59e0b' },
  Pending:    { bg: '#fef2f2', color: '#ef4444' },
};

const MyAccount = () => {
  useSEO({ title: 'My Account', description: 'Manage your Nuzvid Agri Farms profile and orders.' });
  const { user, logoutMock } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleBuyAgain = (item) => {
    addToCart({
      id: item.id,
      title: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
    toast.success(`${item.name} added to cart!`);
  };

  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: 800; color: #0f172a; }
            .meta { font-size: 13px; color: #64748b; text-align: right; line-height: 1.5; }
            .section { margin-top: 30px; }
            .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #94a3b8; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; letter-spacing: 0.5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .address-box, .payment-box { font-size: 13px; line-height: 1.6; color: #334155; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
            td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; }
            .total-row { font-weight: 600; font-size: 13px; }
            .grand-total { font-size: 18px; color: #16a34a; font-weight: 800; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">NUZVID AGRI FARMS</div>
              <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Premium Quality Agricultural Products</div>
            </div>
            <div class="meta">
              <strong>Invoice #:</strong> ${order.id}<br/>
              <strong>Date:</strong> ${order.date}<br/>
              <strong>Status:</strong> ${order.status}
            </div>
          </div>
          <div class="section grid">
            <div class="address-box">
              <div class="section-title">Shipping Details</div>
              <strong>${profile.fullName}</strong><br/>
              ${order.address}
            </div>
            <div class="payment-box">
              <div class="section-title">Payment Method</div>
              <strong>${order.paymentMethod}</strong><br/>
              Status: Paid in full<br/>
              Transaction ID: ${order.paymentId || 'N/A'}
            </div>
          </div>
          <div class="section">
            <div class="section-title">Ordered Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>₹${item.price.toLocaleString()}</td>
                    <td>${item.qty}</td>
                    <td>₹${(item.price * item.qty).toLocaleString()}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; border: none; padding-top: 20px;">Subtotal:</td>
                  <td style="border: none; padding-top: 20px;">₹${(order.total - (order.total > 3000 ? 0 : 100)).toLocaleString()}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; border: none;">Shipping:</td>
                  <td style="border: none;">₹${(order.total > 3000 ? 0 : 100).toLocaleString()}</td>
                </tr>
                <tr class="total-row grand-total">
                  <td colspan="3" style="text-align: right; border: none;">Grand Total:</td>
                  <td style="border: none;">₹${order.total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="footer">
            Thank you for shopping with Nuzvid Agri Farms!<br/>
            For support, contact support@nuzvidagrifarms.com
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  
  const [profile, setProfile] = useState({
    fullName: user?.user_metadata?.full_name || 'Guest User',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    address: user?.user_metadata?.address || '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data && !error) {
        setProfile(prev => ({
          ...prev,
          fullName: data.full_name || prev.fullName,
          phone: data.phone || prev.phone,
          address: data.address || prev.address
        }));
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const fetchOrders = async () => {
    try {
      // Use backend API (service role) to bypass RLS issues
      const params = new URLSearchParams();
      if (user.id) params.set('user_id', user.id);
      else if (user.email) params.set('email', user.email);
      
      const res = await fetch(`/api/get-orders?${params.toString()}`);
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || 'Failed to fetch orders');
      
      const data = json.orders;

      const formatted = data.map(o => {
        const firstItem = o.order_items?.[0];
        const extraItems = o.order_items?.length > 1 ? ` (+${o.order_items.length - 1} items)` : '';
        const productName = firstItem ? `${firstItem.product_title}${extraItems}` : 'Order';
        
        return {
          id: o.display_id,
          date: new Date(o.created_at).toLocaleDateString(),
          total: Number(o.total_amount),
          status: o.status,
          items: o.order_items ? o.order_items.length : 0,
          productName,
          address: o.shipping_address,
          paymentMethod: o.payment_method,
          trackingId: o.status === 'Shipped' || o.status === 'Delivered' ? 'AWB...' : 'Pending',
          orderItems: o.order_items?.map(item => ({
            id: item.product_id,
            name: item.product_title,
            qty: item.quantity,
            price: Number(item.price_at_time),
            image: item.product_image
          })) || []
        };
      });
      
      setOrders(formatted);
    } catch (err) {
      console.error('Failed to fetch user orders', err);
    }

  };

  if (!user) {
    return (
      <div className="account-gate">
        <div className="account-gate-content">
          <User size={64} color="#d68d3c" strokeWidth={1.5} />
          <h2>Please Login to View Your Account</h2>
          <p>Sign in to manage your profile, view orders, and more.</p>
          <Link to="/login?redirect=/account" className="account-gate-btn">Login / Sign Up</Link>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: profile.fullName,
        phone: profile.phone,
        address: profile.address,
        created_at: new Date()
      });
      if (error) throw error;
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match!');
      return;
    }
    toast.success('Password changed successfully! (Mock)');
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const handleLogout = async () => {
    logoutMock();
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const TABS = [
    { id: 'profile', label: 'My Profile',  icon: <User size={18}/> },
    { id: 'orders',  label: 'My Orders',   icon: <Package size={18}/> },
    { id: 'address', label: 'Addresses',   icon: <MapPin size={18}/> },
    { id: 'security',label: 'Security',    icon: <Lock size={18}/> },
  ];

  return (
    <div className="account-page">
      <div className="account-container">

        {/* Sidebar */}
        <aside className="account-sidebar">
          <div className="account-profile-card">
            <div className="account-avatar">
              {profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div className="account-name">{profile.fullName}</div>
              <div className="account-email">{profile.email}</div>
            </div>
          </div>

          <nav className="account-nav">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`account-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.icon} {tab.label}
                <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
              </button>
            ))}
            <Link to="/wishlist" className="account-nav-item">
              <Heart size={18}/> My Wishlist <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
            </Link>
          </nav>

          <button onClick={handleLogout} className="account-logout-btn">
            <LogOut size={16}/> Sign Out
          </button>
        </aside>

        {/* Main Content */}
        <main className="account-main">
          
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="account-card-header">
                <h2 className="account-section-title"><User size={20}/>Personal Information</h2>
                <button className={`account-edit-btn ${editing ? 'saving' : ''}`} onClick={editing ? handleSave : () => setEditing(true)}>
                  {editing ? <><Save size={15}/> Save Changes</> : <><Edit3 size={15}/> Edit Profile</>}
                </button>
              </div>

              <div className="profile-form-grid">
                {[
                  { label: 'Full Name',    field: 'fullName', icon: <User size={16}/> },
                  { label: 'Email',        field: 'email',    icon: <Mail size={16}/> },
                  { label: 'Phone',        field: 'phone',    icon: <Phone size={16}/> },
                ].map(({ label, field, icon }) => (
                  <div key={field} className="profile-field">
                    <label className="profile-field-label">{icon} {label}</label>
                    {editing ? (
                      <input
                        className="profile-field-input"
                        value={profile[field]}
                        onChange={e => setProfile(p => ({ ...p, [field]: e.target.value }))}
                      />
                    ) : (
                      <div className="profile-field-value">{profile[field] || <span style={{ color: '#9ca3af' }}>Not set</span>}</div>
                    )}
                  </div>
                ))}

                <div className="profile-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="profile-field-label"><MapPin size={16}/> Default Address</label>
                  {editing ? (
                    <textarea
                      className="profile-field-input"
                      rows={3}
                      value={profile.address}
                      onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                    />
                  ) : (
                    <div className="profile-field-value">{profile.address || <span style={{ color: '#9ca3af' }}>No address saved</span>}</div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="account-stats-row">
                <div className="account-stat">
                  <ShoppingBag size={22} color="#d68d3c"/>
                  <div className="account-stat-value">{orders.length}</div>
                  <div className="account-stat-label">Total Orders</div>
                </div>
                <div className="account-stat">
                  <span style={{ fontSize: '22px' }}>₹</span>
                  <div className="account-stat-value">{orders.reduce((a,o) => a+o.total, 0).toLocaleString()}</div>
                  <div className="account-stat-label">Total Spent</div>
                </div>
                <div className="account-stat">
                  <Heart size={22} color="#ef4444"/>
                  <div className="account-stat-value">0</div>
                  <div className="account-stat-label">Wishlisted</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="account-card-header">
                <h2 className="account-section-title"><Package size={20}/>Order History</h2>
              </div>

              <div className="orders-list">
                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <Package size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
                    <p>You haven't placed any orders yet.</p>
                    <Link to="/products" className="account-gate-btn" style={{ display: 'inline-block', marginTop: '16px' }}>Start Shopping</Link>
                  </div>
                ) : (
                  orders.map(order => {
                  const sc = STATUS_COLORS[order.status] || {};
                  return (
                    <div key={order.id} className="order-row">
                      <div style={{ minWidth: '120px' }}>
                        <div className="order-id">{order.id}</div>
                        <div className="order-date">Placed on {order.date}</div>
                      </div>
                      <div className="order-product-info" style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1d2e', marginBottom: '4px' }}>{order.productName}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} color="#9ca3af" /> {order.address}
                        </div>
                      </div>
                      <div className="order-items-count" style={{ minWidth: '60px', textAlign: 'center' }}>{order.items} item{order.items > 1 ? 's' : ''}</div>
                      <div style={{ fontWeight: 700, color: '#1a1d2e' }}>₹{order.total.toLocaleString()}</div>
                      <span className="order-status-badge" style={{ background: sc.bg, color: sc.color }}>{order.status}</span>
                      <button onClick={() => setSelectedOrder(order)} className="order-view-btn">View →</button>
                    </div>
                  );
                }))}
              </div>

            </motion.div>
          )}

          {/* Redesigned Order Details Modal — teleports to document.body */}
          {ReactDOM.createPortal(
            <AnimatePresence>
              {selectedOrder && (
                <div className="premium-modal-overlay" onClick={() => setSelectedOrder(null)}>
                  <motion.div 
                    className="premium-modal"
                    onClick={e => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 25 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Premium White Sticky Header */}
                    <div className="premium-modal-header">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                            Order {selectedOrder.id}
                          </h2>
                          <button 
                            onClick={() => handleCopy(selectedOrder.id, 'Order ID')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '6px', transition: 'background 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseOut={e => e.currentTarget.style.background = 'none'}
                          >
                            <Copy size={12} /> Copy ID
                          </button>

                          <span className={`badge-pill ${
                            selectedOrder.status === 'Delivered' ? 'badge-delivered' :
                            selectedOrder.status === 'Shipped' ? 'badge-shipped' :
                            selectedOrder.status === 'Processing' ? 'badge-processing' :
                            selectedOrder.status === 'Cancelled' ? 'badge-cancelled' : 'badge-pending'
                          }`}>
                            {selectedOrder.status === 'Delivered' && <CheckCircle size={12} />}
                            {selectedOrder.status === 'Shipped' && <Truck size={12} />}
                            {selectedOrder.status === 'Processing' && <Clock size={12} />}
                            {selectedOrder.status === 'Cancelled' && <RefreshCcw size={12} />}
                            {selectedOrder.status === 'Pending' && <Clock size={12} />}
                            {selectedOrder.status}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                          <span>Placed on <strong>{selectedOrder.date}</strong></span>
                          <span>•</span>
                          <span>Est. Delivery: <strong>3 - 5 Business Days</strong></span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                          onClick={() => handlePrint(selectedOrder)}
                          className="account-edit-btn" 
                          style={{ margin: 0, padding: '8px 14px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}
                        >
                          <Printer size={14} /> Print Invoice
                        </button>
                        <button 
                          onClick={() => setSelectedOrder(null)}
                          style={{ background: '#f1f5f9', border: 'none', color: '#475569', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, transition: 'all 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                          onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}
                        >×</button>
                      </div>
                    </div>

                    {/* Scrollable Modal Content */}
                    <div className="premium-modal-body">
                      
                      {/* 1. Top Summary Cards (4 Equal Cards) */}
                      <div className="summary-cards-grid">
                        {[
                          { label: 'Total Amount', value: `₹${selectedOrder.total.toLocaleString()}`, icon: <DollarSign size={20} color="#16a34a"/>, bg: '#dcfce7', accent: '#16a34a' },
                          { label: 'Payment Status', value: selectedOrder.paymentMethod === 'COD' ? 'Pending' : 'Paid', icon: <CheckCircle size={20} color="#059669"/>, bg: '#d1fae5', accent: '#059669' },
                          { label: 'Items Ordered', value: `${selectedOrder.items} Item${selectedOrder.items > 1 ? 's' : ''}`, icon: <ShoppingBag size={20} color="#2563eb"/>, bg: '#dbeafe', accent: '#2563eb' },
                          { label: 'Payment Method', value: selectedOrder.paymentMethod || 'Razorpay', icon: <CreditCard size={20} color="#7c3aed"/>, bg: '#f3e8ff', accent: '#7c3aed' }
                        ].map((c, i) => (
                          <div key={i} className="summary-card">
                            <div className="summary-card-icon" style={{ background: c.bg }}>
                              {c.icon}
                            </div>
                            <div className="summary-card-details">
                              <span className="summary-card-label">{c.label}</span>
                              <span className="summary-card-value">{c.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 2. Horizontal Timeline (Amazon style) */}
                      <div className="timeline-container">
                        <div className="timeline-title">
                          <Clock size={18} color="#2563eb" /> Order Tracking Timeline
                        </div>
                        {selectedOrder.status === 'Cancelled' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#fee2e2', borderRadius: '12px', color: '#b91c1c', fontSize: '14px', fontWeight: 600 }}>
                            <RefreshCcw size={18} /> This order was Cancelled.
                          </div>
                        ) : (
                          <div className="timeline-stepper">
                            {/* Horizontal Connecting Line */}
                            <div className="timeline-line">
                              <div className="timeline-line-progress" style={{ 
                                width: selectedOrder.status === 'Delivered' ? '100%' :
                                       selectedOrder.status === 'Shipped' ? '80%' :
                                       selectedOrder.status === 'Processing' ? '40%' : '15%'
                              }} />
                            </div>

                            {[
                              { label: 'Order Placed', time: selectedOrder.date, desc: 'Receipt generated', completed: true, active: false },
                              { label: 'Payment Success', time: selectedOrder.date, desc: 'Verified securely', completed: true, active: false },
                              { label: 'Processing', time: selectedOrder.date, desc: 'Under review', completed: selectedOrder.status !== 'Pending', active: selectedOrder.status === 'Pending' },
                              { label: 'Packed', time: selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered' ? selectedOrder.date : '', desc: 'Ready for pickup', completed: selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered', active: selectedOrder.status === 'Processing' },
                              { label: 'Shipped', time: selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered' ? selectedOrder.date : '', desc: 'In transit', completed: selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered', active: false },
                              { label: 'Out for Delivery', time: selectedOrder.status === 'Delivered' ? selectedOrder.date : '', desc: 'Arriving soon', completed: selectedOrder.status === 'Delivered', active: selectedOrder.status === 'Shipped' },
                              { label: 'Delivered', time: selectedOrder.status === 'Delivered' ? selectedOrder.date : '', desc: 'Handed over', completed: selectedOrder.status === 'Delivered', active: false }
                            ].map((step, idx) => {
                              const stepClass = step.completed ? 'completed' : step.active ? 'active' : '';
                              return (
                                <div key={idx} className={`timeline-step ${stepClass}`}>
                                  <div className="timeline-circle">
                                    {step.completed ? '✓' : idx + 1}
                                  </div>
                                  <span className="timeline-label">{step.label}</span>
                                  {step.time && <span className="timeline-time">{step.time}</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* 3. Detailed Information Cards Grid (3 Columns) */}
                      <div className="info-cards-grid">
                        
                        {/* Profile Info */}
                        <div className="info-card">
                          <div className="info-card-header">
                            <div className="info-card-icon" style={{ background: '#f3e8ff' }}>
                              <User size={16} color="#7c3aed" />
                            </div>
                            <span className="info-card-title">Customer Details</span>
                          </div>
                          <div className="info-card-content" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '14px' }}>
                              {(profile.fullName || 'UN').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#1e293b' }}>{profile.fullName}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{profile.email}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{profile.phone || 'No phone set'}</div>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="info-card">
                          <div className="info-card-header" style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="info-card-icon" style={{ background: '#ffedd5' }}>
                                <MapPin size={16} color="#ea580c" />
                              </div>
                              <span className="info-card-title">Shipping Address</span>
                            </div>
                            <button 
                              onClick={() => handleCopy(selectedOrder.address, 'Shipping address')}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '2px' }}
                              title="Copy Address"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                          <div className="info-card-content">
                            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{profile.fullName}</div>
                            <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                              {selectedOrder.address}
                            </div>
                            <div style={{ marginTop: '12px' }}>
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.address)}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ color: '#2563eb', fontWeight: 600, fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                View on Google Maps ↗
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Payment Info */}
                        <div className="info-card">
                          <div className="info-card-header" style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="info-card-icon" style={{ background: '#dcfce7' }}>
                                <CreditCard size={16} color="#16a34a" />
                              </div>
                              <span className="info-card-title">Payment Info</span>
                            </div>
                            {selectedOrder.paymentId && (
                              <button 
                                onClick={() => handleCopy(selectedOrder.paymentId, 'Payment ID')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '2px' }}
                                title="Copy Payment ID"
                              >
                                <Copy size={14} />
                              </button>
                            )}
                          </div>
                          <div className="info-card-content">
                            <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a', marginBottom: '8px' }}>
                              ₹{selectedOrder.total.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '13px', color: '#475569', display: 'grid', gap: '4px' }}>
                              <div><strong>Gateway:</strong> Razorpay</div>
                              <div><strong>Method:</strong> {selectedOrder.paymentMethod}</div>
                              {selectedOrder.paymentId ? (
                                <div style={{ fontSize: '11px', background: '#f1f5f9', padding: '4px 6px', borderRadius: '4px', wordBreak: 'break-all', fontFamily: 'monospace', marginTop: '4px' }}>
                                  ID: {selectedOrder.paymentId}
                                </div>
                              ) : (
                                <div style={{ color: '#ea580c', fontWeight: 600 }}>Payment reference pending</div>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* 4. Ordered Products Section */}
                      <div>
                        <div className="products-section-header">
                          <Package size={18} color="#ec4899" /> Products Ordered ({selectedOrder.items})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                            selectedOrder.orderItems.map((item, idx) => (
                              <div key={idx} className="product-item-card">
                                <div className="product-img-wrapper">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} />
                                  ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>
                                  )}
                                </div>

                                <div className="product-details">
                                  <div className="product-name-col">
                                    <span className="product-name-title" title={item.name}>{item.name}</span>
                                    <div className="product-meta-specs">
                                      <span>Cat: <strong>Agri</strong></span>
                                      <span>SKU: <strong>NAF-{item.id ? item.id.substring(0, 5).toUpperCase() : 'PROD'}</strong></span>
                                      <span>Weight: <strong>1 Kg</strong></span>
                                    </div>
                                  </div>

                                  <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                                    Price: <strong>₹{item.price.toLocaleString()}</strong>
                                  </div>

                                  <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                                    Qty: <strong>{item.qty}</strong>
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                                      ₹{(item.price * item.qty).toLocaleString()}
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                      <button 
                                        onClick={() => handleBuyAgain(item)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', fontSize: '12px', fontWeight: 700, padding: 0 }}
                                      >
                                        Buy Again
                                      </button>
                                      <span style={{ color: '#cbd5e1', fontSize: '12px' }}>|</span>
                                      <button 
                                        onClick={() => toast.success('Reviews coming soon!')}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: '12px', fontWeight: 700, padding: 0 }}
                                      >
                                        Leave Review
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No items found</div>
                          )}
                        </div>
                      </div>

                      {/* 5. Detailed Price Breakdown */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
                        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Need Assistance?</h4>
                          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                            If you have questions regarding this order, delivery times, or need a replacement, please contact our support desk.
                          </p>
                          <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                            <a href="mailto:support@nuzvidagrifarms.com" style={{ textDecoration: 'none', fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>Email Support</a>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <a href="tel:+919030545655" style={{ textDecoration: 'none', fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>Call Hotline</a>
                          </div>
                        </div>

                        <div className="price-breakdown-card">
                          {(() => {
                            const actualSubtotal = selectedOrder.orderItems?.reduce((acc, item) => acc + (Number(item.price) * item.qty), 0) || 0;
                            const shippingFee = actualSubtotal >= 3000 ? 0 : 100;
                            const expected = actualSubtotal + shippingFee;
                            
                            let deducedPlatformFee = 0;
                            let deducedDiscount = 0;
                            
                            if (selectedOrder.total > expected) {
                              deducedPlatformFee = selectedOrder.total - expected;
                            } else if (selectedOrder.total < expected && selectedOrder.total > 10) {
                              deducedDiscount = expected - selectedOrder.total;
                              // Assume a base 5 platform fee is hidden in the discount for new orders
                              if (deducedDiscount % 5 !== 0 && deducedDiscount > 5) {
                                deducedPlatformFee = 5;
                                deducedDiscount = expected + 5 - selectedOrder.total;
                              }
                            } else if (selectedOrder.total <= 10) {
                               // test orders
                               deducedDiscount = 0;
                            }

                            return (
                              <>
                                <div className="breakdown-row">
                                  <span>Subtotal</span>
                                  <span className="text-bold">₹{actualSubtotal.toLocaleString()}</span>
                                </div>
                                {deducedDiscount > 0 && (
                                  <div className="breakdown-row">
                                    <span>Coupon Discount</span>
                                    <span className="text-bold text-red">- ₹{deducedDiscount.toLocaleString()}</span>
                                  </div>
                                )}
                                <div className="breakdown-row">
                                  <span>Shipping Fee</span>
                                  <span className="text-bold">₹{shippingFee.toLocaleString()}</span>
                                </div>
                                {(deducedPlatformFee > 0 || selectedOrder.total === expected) && (
                                  <div className="breakdown-row">
                                    <span>Platform Fee</span>
                                    <span className="text-bold">₹{deducedPlatformFee > 0 ? deducedPlatformFee.toLocaleString() : '0'}</span>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                          <div className="breakdown-row total">
                            <span>Grand Total</span>
                            <span className="text-green text-bold">₹{selectedOrder.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Premium Sticky Footer Actions */}
                    <div className="premium-modal-footer">
                      <button 
                        onClick={() => setSelectedOrder(null)} 
                        className="admin-btn-secondary" 
                        style={{ margin: 0, borderRadius: '10px', padding: '10px 24px', fontWeight: 600, background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
                      >
                        Close
                      </button>
                      <button 
                        onClick={() => handlePrint(selectedOrder)}
                        className="account-gate-btn" 
                        style={{ margin: 0, width: 'auto', borderRadius: '10px', padding: '10px 24px', fontWeight: 600, background: '#16a34a', color: '#fff' }}
                      >
                        Download Invoice
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          , document.body)}



          {activeTab === 'address' && (
            <motion.div key="address" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="account-card-header">
                <h2 className="account-section-title"><MapPin size={20}/>Saved Addresses</h2>
                <button className="account-edit-btn" onClick={() => toast.success('Add address — coming soon!')}>+ Add New</button>
              </div>

              {profile.address ? (
                <div className="address-card">
                  <div className="address-badge">Default</div>
                  <div className="address-name">{profile.fullName}</div>
                  <div className="address-text">{profile.address}</div>
                  <div className="address-actions">
                    <button onClick={() => setActiveTab('profile') || setEditing(true)} className="address-edit-btn"><Edit3 size={14}/> Edit</button>
                  </div>
                </div>
              ) : (
                <div className="address-empty">
                  <MapPin size={40} strokeWidth={1.5} />
                  <p>No addresses saved yet.</p>
                  <button onClick={() => { setActiveTab('profile'); setEditing(true); }} className="account-edit-btn">+ Add Address</button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="account-card-header">
                <h2 className="account-section-title"><Lock size={20}/>Security Settings</h2>
              </div>

              <div style={{ maxWidth: '500px' }}>
                <form onSubmit={handlePasswordChange}>
                  <div className="profile-field" style={{ marginBottom: '20px' }}>
                    <label className="profile-field-label">Current Password</label>
                    <input
                      type="password"
                      required
                      className="profile-field-input"
                      placeholder="Enter your current password"
                      value={passwordForm.current}
                      onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                    />
                  </div>
                  
                  <div className="profile-field" style={{ marginBottom: '20px' }}>
                    <label className="profile-field-label">New Password</label>
                    <input
                      type="password"
                      required
                      className="profile-field-input"
                      placeholder="Enter new password"
                      value={passwordForm.new}
                      onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))}
                    />
                  </div>

                  <div className="profile-field" style={{ marginBottom: '28px' }}>
                    <label className="profile-field-label">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      className="profile-field-input"
                      placeholder="Confirm new password"
                      value={passwordForm.confirm}
                      onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                    />
                  </div>

                  <button type="submit" className="account-gate-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <Key size={18} /> Update Password
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyAccount;

