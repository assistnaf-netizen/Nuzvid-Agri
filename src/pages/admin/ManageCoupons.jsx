import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Copy, ToggleLeft, ToggleRight, Percent, DollarSign, Truck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import './admin.css';

const TYPE_ICON = { 'Percentage': <Percent size={16}/>, 'Fixed Amount': <DollarSign size={16}/>, 'Free Shipping': <Truck size={16}/> };
const TYPE_COLOR = { 'Percentage': '#8b5cf6', 'Fixed Amount': '#3b82f6', 'Free Shipping': '#10b981' };
const TYPE_BG    = { 'Percentage': '#f5f3ff',  'Fixed Amount': '#eff6ff',  'Free Shipping': '#ecfdf5' };

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentCoupon, setCurrentCoupon] = useState({ code: '', type: 'Percentage', value: '', minSpend: '', expiry: '', maxUsage: '' });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      const formatted = data.map(c => ({
        id: c.id,
        code: c.code,
        type: c.type,
        value: Number(c.value),
        minSpend: Number(c.min_spend),
        expiry: c.expiry,
        status: c.status,
        usage: c.usage_count,
        maxUsage: c.max_usage
      }));
      setCoupons(formatted);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setCurrentCoupon({ code: '', type: 'Percentage', value: '', minSpend: '', expiry: '', maxUsage: '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      setCoupons(coupons.filter(c => c.id !== id));
      toast.success('Coupon deleted');
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleToggle = async (id) => {
    const coupon = coupons.find(c => c.id === id);
    if (!coupon) return;
    
    const newStatus = coupon.status === 'Active' ? 'Disabled' : 'Active';
    try {
      const { error } = await supabase.from('coupons').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setCoupons(coupons.map(c => c.id === id ? { ...c, status: newStatus } : c));
      toast.success(`Coupon ${newStatus}`);
    } catch (err) {
      toast.error('Failed to toggle coupon');
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`"${code}" copied to clipboard!`);
  };

  const filtered = coupons.filter(c => activeFilter === 'All' || c.status === activeFilter);

  const stats = [
    { label: 'Total Coupons', value: coupons.length,                                  color: '#3b82f6', bg: '#eff6ff', accent: '#3b82f6', icon: <Tag size={22}/> },
    { label: 'Active',        value: coupons.filter(c=>c.status==='Active').length,   color: '#10b981', bg: '#ecfdf5', accent: '#10b981', icon: <Zap size={22}/> },
    { label: 'Expired',       value: coupons.filter(c=>c.status==='Expired').length,  color: '#ef4444', bg: '#fef2f2', accent: '#ef4444', icon: <Tag size={22}/> },
    { label: 'Total Redemptions', value: coupons.reduce((a,c)=>a+c.usage,0),          color: '#d68d3c', bg: '#fff7ed', accent: '#d68d3c', icon: <Percent size={22}/> },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Discount Coupons</h1>
          <p className="admin-page-subtitle">{coupons.filter(c=>c.status==='Active').length} active promotions running</p>
        </div>
        <button className="admin-btn-primary" onClick={handleOpenModal}><Plus size={16}/>New Coupon</button>
      </div>

      <div className="admin-stats-grid">
        {stats.map((s, i) => (
          <motion.div key={s.label} className="admin-stat-card" style={{ '--card-accent': s.accent }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className="admin-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="admin-stat-value" style={{ color: s.color, fontSize: '26px' }}>{s.value}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="admin-filter-tabs">
          {['All', 'Active', 'Expired', 'Disabled'].map(f => (
            <button key={f} className={`admin-filter-tab ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      {/* Coupon Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        <AnimatePresence>
          {filtered.map((coupon, i) => {
            const tc = TYPE_COLOR[coupon.type];
            const tb = TYPE_BG[coupon.type];
            const usagePct = coupon.maxUsage > 0 ? (coupon.usage / coupon.maxUsage) * 100 : 0;
            return (
              <motion.div
                key={coupon.id}
                className="admin-coupon-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                layout
              >
                {/* Dashed cut edge effect */}
                <div style={{ borderTop: '2px dashed #e8eaf0', margin: '0 -20px 16px', paddingTop: '16px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ background: tb, color: tc, padding: '6px', borderRadius: '8px', display: 'flex' }}>{TYPE_ICON[coupon.type]}</div>
                      <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '2px', color: '#1a1d2e' }}>{coupon.code}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{coupon.type}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: tc }}>
                      {coupon.type === 'Percentage' ? `${coupon.value}%` : coupon.type === 'Fixed Amount' ? `₹${coupon.value}` : 'Free'}
                    </div>
                    <span className={`admin-badge ${coupon.status === 'Active' ? 'admin-badge-green' : coupon.status === 'Expired' ? 'admin-badge-red' : 'admin-badge-gray'}`} style={{ fontSize: '11px' }}>
                      {coupon.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>
                  <span>Min. ₹{coupon.minSpend}</span>
                  <span>Expires {coupon.expiry}</span>
                </div>

                {/* Usage Progress */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                    <span>Usage</span>
                    <span>{coupon.usage} / {coupon.maxUsage}</span>
                  </div>
                  <div className="admin-progress-bar">
                    <div className="admin-progress-fill" style={{ width: `${usagePct}%`, background: usagePct > 80 ? '#ef4444' : tc }}></div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #e8eaf0', paddingTop: '14px' }}>
                  <button className="admin-icon-btn" style={{ flex: 1, width: 'auto', fontSize: '13px', fontWeight: 600, gap: '6px' }} onClick={() => handleCopy(coupon.code)}><Copy size={14}/> Copy</button>
                  <button className="admin-icon-btn" style={{ flex: 1, width: 'auto', fontSize: '13px', fontWeight: 600, gap: '6px' }} onClick={() => handleToggle(coupon.id)}>
                    {coupon.status === 'Active' ? <ToggleRight size={14} color="#10b981"/> : <ToggleLeft size={14}/>}
                    {coupon.status === 'Active' ? 'Disable' : 'Enable'}
                  </button>
                  <button className="admin-icon-btn danger" onClick={() => handleDelete(coupon.id)}><Trash2 size={14}/></button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="admin-empty-state" style={{ background: 'white', borderRadius: '14px', border: '1px solid #e8eaf0' }}>
          <Tag size={48} />
          <h3>No coupons found</h3>
          <p>Create a new coupon to run a promotion.</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <motion.div 
            className="admin-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px', width: '90%' }}
          >
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#1a1d2e' }}>Create New Coupon</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>

            <div className="admin-modal-body" style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Coupon Code</label>
                <input type="text" placeholder="e.g. WELCOME10" className="admin-search-input" style={{ width: '100%', textTransform: 'uppercase' }} value={currentCoupon.code} onChange={e => setCurrentCoupon({...currentCoupon, code: e.target.value.toUpperCase()})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Type</label>
                  <select className="admin-search-input" style={{ width: '100%' }} value={currentCoupon.type} onChange={e => setCurrentCoupon({...currentCoupon, type: e.target.value})}>
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed Amount">Fixed Amount</option>
                    <option value="Free Shipping">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Discount Value</label>
                  <input type="number" placeholder="0" className="admin-search-input" style={{ width: '100%' }} value={currentCoupon.value} onChange={e => setCurrentCoupon({...currentCoupon, value: e.target.value})} disabled={currentCoupon.type === 'Free Shipping'} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Min Spend (₹)</label>
                  <input type="number" placeholder="e.g. 500" className="admin-search-input" style={{ width: '100%' }} value={currentCoupon.minSpend} onChange={e => setCurrentCoupon({...currentCoupon, minSpend: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Max Usage Count</label>
                  <input type="number" placeholder="e.g. 100" className="admin-search-input" style={{ width: '100%' }} value={currentCoupon.maxUsage} onChange={e => setCurrentCoupon({...currentCoupon, maxUsage: e.target.value})} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>Expiry Date</label>
                <input type="date" className="admin-search-input" style={{ width: '100%' }} value={currentCoupon.expiry} onChange={e => setCurrentCoupon({...currentCoupon, expiry: e.target.value})} />
              </div>
            </div>

            <div className="admin-modal-footer" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={async () => {
                if (!currentCoupon.code || !currentCoupon.expiry || !currentCoupon.maxUsage) {
                  toast.error('Please fill required fields');
                  return;
                }
                try {
                  const { error } = await supabase.from('coupons').insert([{
                    code: currentCoupon.code,
                    type: currentCoupon.type,
                    value: currentCoupon.type === 'Free Shipping' ? 0 : Number(currentCoupon.value),
                    min_spend: Number(currentCoupon.minSpend || 0),
                    expiry: currentCoupon.expiry,
                    status: 'Active',
                    max_usage: Number(currentCoupon.maxUsage),
                    usage_count: 0
                  }]);
                  
                  if (error) throw error;
                  
                  toast.success('Coupon created!');
                  setIsModalOpen(false);
                  fetchCoupons();
                } catch (err) {
                  console.error(err);
                  toast.error(err.message || 'Failed to create coupon');
                }
              }}>Save Coupon</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManageCoupons;
