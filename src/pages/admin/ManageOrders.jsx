import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Search, Eye, Download, Filter, ShoppingCart, ShoppingBag, Clock, CheckCircle, Truck, Package, Copy, Printer, RefreshCcw, User, MapPin, CreditCard, DollarSign, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
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
              <strong>${order.customer}</strong><br/>
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
                ${order.rawItems.map(item => `
                  <tr>
                    <td>${item.product_title}</td>
                    <td>₹${Number(item.price_at_time).toLocaleString()}</td>
                    <td>${item.quantity}</td>
                    <td>₹${(Number(item.price_at_time) * item.quantity).toLocaleString()}</td>
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
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
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
                  <span>Placed on <strong>{selectedOrder.dateTime}</strong></span>
                  <span>•</span>
                  <span>Est. Delivery: <strong>3 - 5 Business Days</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => handlePrint(selectedOrder)}
                  className="admin-btn-secondary" 
                  style={{ margin: 0, padding: '8px 14px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px' }}
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
                  { label: 'Payment Status', value: selectedOrder.paymentStatus || 'Paid', icon: <CheckCircle size={20} color="#059669"/>, bg: '#d1fae5', accent: '#059669' },
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
                      {selectedOrder.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{selectedOrder.customer}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedOrder.email}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedOrder.phone || 'No phone set'}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                    <span>Joined: <strong>2026</strong></span>
                    <span>Orders: <strong>3</strong></span>
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
                    <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{selectedOrder.customer}</div>
                    <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                      {selectedOrder.address}
                    </div>
                    <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.address)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#2563eb', fontWeight: 600, fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        Maps ↗
                      </a>
                      <button 
                        onClick={() => toast.success('Edit Address feature is only editable through database management.')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: 600, fontSize: '12px', padding: 0 }}
                      >
                        Edit
                      </button>
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

              {/* 4. Update Order Status (Admin Control Panel) */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>🚚</div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Update Order Status</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => {
                    const isActive = selectedOrder.status === s;
                    const colors = { Pending: '#ea580c', Processing: '#2563eb', Shipped: '#8b5cf6', Delivered: '#059669', Cancelled: '#dc2626' };
                    const bgColors = { Pending: '#ffedd5', Processing: '#e0f2fe', Shipped: '#faf5ff', Delivered: '#d1fae5', Cancelled: '#fee2e2' };
                    
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selectedOrder.id, s)}
                        style={{
                          padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                          background: isActive ? colors[s] : '#f1f5f9',
                          color: isActive ? '#fff' : '#64748b',
                          border: `2px solid ${isActive ? colors[s] : 'transparent'}`,
                          boxShadow: isActive ? `0 4px 12px ${colors[s]}40` : 'none'
                        }}
                      >{s}</button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Ordered Products Section */}
              <div>
                <div className="products-section-header">
                  <Package size={18} color="#ec4899" /> Products Ordered ({selectedOrder.items})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.rawItems && selectedOrder.rawItems.length > 0 ? (
                    selectedOrder.rawItems.map((item, idx) => (
                      <div key={idx} className="product-item-card">
                        <div className="product-img-wrapper">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_title} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>
                          )}
                        </div>

                        <div className="product-details">
                          <div className="product-name-col">
                            <span className="product-name-title" title={item.product_title}>{item.product_title}</span>
                            <div className="product-meta-specs">
                              <span>Cat: <strong>Agri</strong></span>
                              <span>SKU: <strong>NAF-{item.product_id ? item.product_id.substring(0, 5).toUpperCase() : 'PROD'}</strong></span>
                              <span>Weight: <strong>1 Kg</strong></span>
                            </div>
                          </div>

                          <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                            Price: <strong>₹{Number(item.price_at_time).toLocaleString()}</strong>
                          </div>

                          <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                            Qty: <strong>{item.quantity}</strong>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                              ₹{(Number(item.price_at_time) * item.quantity).toLocaleString()}
                            </span>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                              <a 
                                href={`/products`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#16a34a', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}
                              >
                                View Product
                              </a>
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

              {/* 6. Detailed Price Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
                <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Customer Outreach</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                    You can contact this customer regarding shipping changes, order delays, or other notifications via phone or email directly.
                  </p>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                    <a href={`mailto:${selectedOrder.email}`} style={{ textDecoration: 'none', fontSize: '12px', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> Email Customer
                    </a>
                    {selectedOrder.phone && (
                      <>
                        <span style={{ color: '#cbd5e1' }}>•</span>
                        <a href={`tel:${selectedOrder.phone}`} style={{ textDecoration: 'none', fontSize: '12px', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} /> Call Customer
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="price-breakdown-card">
                  <div className="breakdown-row">
                    <span>Subtotal</span>
                    <span className="text-bold">₹{(selectedOrder.total - (selectedOrder.total >= 3000 ? 0 : 100)).toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Coupon Discount</span>
                    <span className="text-bold text-red">- ₹0</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Shipping Fee</span>
                    <span className="text-bold">₹{(selectedOrder.total >= 3000 ? 0 : 100).toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Tax (GST Included)</span>
                    <span className="text-bold">₹{Math.round(selectedOrder.total * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Platform Fee</span>
                    <span className="text-bold">₹0</span>
                  </div>
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
      , document.body)}
    </div>
  );
};

export default ManageOrders;

