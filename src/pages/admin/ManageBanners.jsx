import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Plus, Trash2, Monitor, Smartphone } from 'lucide-react';

const ManageBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBanner, setNewBanner] = useState({ desktop: '', mobile: '' });

  const defaultBanners = [{ 
    desktop: 'https://www.nuzvidagrifarms.com/cdn/shop/files/new_1920x.jpg?v=1759635977',
    mobile: 'https://www.nuzvidagrifarms.com/cdn/shop/files/new_1920x.jpg?v=1759635977'
  }];

  useEffect(() => {
    fetchBanners();
  }, []);

  const formatBanners = (parsed) => {
    return parsed.map(b => typeof b === 'string' ? { desktop: b, mobile: b } : b);
  };

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_banners')
        .single();
      
      if (data && data.value) {
        setBanners(formatBanners(JSON.parse(data.value)));
      } else {
        const localBanners = localStorage.getItem('hero_banners');
        if (localBanners) setBanners(formatBanners(JSON.parse(localBanners)));
        else setBanners(defaultBanners);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      const localBanners = localStorage.getItem('hero_banners');
      if (localBanners) setBanners(formatBanners(JSON.parse(localBanners)));
      else setBanners(defaultBanners);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const bannersStr = JSON.stringify(banners);
    
    localStorage.setItem('hero_banners', bannersStr);
    
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'hero_banners', value: bannersStr }, { onConflict: 'key' });
        
      if (error && error.code !== '42P01') { 
        throw error;
      }
      toast.success('Banners updated successfully!');
    } catch (error) {
      toast.success('Banners updated locally!');
    } finally {
      setSaving(false);
    }
  };

  const addBanner = () => {
    if (!newBanner.desktop || !newBanner.mobile) {
      toast.error('Please provide both Desktop and Mobile banner URLs');
      return;
    }
    if (banners.length >= 5) {
      toast.error('You can only have up to 5 banners');
      return;
    }
    setBanners([...banners, newBanner]);
    setNewBanner({ desktop: '', mobile: '' });
  };

  const removeBanner = (indexToRemove) => {
    setBanners(banners.filter((_, index) => index !== indexToRemove));
  };

  if (loading) return <p>Loading banner settings...</p>;

  return (
    <div>
      <h1 style={{ fontSize: '28px', color: '#27130F', marginBottom: '10px' }}>Manage Hero Banners</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Upload up to 5 sliding banners for your storefront. Provide both a Desktop and Mobile version for each slide.</p>
      
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', maxWidth: '900px' }}>
        
        {banners.length < 5 && (
          <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>Add New Banner Slide ({banners.length}/5)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  <Monitor size={16} /> Desktop Image URL
                </label>
                <input 
                  type="url" 
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                  value={newBanner.desktop} 
                  onChange={e => setNewBanner({...newBanner, desktop: e.target.value})} 
                  placeholder="https://..."
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  <Smartphone size={16} /> Mobile Image URL
                </label>
                <input 
                  type="url" 
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                  value={newBanner.mobile} 
                  onChange={e => setNewBanner({...newBanner, mobile: e.target.value})} 
                  placeholder="https://..."
                />
              </div>
            </div>
            <button type="button" onClick={addBanner} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Plus size={18} /> Add Banner Pair
            </button>
          </div>
        )}

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Current Banners</h3>
          {banners.length === 0 ? (
            <p style={{ color: '#666' }}>No banners added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {banners.map((banner, index) => (
                <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd', display: 'flex', padding: '15px', gap: '20px', alignItems: 'center' }}>
                  
                  <div style={{ flex: 2 }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Monitor size={12} /> Desktop View
                    </div>
                    <img src={banner.desktop} alt={`Desktop ${index + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#f0f0f0' }} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Smartphone size={12} /> Mobile View
                    </div>
                    <img src={banner.mobile} alt={`Mobile ${index + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#f0f0f0' }} />
                  </div>

                  <button 
                    onClick={() => removeBanner(index)}
                    style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#fff', color: '#ff6b6b', border: '1px solid #ff6b6b', padding: '8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Remove Banner"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button onClick={handleSave} className="btn-primary" disabled={saving} style={{ width: '100%', fontSize: '16px', padding: '12px', marginTop: '20px' }}>
          {saving ? 'Saving to Database...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};

export default ManageBanners;
