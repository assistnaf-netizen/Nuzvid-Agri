import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import './admin.css';

const AVATAR_COLORS = ['#d68d3c', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4'];
const PIE_COLORS = ['#d68d3c', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

const STATUS_CONFIG = {
  Delivered:  'admin-badge-green',
  Shipped:    'admin-badge-blue',
  Processing: 'admin-badge-yellow',
  Pending:    'admin-badge-red',
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    retentionRate: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch Orders
      const oRes = await fetch('/api/get-orders?all=true');
      const oJson = await oRes.json();
      const ordersData = oJson.orders || [];

      // Fetch Profiles
      const pRes = await fetch('/api/get-profiles');
      const pJson = await pRes.json();
      const validProfiles = pJson.profiles || [];

      // Fetch Products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      // 1. Calculate Stats
      const totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
      const totalOrders = ordersData.length;
      
      const emailCounts = {};
      ordersData.forEach(o => {
        if (o.customer_email) {
          emailCounts[o.customer_email] = (emailCounts[o.customer_email] || 0) + 1;
        }
      });
      const uniqueCustomersFromOrders = Object.keys(emailCounts).length;
      const totalCustomers = Math.max(validProfiles.length, uniqueCustomersFromOrders);
      
      const returningCustomers = Object.values(emailCounts).filter(c => c > 1).length;
      const retentionRate = uniqueCustomersFromOrders > 0 
        ? Math.round((returningCustomers / uniqueCustomersFromOrders) * 100) 
        : 0;

      setStats({
        revenue: totalRevenue,
        orders: totalOrders,
        customers: totalCustomers,
        retentionRate: retentionRate
      });

      // 2. Calculate Sales Data (Last 7 Days)
      const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { 
          date: d.toISOString().split('T')[0], 
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          sales: 0
        };
      });

      ordersData.forEach(order => {
        const orderDate = order.created_at.split('T')[0];
        const dayMatch = last7Days.find(d => d.date === orderDate);
        if (dayMatch) {
          dayMatch.sales += Number(order.total_amount || 0);
        }
      });
      setSalesData(last7Days);

      // 3. Recent Orders
      const formattedRecent = ordersData.slice(0, 4).map((o) => ({
        id: o.display_id || o.id.substring(0,8).toUpperCase(),
        customer: o.customer_name || 'Guest',
        avatar: (o.customer_name || 'G').substring(0, 2).toUpperCase(),
        amount: Number(o.total_amount || 0),
        status: o.status || 'Pending',
        statusClass: STATUS_CONFIG[o.status] || 'admin-badge-blue'
      }));
      setRecentOrders(formattedRecent);

      // 4. Top Products & Categories
      const productSales = {};
      const categorySales = {};
      
      ordersData.forEach(order => {
        if (order.order_items) {
          order.order_items.forEach(item => {
            const name = item.product_name || 'Unknown Product';
            const price = Number(item.price || 0);
            const qty = Number(item.quantity || 1);
            const revenue = price * qty;

            if (!productSales[name]) {
              productSales[name] = { name, sales: 0, revenue: 0 };
            }
            productSales[name].sales += qty;
            productSales[name].revenue += revenue;

            // Categories
            const product = productsData.find(p => p.id === item.product_id);
            const category = product?.category || 'Uncategorized';
            categorySales[category] = (categorySales[category] || 0) + revenue;
          });
        }
      });

      const sortedProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4);

      const maxRev = sortedProducts.length > 0 ? sortedProducts[0].revenue : 1;
      
      const formattedProducts = sortedProducts.map(p => ({
        ...p,
        pct: Math.round((p.revenue / maxRev) * 100)
      }));
      setTopProducts(formattedProducts);

      const formattedCategories = Object.entries(categorySales)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      setCategoryData(formattedCategories);

      // 5. Regional Sales
      const regionSalesMap = {};
      ordersData.forEach(o => {
        let region = 'Other';
        if (o.shipping_address) {
          const parts = o.shipping_address.split(',').map(p => p.trim());
          if (parts.length >= 2) {
            region = parts[parts.length - 2];
            if (region.length > 20) region = 'Other'; 
          }
        }
        regionSalesMap[region] = (regionSalesMap[region] || 0) + Number(o.total_amount || 0);
      });

      const formattedRegions = Object.entries(regionSalesMap)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);
      setRegionData(formattedRegions);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const STATS_CARDS = [
    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, change: '+12.5%', up: true, icon: <DollarSign size={22}/>, color: '#d68d3c', bg: '#fff7ed', accent: '#d68d3c' },
    { label: 'Total Orders',  value: stats.orders.toString(),        change: '+8.2%',  up: true, icon: <ShoppingCart size={22}/>, color: '#3b82f6', bg: '#eff6ff', accent: '#3b82f6' },
    { label: 'Customers',     value: stats.customers.toString(),      change: '+15.3%', up: true, icon: <Users size={22}/>, color: '#10b981', bg: '#ecfdf5', accent: '#10b981' },
    { label: 'Retention Rate',value: `${stats.retentionRate}%`,      change: '+5.0%',  up: true, icon: <RefreshCw size={22}/>, color: '#8b5cf6', bg: '#f5f3ff', accent: '#8b5cf6' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Welcome back! Here's what's happening at Nuzvid Agri Farms.</p>
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280', background: 'white', border: '1px solid #e8eaf0', padding: '10px 16px', borderRadius: '10px', fontWeight: 600 }}>
          📅 {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · All time
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading dashboard data...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="admin-stats-grid">
            {STATS_CARDS.map((s, i) => (
              <motion.div key={s.label} className="admin-stat-card" style={{ '--card-accent': s.accent }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="admin-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700, color: s.up ? '#10b981' : '#ef4444' }}>
                    {s.up ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}{s.change}
                  </div>
                </div>
                <div>
                  <div className="admin-stat-value">{s.value}</div>
                  <div className="admin-stat-label">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sales Chart */}
          <motion.div className="admin-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginBottom: '24px' }}>
            <div className="admin-card-header">
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1a1d2e' }}>Sales Overview (Last 7 Days)</h2>
            </div>
            <div className="admin-card-body" style={{ height: '300px', padding: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    itemStyle={{ color: '#1a1d2e', fontWeight: 700 }}
                    formatter={(value) => [`₹${value}`, 'Sales']}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#d68d3c" strokeWidth={3} dot={{ r: 4, fill: '#d68d3c', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6, fill: '#d68d3c', stroke: 'white', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bottom Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
            {/* Recent Orders */}
            <motion.div className="admin-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <div className="admin-card-header">
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1a1d2e' }}>Recent Orders</h2>
                <span className="admin-badge admin-badge-blue">Live</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Order</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, i) => (
                    <tr key={o.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="admin-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] + '20', color: AVATAR_COLORS[i % AVATAR_COLORS.length], width: '34px', height: '34px', borderRadius: '8px', fontSize: '12px' }}>{o.avatar}</div>
                          <span style={{ fontWeight: 600, fontSize: '14px' }}>{o.customer}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: '#6b7280' }}>{o.id}</td>
                      <td style={{ fontWeight: 700 }}>₹{o.amount.toLocaleString()}</td>
                      <td><span className={`admin-badge ${o.statusClass}`}>{o.status}</span></td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No recent orders</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>

            {/* Top Products */}
            <motion.div className="admin-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <div className="admin-card-header">
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1a1d2e' }}>Top Products</h2>
                <TrendingUp size={18} color="#10b981" />
              </div>
              <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {topProducts.map((p, i) => (
                  <div key={p.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', background: ['#fff7ed','#eff6ff','#ecfdf5','#f5f3ff'][i % 4], color: AVATAR_COLORS[i % AVATAR_COLORS.length], borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>#{i+1}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: '#1a1d2e' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{p.sales} units sold</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: '#d68d3c', fontSize: '14px' }}>₹{(p.revenue/1000).toFixed(0)}K</div>
                    </div>
                    <div className="admin-progress-bar">
                      <div className="admin-progress-fill" style={{ width: `${p.pct}%`, background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}></div>
                    </div>
                  </div>
                ))}
                {topProducts.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>No product data</div>
                )}
              </div>
            </motion.div>
          </div>
          {/* Analytics Bottom Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            
            {/* Revenue by Category (Pie Chart) */}
            <motion.div className="admin-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="admin-card-header">
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1a1d2e' }}>Revenue by Category</h2>
              </div>
              <div className="admin-card-body" style={{ height: '300px', padding: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Revenue by Region (Bar Chart) */}
            <motion.div className="admin-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <div className="admin-card-header">
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1a1d2e' }}>Top Regions by Revenue</h2>
              </div>
              <div className="admin-card-body" style={{ height: '300px', padding: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                    <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                    <Tooltip 
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar dataKey="sales" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
