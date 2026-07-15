import React, { useState, useEffect } from 'react';
import { Save, Store, Truck, CreditCard, Bell, Shield, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import './admin.css';

const InputField = ({ label, name, type = 'text', prefix, value, onChange, ...rest }) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px', letterSpacing: '0.2px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {prefix && <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '14px' }}>{prefix}</span>}
        <input
          type={type} name={name} value={value} onChange={onChange}
          style={{ width: '100%', padding: prefix ? '12px 14px 12px 36px' : '12px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', background: '#f9fafb', color: '#1a1d2e', outline: 'none', transition: 'all 0.2s' }}
          onFocus={e => { e.target.style.borderColor = '#d68d3c'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(214,141,60,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none'; }}
          {...rest}
        />
      </div>
    </div>
  );

  const Toggle = ({ label, name, description, checked, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', background: checked ? 'rgba(214,141,60,0.04)' : 'white', marginBottom: '12px', transition: 'all 0.2s', borderColor: checked ? '#d68d3c40' : '#e5e7eb' }}>
      <div>
        <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: '14px' }}>{label}</div>
        {description && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{description}</div>}
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer' }}>
        <input type="checkbox" name={name} checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{ position: 'absolute', inset: 0, background: checked ? '#d68d3c' : '#d1d5db', borderRadius: '13px', transition: 'all 0.3s' }}>
          <span style={{ position: 'absolute', width: '20px', height: '20px', background: 'white', borderRadius: '50%', top: '3px', left: checked ? '25px' : '3px', transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></span>
        </span>
      </label>
    </div>
  );

const TABS = [
  { id: 'general',   label: 'General',  icon: <Store size={16}/> },
  { id: 'shipping',  label: 'Shipping', icon: <Truck size={16}/> },
  { id: 'payments',  label: 'Payments', icon: <CreditCard size={16}/> },
  { id: 'notifications', label: 'Alerts', icon: <Bell size={16}/> },
];

const StoreSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    storeName: 'Nuzvid Agri Farms',
    tagline: 'Pure. Organic. From Our Farm to Your Table.',
    contactEmail: 'assist.naf@gmail.com',
    contactPhone: '+91 99999 00000',
    address: 'Nuzvid, Eluru District, Andhra Pradesh – 521201',
    gstin: '37AABCN1234M1Z5',
    flatShippingRate: 100,
    freeShippingThreshold: 3000,
    expressShippingRate: 150,
    platformFee: 5,
    taxRate: 5,
    codEnabled: true,
    upiEnabled: true,
    cardEnabled: false,
    orderConfirmation: true,
    lowStockAlert: true,
    newOrderAlert: true,
    lowStockThreshold: 10,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).single();
      if (data) {
        setSettings(prev => ({
          ...prev,
          flatShippingRate: data.flat_shipping_rate,
          freeShippingThreshold: data.free_shipping_threshold,
          platformFee: data.platform_fee != null ? data.platform_fee : 5
        }));
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Save shipping settings to Supabase
    const { error } = await supabase.from('store_settings').upsert({
      id: 1,
      flat_shipping_rate: Number(settings.flatShippingRate),
      free_shipping_threshold: Number(settings.freeShippingThreshold),
      platform_fee: Number(settings.platformFee),
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save settings.');
      return;
    }

    setSaved(true);
    toast.success('Settings saved successfully!');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Store Settings</h1>
          <p className="admin-page-subtitle">Configure your store, shipping, payments, and notifications</p>
        </div>
        <button onClick={handleSave} className="admin-btn-primary" style={{ background: saved ? '#10b981' : '#d68d3c', gap: '8px', transition: 'background 0.3s' }}>
          {saved ? <><CheckCircle size={16}/>Saved!</> : <><Save size={16}/>Save Changes</>}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Sidebar Tabs */}
        <div className="admin-card" style={{ width: '200px', flexShrink: 0, padding: '8px' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, textAlign: 'left', background: activeTab === tab.id ? '#fff7ed' : 'transparent', color: activeTab === tab.id ? '#d68d3c' : '#6b7280', transition: 'all 0.2s', marginBottom: '2px' }}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <motion.div key={activeTab} className="admin-card" style={{ flex: 1, padding: '28px' }} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          <form onSubmit={handleSave}>
            {activeTab === 'general' && (
              <>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1a1d2e', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}><Store size={18} color="#d68d3c"/>General Information</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <InputField label="Store Name" name="storeName" value={settings.storeName} onChange={handleChange} />
                  <InputField label="GSTIN Number" name="gstin" value={settings.gstin} onChange={handleChange} />
                </div>
                <InputField label="Store Tagline" name="tagline" value={settings.tagline} onChange={handleChange} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <InputField label="Contact Email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} type="email" />
                  <InputField label="Contact Phone" name="contactPhone" value={settings.contactPhone} onChange={handleChange} type="tel" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Physical Address</label>
                  <textarea name="address" value={settings.address} onChange={handleChange}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', minHeight: '80px', resize: 'vertical', background: '#f9fafb', outline: 'none' }} />
                </div>
              </>
            )}

            {activeTab === 'shipping' && (
              <>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1a1d2e', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={18} color="#d68d3c"/>Shipping & Delivery</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 20px' }}>
                  <InputField label="Flat Shipping Rate" name="flatShippingRate" value={settings.flatShippingRate} onChange={handleChange} type="number" prefix="₹" />
                  <InputField label="Free Shipping Above" name="freeShippingThreshold" value={settings.freeShippingThreshold} onChange={handleChange} type="number" prefix="₹" />
                  <InputField label="Platform Fee (Per Order)" name="platformFee" value={settings.platformFee} onChange={handleChange} type="number" prefix="₹" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <InputField label="Express Shipping Rate" name="expressShippingRate" value={settings.expressShippingRate} onChange={handleChange} type="number" prefix="₹" />
                  <InputField label="Default Tax Rate (%)" name="taxRate" value={settings.taxRate} onChange={handleChange} type="number" />
                </div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Shield size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#15803d' }}>Free Shipping Incentive Active</div>
                    <div style={{ fontSize: '13px', color: '#166534', marginTop: '2px' }}>Orders above ₹{settings.freeShippingThreshold} will automatically qualify for free standard shipping.</div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'payments' && (
              <>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1a1d2e', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}><CreditCard size={18} color="#d68d3c"/>Payment Methods</h2>
                <Toggle label="Cash on Delivery (COD)" name="codEnabled" checked={settings.codEnabled} onChange={handleChange} description="Allow customers to pay cash upon delivery" />
                <Toggle label="UPI & Net Banking" name="upiEnabled" checked={settings.upiEnabled} onChange={handleChange} description="Accept payments via UPI, Razorpay or Stripe" />
                <Toggle label="Credit / Debit Card" name="cardEnabled" checked={settings.cardEnabled} onChange={handleChange} description="Accept Visa, Mastercard and Rupay cards" />
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1a1d2e', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={18} color="#d68d3c"/>Admin Notifications</h2>
                <Toggle label="New Order Alerts" name="newOrderAlert" checked={settings.newOrderAlert} onChange={handleChange} description="Get notified via email when a new order is placed" />
                <Toggle label="Order Confirmation Emails" name="orderConfirmation" checked={settings.orderConfirmation} onChange={handleChange} description="Automatically send confirmation emails to customers" />
                <Toggle label="Low Stock Alerts" name="lowStockAlert" checked={settings.lowStockAlert} onChange={handleChange} description="Get notified when a product falls below threshold" />
                {settings.lowStockAlert && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <InputField label="Low Stock Threshold (units)" name="lowStockThreshold" value={settings.lowStockThreshold} onChange={handleChange} type="number" />
                  </motion.div>
                )}
              </>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default StoreSettings;
