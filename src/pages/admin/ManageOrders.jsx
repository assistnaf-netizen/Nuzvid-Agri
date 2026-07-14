import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Search, Eye, Download, Filter, ShoppingCart, Clock, CheckCircle, Truck, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import './admin.css';

const STATUS_CONFIG = {
  Delivered:  { badge: 'admin-badge-green',  icon: <CheckCircle size={11}/> },
  Shipped:    { badge: 'admin-badge-blue',   icon: <Truck size={11}/> },
  Processing: { badge: 'admin-badge-yellow', icon: <Clock size={11}/> },
  Pending:    { badge: 'admin-badge-red',    icon: <Package size={11}/> },
};

const PAYMENT_CONFIG = {
  Paid: 'admin-badge-green',
  COD:  'admin-badge-yellow',
};

const AVATAR_COLORS = ['#d68d3c', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4'];

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/get-orders?all=true');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch orders');

      const data = json.orders;
      const formatted = data.map(o => ({
        id: o.display_id || o.id,
        db_id: o.id,
        customer: o.customer_name || 'Unknown',
        avatar: (o.customer_name || 'UN').substring(0, 2).toUpperCase(),
        email: o.customer_email || '',
        phone: o.customer_phone || '',
        address: o.shipping_address || '',
        paymentId: o.payment_id || '',
        paymentMethod: o.payment_method || '',
        date: new Date(o.created_at).toLocaleDateString(),
        dateTime: new Date(o.created_at).toLocaleString(),
        total: Number(o.total_amount),
        paymentStatus: o.payment_status,
        status: o.status,
        items: o.order_items ? o.order_items.length : 0,
        rawItems: o.order_items || []
      }));
      
      setOrders(formatted);
    } catch (err) {
      toast.error('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.db_id);
        
      if (error) throw error;
      
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      toast.success(`Order ${id} → ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filters = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered'];
  const filtered = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = activeFilter === 'All' || o.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const stats = [
    { label: 'Total Orders',    value: orders.length,                              icon: <ShoppingCart size={22}/>, color: '#3b82f6', bg: '#eff6ff', accent: '#3b82f6' },
    { label: 'Pending',         value: orders.filter(o=>o.status==='Pending').length,   icon: <Package size={22}/>,     color: '#ef4444', bg: '#fef2f2', accent: '#ef4444' },
    { label: 'Shipped',         value: orders.filter(o=>o.status==='Shipped').length,   icon: <Truck size={22}/>,       color: '#d68d3c', bg: '#fff7ed', accent: '#d68d3c' },
    { label: 'Delivered',       value: orders.filter(o=>o.status==='Delivered').length, icon: <CheckCircle size={22}/>, color: '#10b981', bg: '#ecfdf5', accent: '#10b981' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders Management</h1>
          <p className="admin-page-subtitle">{orders.length} total orders · Last updated just now</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="admin-btn-secondary" onClick={() => toast.success('Exporting CSV...')}><Download size={16}/>Export</button>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        {stats.map((s, i) => (
          <motion.div key={s.label} className="admin-stat-card" style={{ '--card-accent': s.accent }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className="admin-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="admin-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-search-wrapper">
            <Search size={16} className="admin-search-icon" />
            <input className="admin-search-input" placeholder="Search by Order ID or Customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="admin-filter-tabs">
            {filters.map(f => (
              <button key={f} className={`admin-filter-tab ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order, i) => {
              const sc = STATUS_CONFIG[order.status] || {};
              const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: '13px' }}>{order.id}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{order.email}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="admin-avatar" style={{ background: avatarColor + '20', color: avatarColor }}>{order.avatar}</div>
                      <span style={{ fontWeight: 600 }}>{order.customer}</span>
                    </div>
                  </td>
                  <td style={{ color: '#6b7280' }}>{order.date}</td>
                  <td><span style={{ fontWeight: 600 }}>{order.items} item{order.items > 1 ? 's' : ''}</span></td>
                  <td><span className={`admin-badge ${PAYMENT_CONFIG[order.paymentStatus] || 'admin-badge-gray'}`}>{order.paymentStatus}</span></td>
                  <td>
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      className={`admin-status-select admin-badge ${sc.badge}`}
                    >
                      {['Pending','Processing','Shipped','Delivered'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ fontWeight: 700, color: '#1a1d2e' }}>₹{order.total.toLocaleString()}</td>
                  <td>
                    <button className="admin-icon-btn" onClick={() => setSelectedOrder(order)} title="View Order"><Eye size={15}/></button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="admin-empty-state">
            <ShoppingCart size={48} />
            <h3>No orders found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && ReactDOM.createPortal(
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <motion.div
            className="admin-modal"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '700px', width: '96%', maxHeight: '92vh', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}
          >
            {/* Gradient Header */}
            <div style={{ background: 'linear-gradient(135deg, #1a1d2e 0%, #2d3250 100%)', padding: '24px 28px 20px', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', letterSpacing: '1px', textTransform: 'uppercase' }}>Order</span>
                    <span className={`admin-badge ${STATUS_CONFIG[selectedOrder.status]?.badge || 'admin-badge-gray'}`} style={{ fontSize: '11px' }}>{selectedOrder.status}</span>
                  </div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>{selectedOrder.id}</h2>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>Placed on {selectedOrder.dateTime}</p>
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
                  { label: 'Payment', value: selectedOrder.paymentStatus, accent: selectedOrder.paymentStatus === 'Paid' ? '#34d399' : '#f87171' },
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

              {/* Customer & Payment Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {/* Customer Card */}
                <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '13px' }}>
                      {selectedOrder.avatar}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Customer</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '15px', marginBottom: '6px' }}>{selectedOrder.customer}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: '#9ca3af' }}>✉</span> {selectedOrder.email}
                  </div>
                  {selectedOrder.phone && (
                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ color: '#9ca3af' }}>📞</span> {selectedOrder.phone}
                    </div>
                  )}
                </div>

                {/* Payment Card */}
                <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>💳</div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Payment Info</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981', marginBottom: '6px' }}>₹{selectedOrder.total.toLocaleString()}</div>
                  <div style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}><strong>Via:</strong> {selectedOrder.paymentMethod}</div>
                  {selectedOrder.paymentId && (
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px', padding: '6px 10px', background: '#f3f4f6', borderRadius: '6px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                      {selectedOrder.paymentId}
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.address && (
                <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>📍</div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Delivery Address</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>{selectedOrder.address}</div>
                </div>
              )}

              {/* Status Update */}
              <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>🚚</div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Update Order Status</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {['Pending','Processing','Shipped','Delivered'].map(s => {
                    const isActive = selectedOrder.status === s;
                    const colors = { Pending: '#f59e0b', Processing: '#3b82f6', Shipped: '#8b5cf6', Delivered: '#10b981' };
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selectedOrder.id, s)}
                        style={{
                          padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                          background: isActive ? colors[s] : '#f3f4f6',
                          color: isActive ? '#fff' : '#6b7280',
                          border: isActive ? `2px solid ${colors[s]}` : '2px solid transparent',
                          boxShadow: isActive ? `0 4px 12px ${colors[s]}40` : 'none'
                        }}
                      >{s}</button>
                    );
                  })}
                </div>
              </div>

              {/* Items */}
              <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '16px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #be185d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>🛒</div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Items Ordered ({selectedOrder.items})</span>
                </div>
                {selectedOrder.rawItems && selectedOrder.rawItems.length > 0 ? (
                  selectedOrder.rawItems.map((item, idx) => (
                    <div key={item.id || idx} style={{
                      display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px',
                      borderBottom: idx < selectedOrder.rawItems.length - 1 ? '1px solid #f9fafb' : 'none',
                      background: idx % 2 === 0 ? '#fff' : '#fafafa'
                    }}>
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_title} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0, border: '1px solid #e5e7eb' }} />
                      ) : (
                        <div style={{ width: '56px', height: '56px', background: '#e5e7eb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>📦</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: '14px', marginBottom: '3px' }}>{item.product_title || 'Product'}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>Qty: {item.quantity} × ₹{Number(item.price_at_time).toLocaleString()}</div>
                      </div>
                      <div style={{ fontWeight: 800, color: '#111827', fontSize: '15px', flexShrink: 0 }}>
                        ₹{(item.quantity * Number(item.price_at_time)).toLocaleString()}
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
              <button className="admin-btn-secondary" onClick={() => setSelectedOrder(null)} style={{ borderRadius: '10px', padding: '10px 24px', fontWeight: 600 }}>Close</button>
            </div>
          </motion.div>
        </div>
      , document.body)}
    </div>
  );
};

export default ManageOrders;

