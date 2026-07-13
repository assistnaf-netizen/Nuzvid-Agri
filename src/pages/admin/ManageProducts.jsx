import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Trash2, Plus, Search, Eye, Package, Download, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import './admin.css';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // New Product Form State
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    title: '', price: '', mrp: '', category: '', image: '', hoverImage: '', description: '', isNew: false, sale: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts((data || []).map(p => ({
        id: p.id,
        title: p.name,
        price: p.price,
        mrp: p.original_price,
        category: p.category,
        image: p.image_url,
        hoverImage: p.image_url,
        description: p.description,
        isNew: p.is_featured,
        sale: p.is_featured
      })));
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback for demonstration if table doesn't exist
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const { data, error } = await supabase.from('products').update({ 
          name: newProduct.title, 
          price: parseFloat(newProduct.price), 
          original_price: newProduct.mrp ? parseFloat(newProduct.mrp) : null,
          category: newProduct.category,
          image_url: newProduct.image || 'https://via.placeholder.com/150',
          description: newProduct.description,
          is_featured: newProduct.isNew || newProduct.sale
        }).eq('id', editId).select();
        
        if (error) throw error;
        
        const updatedProduct = {
          id: data[0].id,
          title: data[0].name,
          price: data[0].price,
          mrp: data[0].original_price,
          category: data[0].category,
          image: data[0].image_url,
          hoverImage: data[0].image_url,
          description: data[0].description,
          isNew: data[0].is_featured,
          sale: data[0].is_featured
        };
        
        setProducts(products.map(p => p.id === editId ? updatedProduct : p));
        toast.success('Product updated successfully!');
      } else {
        const { data, error } = await supabase.from('products').insert([
          { 
            name: newProduct.title, 
            price: parseFloat(newProduct.price), 
            original_price: newProduct.mrp ? parseFloat(newProduct.mrp) : null,
            category: newProduct.category,
            image_url: newProduct.image || 'https://via.placeholder.com/150',
            description: newProduct.description,
            in_stock: true,
            is_featured: newProduct.isNew || newProduct.sale
          }
        ]).select();
        
        if (error) throw error;
        
        const insertedProduct = {
          id: data[0].id,
          title: data[0].name,
          price: data[0].price,
          mrp: data[0].original_price,
          category: data[0].category,
          image: data[0].image_url,
          hoverImage: data[0].image_url,
          description: data[0].description,
          isNew: data[0].is_featured,
          sale: data[0].is_featured
        };
        
        setProducts([insertedProduct, ...products]);
        toast.success('Product added successfully!');
      }
      
      setNewProduct({ title: '', price: '', mrp: '', category: '', image: '', hoverImage: '', description: '', isNew: false, sale: false });
      setIsAdding(false);
      setIsEditing(false);
      setEditId(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditClick = (product) => {
    setNewProduct({
      title: product.title,
      price: product.price,
      mrp: product.mrp || '',
      category: product.category,
      image: product.image,
      hoverImage: product.hoverImage || '',
      description: product.description || '',
      isNew: product.isNew,
      sale: product.sale
    });
    setEditId(product.id);
    setIsEditing(true);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditId(null);
    setNewProduct({ title: '', price: '', mrp: '', category: '', image: '', hoverImage: '', description: '', isNew: false, sale: false });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', color: '#27130F' }}>Manage Products</h1>
        <button onClick={() => { if(isAdding) handleCancel(); else setIsAdding(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Plus size={18} /> {isAdding ? 'Close Form' : 'Add Product'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddProduct} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
            <input required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Offer Price (₹)</label>
            <input type="number" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>MRP (₹) - Optional</label>
            <input type="number" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={newProduct.mrp} onChange={e => setNewProduct({...newProduct, mrp: e.target.value})} placeholder="e.g. 500" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Category</label>
            <select required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
              <option value="">Select Category</option>
              <option value="wood-pressed-oils">Wood Pressed Oils</option>
              <option value="a2-ghee">A2 Ghee</option>
              <option value="natural-sweeteners">Natural Sweeteners</option>
              <option value="countryside-grocery">Countryside Grocery</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Image URL</label>
            <input style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} placeholder="https://..." />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Hover Image URL (Optional)</label>
            <input style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={newProduct.hoverImage} onChange={e => setNewProduct({...newProduct, hoverImage: e.target.value})} placeholder="https://..." />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
            <textarea style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Enter product description..." />
          </div>
          <div style={{ display: 'flex', gap: '20px', gridColumn: '1 / -1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={newProduct.isNew} onChange={e => setNewProduct({...newProduct, isNew: e.target.checked})} />
              Mark as "New"
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={newProduct.sale} onChange={e => setNewProduct({...newProduct, sale: e.target.checked})} />
              Mark as "Sale"
            </label>
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
            <button type="submit" className="btn-primary">{isEditing ? 'Update Product' : 'Save Product'}</button>
            <button type="button" onClick={handleCancel} style={{ marginLeft: '10px', padding: '8px 15px', background: 'none', border: '1px solid #ccc', borderRadius: '4px' }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <p>Loading products...</p> : (
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-search-wrapper">
              <Search size={16} className="admin-search-icon" />
              <input className="admin-search-input" placeholder="Search by title or category..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price / MRP</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No products found in database.</td></tr>
              ) : products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase())).map((product, i) => (
                <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={product.image} alt={product.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#1a1d2e' }}>{product.title}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>ID: {product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-gray">{product.category}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#d68d3c' }}>₹{product.price}</div>
                    {product.mrp && <div style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '12px' }}>₹{product.mrp}</div>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {product.isNew && <span className="admin-badge admin-badge-blue">New</span>}
                      {product.sale && <span className="admin-badge admin-badge-yellow">Sale</span>}
                      {!product.isNew && !product.sale && <span className="admin-badge admin-badge-green">Standard</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="admin-icon-btn" onClick={() => setSelectedProduct(product)} title="View Product"><Eye size={15} /></button>
                      <button className="admin-icon-btn" style={{ color: '#3b82f6' }} onClick={() => handleEditClick(product)} title="Edit Product"><Edit2 size={15} /></button>
                      <button className="admin-icon-btn" style={{ color: '#ef4444' }} onClick={() => handleDelete(product.id)} title="Delete Product"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="admin-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <motion.div 
            className="admin-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', width: '90%' }}
          >
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Package size={24} color="#d68d3c" />
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#1a1d2e' }}>Product Details</h2>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>ID: {selectedProduct.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>

            <div className="admin-modal-body" style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <img src={selectedProduct.image} alt={selectedProduct.title} style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1a1d2e' }}>{selectedProduct.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#d68d3c' }}>₹{selectedProduct.price}</span>
                    {selectedProduct.mrp && <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '14px' }}>₹{selectedProduct.mrp}</span>}
                  </div>
                  <div>
                    <span className="admin-badge admin-badge-gray" style={{ display: 'inline-block', marginBottom: '8px' }}>{selectedProduct.category}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {selectedProduct.isNew && <span className="admin-badge admin-badge-blue">New Arrival</span>}
                    {selectedProduct.sale && <span className="admin-badge admin-badge-yellow">On Sale</span>}
                  </div>
                </div>
              </div>
              
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}>{selectedProduct.description || 'No description provided.'}</p>
              </div>

              {selectedProduct.hoverImage && (
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px' }}>Hover Image</h4>
                  <img src={selectedProduct.hoverImage} alt="Hover preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                </div>
              )}
            </div>

            <div className="admin-modal-footer" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="admin-btn-secondary" onClick={() => setSelectedProduct(null)}>Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
