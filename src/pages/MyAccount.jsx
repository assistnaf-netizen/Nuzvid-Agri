import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Phone, Mail, Edit3, Save, LogOut, ChevronRight, ShoppingBag, Heart, Lock, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

          {/* Order Details Modal — rendered via portal to document.body so position:fixed works correctly */}
          {ReactDOM.createPortal(
            <AnimatePresence>
              {selectedOrder && (
                <div className="account-modal-overlay" onClick={() => setSelectedOrder(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                  <motion.div 
                    className="account-modal"
                    onClick={e => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.96, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 24 }}
                    style={{ background: '#fff', width: '100%', maxWidth: '700px', maxHeight: '92vh', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0, boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}
                  >
                    {/* Gradient Header */}
                    <div style={{ background: 'linear-gradient(135deg, #1a1d2e 0%, #2d3250 100%)', padding: '24px 28px 20px', flexShrink: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', letterSpacing: '1px', textTransform: 'uppercase' }}>Order</span>
                            <span className="order-status-badge" style={{ background: (STATUS_COLORS[selectedOrder.status]||{}).bg, color: (STATUS_COLORS[selectedOrder.status]||{}).color, fontSize: '11px', padding: '3px 10px' }}>{selectedOrder.status}</span>
                          </div>
                          <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>{selectedOrder.id}</h2>
                          <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>Placed on {selectedOrder.date}</p>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(null)}
                          style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', transition: 'background 0.2s', flexShrink: 0 }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                        >×</button>
                      </div>

                      {/* Quick Stats Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px' }}>
                        {[
                          { label: 'Total Amount', value: `₹${selectedOrder.total.toLocaleString()}`, accent: '#34d399' },
                          { label: 'Items', value: `${selectedOrder.items} item${selectedOrder.items > 1 ? 's' : ''}`, accent: '#60a5fa' },
                          { label: 'Payment', value: selectedOrder.paymentMethod, accent: '#f59e0b' },
                        ].map(s => (
                          <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: s.accent }}>{s.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scrollable Body */}
                    <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', background: '#f8fafc', display: 'grid', gap: '14px' }}>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        {/* Shipping Address */}
                        <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>📍</div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Delivery Address</span>
                          </div>
                          <div style={{ fontSize: '14px', color: '#111827', fontWeight: 600, marginBottom: '4px' }}>{profile.fullName}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>{selectedOrder.address}</div>
                        </div>

                        {/* Payment Info */}
                        <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>💳</div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Payment Details</span>
                          </div>
                          <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981', marginBottom: '6px' }}>₹{selectedOrder.total.toLocaleString()}</div>
                          <div style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}><strong>Method:</strong> {selectedOrder.paymentMethod}</div>
                          <div style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}><strong>Status:</strong> Paid in full</div>
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ padding: '16px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #be185d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>🛒</div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Items Ordered ({selectedOrder.items})</span>
                        </div>
                        {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                          selectedOrder.orderItems.map((item, idx) => (
                            <div key={idx} style={{
                              display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px',
                              borderBottom: idx < selectedOrder.orderItems.length - 1 ? '1px solid #f9fafb' : 'none',
                              background: idx % 2 === 0 ? '#fff' : '#fafafa'
                            }}>
                              {item.image ? (
                                <img src={item.image} alt={item.name} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0, border: '1px solid #e5e7eb' }} />
                              ) : (
                                <div style={{ width: '56px', height: '56px', background: '#e5e7eb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>📦</div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, color: '#111827', fontSize: '14px', marginBottom: '3px' }}>{item.name}</div>
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Qty: {item.qty} × ₹{item.price.toLocaleString()}</div>
                              </div>
                              <div style={{ fontWeight: 800, color: '#111827', fontSize: '15px', flexShrink: 0 }}>
                                ₹{(item.price * item.qty).toLocaleString()}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No items found</div>
                        )}
                        {/* Total Footer */}
                        <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, #1a1d2e 0%, #2d3250 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600 }}>ORDER TOTAL</span>
                          <span style={{ color: '#34d399', fontSize: '22px', fontWeight: 900 }}>₹{selectedOrder.total.toLocaleString()}</span>
                        </div>
                      </div>

                    </div>

                    {/* Footer Actions */}
                    <div style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                      <button className="account-gate-btn" style={{ borderRadius: '10px', padding: '10px 24px', fontWeight: 600, width: 'auto' }} onClick={() => setSelectedOrder(null)}>Close</button>
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

