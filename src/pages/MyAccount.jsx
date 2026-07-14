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
          <AnimatePresence>
            {selectedOrder && ReactDOM.createPortal(
              <div className="account-modal-overlay" onClick={() => setSelectedOrder(null)}>
                <motion.div 
                  className="account-modal"
                  onClick={e => e.stopPropagation()}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                >
                  <div className="account-modal-header">
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1a1d2e' }}>Order {selectedOrder.id}</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>Placed on {selectedOrder.date}</p>
                    </div>
                    <button className="account-modal-close" onClick={() => setSelectedOrder(null)}>×</button>
                  </div>
                  <div className="account-modal-body">
                    {/* Order Summary Box */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px', padding: '20px', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', borderRadius: '16px', border: '1px solid #e8eaf0' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '6px' }}>Status</div>
                        <span className="order-status-badge" style={{ background: (STATUS_COLORS[selectedOrder.status]||{}).bg, color: (STATUS_COLORS[selectedOrder.status]||{}).color, padding: '6px 14px', fontSize: '13px' }}>{selectedOrder.status}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '6px' }}>Payment</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1d2e' }}>{selectedOrder.paymentMethod}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '6px' }}>Total Amount</div>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#d68d3c' }}>₹{selectedOrder.total.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Package size={18} color="#d68d3c" /> Items in this Order
                    </h4>
                    <div style={{ border: '1px solid #e8eaf0', borderRadius: '16px', overflow: 'hidden', marginBottom: '28px', background: '#fff' }}>
                      {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? selectedOrder.orderItems.map((item, idx) => (
                        <div key={idx} style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx !== selectedOrder.orderItems.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {item.image ? (
                              <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e8eaf0' }} />
                            ) : (
                              <div style={{ width: '60px', height: '60px', background: '#f3f4f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>
                            )}
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1d2e', marginBottom: '2px' }}>{item.name}</div>
                              <div style={{ fontSize: '13px', color: '#6b7280' }}>Qty: {item.qty} × ₹{item.price.toLocaleString()}</div>
                            </div>
                          </div>
                          <div style={{ fontWeight: 800, color: '#1a1d2e' }}>₹{(item.price * item.qty).toLocaleString()}</div>
                        </div>
                      )) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No items found</div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      {/* Shipping Address */}
                      <div>
                        <h4 style={{ fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', margin: '0 0 12px' }}>Shipping Details</h4>
                        <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '12px', fontSize: '14px', color: '#374151', lineHeight: 1.6, border: '1px solid #f3f4f6' }}>
                          <strong style={{ color: '#1a1d2e' }}>{profile.fullName}</strong><br/>
                          {selectedOrder.address}<br/>
                        </div>
                      </div>
                      {/* Payment Method */}
                      <div>
                        <h4 style={{ fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', margin: '0 0 12px' }}>Payment Method</h4>
                        <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '12px', fontSize: '14px', color: '#374151', lineHeight: 1.6, border: '1px solid #f3f4f6' }}>
                          <strong style={{ color: '#1a1d2e' }}>{selectedOrder.paymentMethod}</strong><br/>
                          <span style={{ color: '#6b7280' }}>Paid in full</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            , document.body)}
          </AnimatePresence>



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

