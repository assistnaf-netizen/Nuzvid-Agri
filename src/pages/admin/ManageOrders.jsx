import React, { useState, useEffect } from 'react';
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
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <motion.div 
            className="admin-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: '#1a1d2e' }}>Order {selectedOrder.id}</h2>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>Placed on {selectedOrder.dateTime}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>

              {/* Customer + Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>👤 Customer</h4>
                  <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: '15px' }}>{selectedOrder.customer}</div>
                  <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>{selectedOrder.email}</div>
                  {selectedOrder.phone && <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '2px' }}>📞 {selectedOrder.phone}</div>}
                </div>
                <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '10px', border: '1px solid #d1fae5' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>💳 Payment</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`admin-badge ${PAYMENT_CONFIG[selectedOrder.paymentStatus] || 'admin-badge-gray'}`}>{selectedOrder.paymentStatus}</span>
                  </div>
                  <div style={{ color: '#374151', fontSize: '13px', marginTop: '8px', fontWeight: 600 }}>Method: {selectedOrder.paymentMethod}</div>
                  <div style={{ fontWeight: 800, color: '#10b981', fontSize: '18px', marginTop: '4px' }}>₹{selectedOrder.total.toLocaleString()}</div>
                  {selectedOrder.paymentId && <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px', wordBreak: 'break-all' }}>ID: {selectedOrder.paymentId}</div>}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.address && (
                <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>📦 Shipping Address</h4>
                  <div style={{ color: '#374151', fontSize: '14px', lineHeight: '1.5' }}>{selectedOrder.address}</div>
                </div>
              )}

              {/* Order Status */}
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>🚚 Order Status</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`admin-badge ${STATUS_CONFIG[selectedOrder.status]?.badge || 'admin-badge-gray'}`} style={{ padding: '6px 14px', fontSize: '13px' }}>
                    {selectedOrder.status}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>Change to:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', cursor: 'pointer' }}
                  >
                    {['Pending','Processing','Shipped','Delivered'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>🛒 Items Ordered ({selectedOrder.items})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedOrder.rawItems && selectedOrder.rawItems.length > 0 ? (
                    selectedOrder.rawItems.map((item, idx) => (
                      <div key={item.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#f9fafb', padding: '14px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_title} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '56px', height: '56px', background: '#e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>📦</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: '14px' }}>{item.product_title || 'Product'}</div>
                          <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '3px' }}>Qty: {item.quantity} × ₹{Number(item.price_at_time).toLocaleString()}</div>
                        </div>
                        <div style={{ fontWeight: 800, color: '#1a1d2e', fontSize: '15px', flexShrink: 0 }}>
                          ₹{(item.quantity * Number(item.price_at_time)).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '10px', color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>No items found</div>
                  )}
                </div>

                {/* Order Total Summary */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #e5e7eb' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>Order Total</div>
                    <div style={{ fontWeight: 800, color: '#1a1d2e', fontSize: '22px' }}>₹{selectedOrder.total.toLocaleString()}</div>
                  </div>
                </div>
              </div>

            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="admin-btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
