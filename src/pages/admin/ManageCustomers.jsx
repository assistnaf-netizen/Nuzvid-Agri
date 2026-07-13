import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, Users, TrendingUp, Award, UserCheck, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import './admin.css';

const AVATAR_COLORS = ['#d68d3c', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4'];

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [maxSpent, setMaxSpent] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
      const validProfiles = profiles || [];
      const { data: orders, error: oError } = await supabase.from('orders').select('*');
      if (oError) throw oError;

      const customerMap = {};

      validProfiles.forEach(p => {
        customerMap[p.id] = {
          id: p.id,
          name: p.full_name || 'Guest User',
          avatar: p.full_name ? p.full_name.substring(0, 2).toUpperCase() : 'G',
          email: 'Registered User',
          phone: p.phone || '-',
          orders: 0,
          spent: 0,
          joined: new Date(p.created_at).toLocaleDateString(),
          status: 'New'
        };
      });

      orders.forEach(o => {
        const uid = o.user_id || o.customer_email;
        if (!customerMap[uid]) {
          customerMap[uid] = {
            id: uid,
            name: o.customer_name || 'Guest',
            avatar: o.customer_name ? o.customer_name.substring(0, 2).toUpperCase() : 'G',
            email: o.customer_email || '',
            phone: o.customer_phone || '-',
            orders: 0,
            spent: 0,
            joined: 'Unknown',
            status: 'New'
          };
        }
        
        customerMap[uid].orders += 1;
        customerMap[uid].spent += Number(o.total_amount);
        if (o.customer_email) {
          customerMap[uid].email = o.customer_email;
        }
      });

      let localMaxSpent = 0;
      const formatted = Object.values(customerMap).map(c => {
        if (c.spent > 10000 || c.orders >= 5) c.status = 'VIP';
        else if (c.orders > 0) c.status = 'Regular';
        
        if (c.spent > localMaxSpent) localMaxSpent = c.spent;
        return c;
      });

      setMaxSpent(localMaxSpent || 1);
      setCustomers(formatted);
    } catch (err) {
      toast.error('Failed to load customers');
    }
  };

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.phone.includes(searchTerm);
    const matchFilter = activeFilter === 'All' || c.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const stats = [
    { label: 'Total Customers', value: customers.length,                                 icon: <Users size={22}/>,     color: '#3b82f6', bg: '#eff6ff',  accent: '#3b82f6' },
    { label: 'VIP Customers',   value: customers.filter(c=>c.status==='VIP').length,     icon: <Award size={22}/>,     color: '#d68d3c', bg: '#fff7ed',  accent: '#d68d3c' },
    { label: 'New This Month',  value: customers.filter(c=>c.status==='New').length,     icon: <UserCheck size={22}/>, color: '#10b981', bg: '#ecfdf5',  accent: '#10b981' },
    { label: 'Avg. Spend',      value: `₹${Math.round(customers.reduce((a,c)=>a+c.spent,0)/(customers.length || 1)).toLocaleString()}`, icon: <TrendingUp size={22}/>, color: '#8b5cf6', bg: '#f5f3ff', accent: '#8b5cf6' },
  ];

  const statusBadge = { VIP: 'admin-badge-yellow', Regular: 'admin-badge-blue', New: 'admin-badge-green' };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customers</h1>
          <p className="admin-page-subtitle">{customers.length} registered customers · {customers.filter(c=>c.status==='VIP').length} VIP members</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="admin-btn-secondary" onClick={() => toast.success('Exporting...')}><Download size={16}/>Export</button>
        </div>
      </div>

      {/* Stats */}
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

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-search-wrapper">
            <Search size={16} className="admin-search-icon" />
            <input className="admin-search-input" placeholder="Search by name, email, or phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="admin-filter-tabs">
            {['All', 'VIP', 'Regular', 'New'].map(f => (
              <button key={f} className={`admin-filter-tab ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Spend Share</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const spendPct = MAX_SPENT > 0 ? (c.spent / MAX_SPENT) * 100 : 0;
              return (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="admin-avatar" style={{ background: avatarColor + '20', color: avatarColor }}>{c.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{c.name}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px' }}><Mail size={13}/>{c.email}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px' }}><Phone size={13}/>{c.phone}</div>
                    </div>
                  </td>
                  <td><span className={`admin-badge ${statusBadge[c.status]}`}>{c.status}</span></td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: '#f3f4f6', fontWeight: 700, fontSize: '14px' }}>{c.orders}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: '#d68d3c' }}>₹{c.spent.toLocaleString()}</td>
                  <td style={{ width: '120px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="admin-progress-bar">
                        <div className="admin-progress-fill" style={{ width: `${(c.spent / maxSpent) * 100}%`, background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}></div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '32px' }}>{Math.round(spendPct)}%</span>
                    </div>
                  </td>
                  <td style={{ color: '#6b7280', fontSize: '13px' }}>{c.joined}</td>
                  <td>
                    <button className="admin-icon-btn" onClick={() => setSelectedCustomer(c)} title="View Customer">
                      <Search size={15}/>
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="admin-empty-state">
            <Users size={48} />
            <h3>No customers found</h3>
            <p>Try adjusting your search or filter.</p>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="admin-modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <motion.div 
            className="admin-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px', width: '90%' }}
          >
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="admin-avatar" style={{ background: '#d68d3c20', color: '#d68d3c', width: '48px', height: '48px', fontSize: '18px' }}>{selectedCustomer.avatar}</div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#1a1d2e' }}>{selectedCustomer.name}</h2>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>{selectedCustomer.id} · Joined {selectedCustomer.joined}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>

            <div className="admin-modal-body" style={{ display: 'grid', gap: '20px' }}>
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact Information</h4>
                <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} color="#9ca3af"/> <span style={{ color: '#1a1d2e' }}>{selectedCustomer.email}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} color="#9ca3af"/> <span style={{ color: '#1a1d2e' }}>{selectedCustomer.phone}</span></div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 600, textTransform: 'uppercase' }}>Total Orders</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#1d4ed8', marginTop: '4px' }}>{selectedCustomer.orders}</div>
                </div>
                <div style={{ background: '#fff7ed', padding: '16px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                  <div style={{ fontSize: '13px', color: '#d68d3c', fontWeight: 600, textTransform: 'uppercase' }}>Total Spent</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#9a3412', marginTop: '4px' }}>₹{selectedCustomer.spent.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</h4>
                <span className={`admin-badge ${statusBadge[selectedCustomer.status]}`} style={{ padding: '8px 16px', fontSize: '14px' }}>
                  {selectedCustomer.status}
                </span>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="admin-btn-secondary" onClick={() => setSelectedCustomer(null)}>Close</button>
              <button className="admin-btn-primary">View Order History</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManageCustomers;
