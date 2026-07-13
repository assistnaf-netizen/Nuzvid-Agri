import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Search, Save, Package } from 'lucide-react';
import './admin.css';

const ManageInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (productId, variantIndex, newValue) => {
    setProducts(products.map(p => {
      if (p.id !== productId) return p;
      if (variantIndex === null) {
        return { ...p, stock_quantity: newValue };
      } else {
        const newVariants = [...(p.variants || [])];
        newVariants[variantIndex] = { ...newVariants[variantIndex], stock_quantity: newValue };
        return { ...p, variants: newVariants };
      }
    }));
  };

  const saveStock = async (product, variantIndex = null) => {
    setUpdatingId(`${product.id}-${variantIndex}`);
    try {
      if (variantIndex === null) {
        const { error } = await supabase
          .from('products')
          .update({ 
            stock_quantity: parseInt(product.stock_quantity || 0),
            in_stock: parseInt(product.stock_quantity || 0) > 0
          })
          .eq('id', product.id);
        if (error) throw error;
      } else {
        const updatedVariants = [...product.variants];
        const { error } = await supabase
          .from('products')
          .update({ variants: updatedVariants })
          .eq('id', product.id);
        if (error) throw error;
      }
      toast.success('Stock updated');
    } catch (error) {
      toast.error('Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', color: '#27130F' }}>Inventory Management</h1>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-search-wrapper">
            <Search size={16} className="admin-search-icon" />
            <input 
              className="admin-search-input" 
              placeholder="Search by product name or SKU..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {loading ? <div style={{ padding: '20px', textAlign: 'center' }}>Loading inventory...</div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product / Variant</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock Level</th>
                <th style={{ width: '150px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No products found.</td></tr>
              ) : filteredProducts.map(product => {
                const hasVariants = product.variants && product.variants.length > 0;
                
                return (
                  <React.Fragment key={product.id}>
                    {/* Main Product Row */}
                    <tr style={{ background: hasVariants ? '#f9fafb' : 'white', borderBottom: hasVariants ? 'none' : '1px solid #eee' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={product.image_url || 'https://via.placeholder.com/40'} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                          <div style={{ fontWeight: 700, color: '#1a1d2e' }}>{product.name}</div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>{product.sku || (hasVariants ? 'Multiple SKUs' : 'N/A')}</span>
                      </td>
                      <td>
                        {hasVariants ? (
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>Multiple Prices</span>
                        ) : (
                          <div style={{ fontWeight: 700, color: '#d68d3c' }}>₹{product.price}</div>
                        )}
                      </td>
                      <td>
                        {hasVariants ? (
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>See variants below</span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input 
                              type="number" 
                              min="0"
                              value={product.stock_quantity || 0} 
                              onChange={(e) => handleStockChange(product.id, null, e.target.value)}
                              style={{ width: '80px', padding: '6px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                            />
                            {product.stock_quantity <= 5 && product.stock_quantity > 0 && <span style={{ color: '#d97706', fontSize: '12px', fontWeight: 600 }}>Low Stock</span>}
                            {product.stock_quantity <= 0 && <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>Out of Stock</span>}
                          </div>
                        )}
                      </td>
                      <td>
                        {!hasVariants && (
                          <button 
                            className="btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: updatingId === `${product.id}-null` ? 0.7 : 1 }}
                            onClick={() => saveStock(product, null)}
                            disabled={updatingId === `${product.id}-null`}
                          >
                            <Save size={14} /> Save
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {/* Variant Rows */}
                    {hasVariants && product.variants.map((variant, vIndex) => (
                      <tr key={`${product.id}-${vIndex}`} style={{ borderBottom: vIndex === product.variants.length - 1 ? '1px solid #eee' : 'none' }}>
                        <td style={{ paddingLeft: '60px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '14px' }}>
                            <div style={{ width: '12px', height: '12px', borderLeft: '2px solid #d1d5db', borderBottom: '2px solid #d1d5db', marginTop: '-10px' }}></div>
                            Variant: <strong>{variant.weight}</strong>
                          </div>
                        </td>
                        <td><span style={{ fontSize: '13px', color: '#6b7280' }}>{variant.sku || 'N/A'}</span></td>
                        <td><div style={{ fontWeight: 700, color: '#d68d3c' }}>₹{variant.price}</div></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input 
                              type="number" 
                              min="0"
                              value={variant.stock_quantity || 0} 
                              onChange={(e) => handleStockChange(product.id, vIndex, e.target.value)}
                              style={{ width: '80px', padding: '6px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                            />
                            {variant.stock_quantity <= 5 && variant.stock_quantity > 0 && <span style={{ color: '#d97706', fontSize: '12px', fontWeight: 600 }}>Low Stock</span>}
                            {variant.stock_quantity <= 0 && <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>Out of Stock</span>}
                          </div>
                        </td>
                        <td>
                          <button 
                            className="btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: updatingId === `${product.id}-${vIndex}` ? 0.7 : 1 }}
                            onClick={() => saveStock(product, vIndex)}
                            disabled={updatingId === `${product.id}-${vIndex}` }
                          >
                            <Save size={14} /> Save
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageInventory;
