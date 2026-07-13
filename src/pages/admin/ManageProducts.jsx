import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Trash2, Plus, Search, Eye, Package, Edit2, UploadCloud, X } from 'lucide-react';
import { motion } from 'framer-motion';
import './admin.css';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // New Product Form State
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    title: '', price: '', mrp: '', category: '', 
    sku: '', weight: '', stock_quantity: 10, highlights: '', description: '', 
    isNew: false, sale: false, hasVariants: false, variants: []
  });

  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

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
        images: p.images || (p.image_url ? [p.image_url] : []),
        sku: p.sku || '',
        weight: p.weight || '',
        stock_quantity: p.stock_quantity !== null ? p.stock_quantity : 10,
        highlights: p.highlights || [],
        description: p.description,
        isNew: p.is_featured,
        sale: p.is_featured,
        variants: p.variants || [],
        hasVariants: p.variants && p.variants.length > 0
      })));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + imageFiles.length + files.length;
    if (totalImages > 7) {
      toast.error('You can only upload a maximum of 7 images.');
      return;
    }
    setImageFiles([...imageFiles, ...files]);
    setImagePreviews([...imagePreviews, ...files.map(file => URL.createObjectURL(file))]);
    e.target.value = ''; // reset input
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (existingImages.length === 0 && imageFiles.length === 0) {
      toast.error('Please upload at least one product image.');
      return;
    }

    setIsUploading(true);
    let newUrls = [];
    
    try {
      // 1. Upload new image files to Supabase Storage
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        newUrls.push(publicUrlData.publicUrl);
      }

      // 2. Prepare database payload
      const finalImages = [...existingImages, ...newUrls];
      const mainImageUrl = finalImages.length > 0 ? finalImages[0] : '';
      const highlightsArray = newProduct.highlights ? newProduct.highlights.split('\n').filter(h => h.trim() !== '') : [];

      const mainPrice = newProduct.hasVariants && newProduct.variants.length > 0 
        ? parseFloat(newProduct.variants[0].price || 0) 
        : parseFloat(newProduct.price || 0);
        
      const mainMrp = newProduct.hasVariants && newProduct.variants.length > 0
        ? (newProduct.variants[0].mrp ? parseFloat(newProduct.variants[0].mrp) : null)
        : (newProduct.mrp ? parseFloat(newProduct.mrp) : null);

      const mainStock = newProduct.hasVariants && newProduct.variants.length > 0
        ? parseInt(newProduct.variants[0].stock_quantity || 0)
        : parseInt(newProduct.stock_quantity || 0);

      const dbPayload = {
        name: newProduct.title, 
        price: mainPrice, 
        original_price: mainMrp,
        category: newProduct.category,
        image_url: mainImageUrl,
        images: finalImages,
        sku: newProduct.hasVariants ? '' : newProduct.sku,
        weight: newProduct.hasVariants ? '' : newProduct.weight,
        stock_quantity: mainStock,
        highlights: highlightsArray,
        description: newProduct.description,
        in_stock: mainStock > 0,
        is_featured: newProduct.isNew || newProduct.sale,
        variants: newProduct.hasVariants ? newProduct.variants : []
      };

      if (isEditing) {
        const { error } = await supabase.from('products').update(dbPayload).eq('id', editId);
        if (error) throw error;
        toast.success('Product updated successfully!');
      } else {
        const { error } = await supabase.from('products').insert([dbPayload]);
        if (error) throw error;
        toast.success('Product added successfully!');
      }
      
      fetchProducts();
      handleCancel();
    } catch (error) {
      toast.error('Operation failed. Did you run the SQL and create the Storage Bucket?');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClick = (product) => {
    setNewProduct({
      title: product.title,
      price: product.price,
      mrp: product.mrp || '',
      category: product.category,
      sku: product.sku || '',
      weight: product.weight || '',
      stock_quantity: product.stock_quantity,
      highlights: (product.highlights || []).join('\n'),
      description: product.description || '',
      isNew: product.isNew,
      sale: product.sale,
      hasVariants: product.hasVariants || false,
      variants: product.variants || []
    });
    setExistingImages(product.images || (product.image ? [product.image] : []));
    setImageFiles([]);
    setImagePreviews([]);
    setEditId(product.id);
    setIsEditing(true);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditId(null);
    setNewProduct({ 
      title: '', price: '', mrp: '', category: '', 
      sku: '', weight: '', stock_quantity: 10, highlights: '', description: '', 
      isNew: false, sale: false, hasVariants: false, variants: []
    });
    setExistingImages([]);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== productToDelete.id));
      toast.success('Product deleted');
      setProductToDelete(null);
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
        <form onSubmit={handleAddProduct} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'grid', gap: '25px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#1a1d2e', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            {isEditing ? 'Edit Product Details' : 'Add New Product'}
          </h2>

          {/* SECTION: BASIC INFO */}
          <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ margin: '0 0 15px', fontSize: '15px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px' }}>Basic Information</h3>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>Product Title *</label>
              <input required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} placeholder="e.g. A2 Cow Ghee" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>Category *</label>
              <select required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                <option value="">Select Category</option>
                <option value="wood-pressed-oils">Wood Pressed Oils</option>
                <option value="a2-ghee">A2 Ghee</option>
                <option value="natural-sweeteners">Natural Sweeteners</option>
                <option value="countryside-grocery">Countryside Grocery</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>SKU (Stock Keeping Unit)</label>
              <input style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="e.g. NAF-GHEE-1L" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>Weight / Volume</label>
              <input style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={newProduct.weight} onChange={e => setNewProduct({...newProduct, weight: e.target.value})} placeholder="e.g. 1 Liter, 500g" />
            </div>
          </div>

          {/* SECTION: PRICING & INVENTORY */}
          <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', display: 'grid', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px' }}>Pricing & Inventory</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#3b82f6' }}>
                <input type="checkbox" checked={newProduct.hasVariants} onChange={e => setNewProduct({...newProduct, hasVariants: e.target.checked})} />
                This product has multiple variants (e.g., sizes, weights)
              </label>
            </div>

            {!newProduct.hasVariants ? (
              <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>Selling Price (₹) *</label>
                  <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>MRP (₹) - Optional</label>
                  <input type="number" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={newProduct.mrp} onChange={e => setNewProduct({...newProduct, mrp: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>Stock Quantity</label>
                  <input type="number" min="0" required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})} />
                </div>
              </div>
            ) : (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                {newProduct.variants.map((variant, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end', marginBottom: '10px', background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '12px' }}>Variant Name (e.g. 500g) *</label>
                      <input required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={variant.weight} onChange={e => { const v = [...newProduct.variants]; v[index].weight = e.target.value; setNewProduct({...newProduct, variants: v}); }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '12px' }}>Price (₹) *</label>
                      <input type="number" required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={variant.price} onChange={e => { const v = [...newProduct.variants]; v[index].price = e.target.value; setNewProduct({...newProduct, variants: v}); }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '12px' }}>MRP (₹)</label>
                      <input type="number" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={variant.mrp} onChange={e => { const v = [...newProduct.variants]; v[index].mrp = e.target.value; setNewProduct({...newProduct, variants: v}); }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '12px' }}>SKU</label>
                      <input style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={variant.sku} onChange={e => { const v = [...newProduct.variants]; v[index].sku = e.target.value; setNewProduct({...newProduct, variants: v}); }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '12px' }}>Stock *</label>
                      <input type="number" required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} value={variant.stock_quantity} onChange={e => { const v = [...newProduct.variants]; v[index].stock_quantity = e.target.value; setNewProduct({...newProduct, variants: v}); }} />
                    </div>
                    <button type="button" onClick={() => { const v = newProduct.variants.filter((_, i) => i !== index); setNewProduct({...newProduct, variants: v}); }} style={{ padding: '8px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setNewProduct({...newProduct, variants: [...newProduct.variants, { weight: '', price: '', mrp: '', sku: '', stock_quantity: 10 }]})} style={{ padding: '10px 15px', background: 'white', border: '1px dashed #3b82f6', color: '#3b82f6', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><Plus size={16} /> Add Variant</button>
              </div>
            )}
          </div>

          {/* SECTION: IMAGES */}
          <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 15px', fontSize: '15px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px' }}>Product Images (Max 7) *</h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
              {/* Existing Images */}
              {existingImages.map((url, idx) => (
                <div key={`exist-${idx}`} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d1d5db' }}>
                  <img src={url} alt={`Existing ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeExistingImage(idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
                </div>
              ))}
              
              {/* New Image Previews */}
              {imagePreviews.map((preview, idx) => (
                <div key={`new-${idx}`} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px dashed #3b82f6' }}>
                  <img src={preview} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeNewImage(idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
                </div>
              ))}
              
              {/* Upload Button */}
              {(existingImages.length + imageFiles.length) < 7 && (
                <label style={{ width: '100px', height: '100px', borderRadius: '8px', border: '2px dashed #d1d5db', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'white', color: '#6b7280' }}>
                  <UploadCloud size={24} style={{ marginBottom: '8px' }} />
                  <span style={{ fontSize: '12px', textAlign: 'center', padding: '0 5px' }}>Upload</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                </label>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>First image will be used as the main thumbnail. You can select multiple files at once.</p>
          </div>

          {/* SECTION: DESCRIPTIONS & HIGHLIGHTS */}
          <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', display: 'grid', gap: '15px' }}>
            <h3 style={{ margin: '0 0 5px', fontSize: '15px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px' }}>Details & Highlights</h3>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>Product Highlights (Bullet points)</label>
              <textarea style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '100px' }} value={newProduct.highlights} onChange={e => setNewProduct({...newProduct, highlights: e.target.value})} placeholder="Enter each highlight on a new line...&#10;e.g. 100% Organic&#10;No Added Preservatives&#10;Rich in Antioxidants" />
              <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#6b7280' }}>Press Enter to add a new bullet point.</p>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>Full Description</label>
              <textarea style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '150px' }} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Write a detailed product description..." />
            </div>
          </div>

          {/* SECTION: BADGES */}
          <div style={{ display: 'flex', gap: '20px', padding: '0 10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
              <input type="checkbox" checked={newProduct.isNew} onChange={e => setNewProduct({...newProduct, isNew: e.target.checked})} />
              Mark as "New Arrival"
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
              <input type="checkbox" checked={newProduct.sale} onChange={e => setNewProduct({...newProduct, sale: e.target.checked})} />
              Mark as "On Sale"
            </label>
          </div>

          {/* FORM ACTIONS */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', gap: '15px' }}>
            <button type="submit" className="btn-primary" disabled={isUploading} style={{ opacity: isUploading ? 0.7 : 1 }}>
              {isUploading ? 'Uploading & Saving...' : (isEditing ? 'Update Product' : 'Save Product')}
            </button>
            <button type="button" onClick={handleCancel} disabled={isUploading} style={{ padding: '10px 20px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
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
                      <img src={product.image || 'https://via.placeholder.com/40'} alt={product.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#1a1d2e' }}>{product.title}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>SKU: {product.sku || 'N/A'}</div>
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
                      {product.stock_quantity > 0 ? <span className="admin-badge admin-badge-green">In Stock ({product.stock_quantity})</span> : <span className="admin-badge" style={{ background: '#fef2f2', color: '#ef4444' }}>Out of Stock</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="admin-icon-btn" onClick={() => setSelectedProduct(product)} title="View Product"><Eye size={15} /></button>
                      <button className="admin-icon-btn" style={{ color: '#3b82f6' }} onClick={() => handleEditClick(product)} title="Edit Product"><Edit2 size={15} /></button>
                      <button className="admin-icon-btn" style={{ color: '#ef4444' }} onClick={() => setProductToDelete(product)} title="Delete Product"><Trash2 size={15} /></button>
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
            style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}
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
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <img src={selectedProduct.image || 'https://via.placeholder.com/150'} alt={selectedProduct.title} style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1a1d2e' }}>{selectedProduct.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#d68d3c' }}>₹{selectedProduct.price}</span>
                    {selectedProduct.mrp && <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '14px' }}>₹{selectedProduct.mrp}</span>}
                  </div>
                  <div>
                    <span className="admin-badge admin-badge-gray" style={{ display: 'inline-block', marginBottom: '8px' }}>{selectedProduct.category}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', color: '#4b5563', background: '#f9fafb', padding: '10px', borderRadius: '8px' }}>
                    <div><strong>SKU:</strong> {selectedProduct.sku || 'N/A'}</div>
                    <div><strong>Weight:</strong> {selectedProduct.weight || 'N/A'}</div>
                    <div><strong>Stock:</strong> {selectedProduct.stock_quantity}</div>
                    <div><strong>Status:</strong> {selectedProduct.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {selectedProduct.isNew && <span className="admin-badge admin-badge-blue">New Arrival</span>}
                    {selectedProduct.sale && <span className="admin-badge admin-badge-yellow">On Sale</span>}
                  </div>
                </div>
              </div>
              
              {selectedProduct.highlights && selectedProduct.highlights.length > 0 && (
                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px' }}>Highlights</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#4b5563', fontSize: '14px', lineHeight: 1.6 }}>
                    {selectedProduct.highlights.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </div>
              )}

              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}>{selectedProduct.description || 'No description provided.'}</p>
              </div>

              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px' }}>Gallery ({selectedProduct.images.length})</h4>
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {selectedProduct.images.map((url, idx) => (
                      <img key={idx} src={url} alt={`Gallery ${idx}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb', flexShrink: 0 }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="admin-modal-footer" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="admin-btn-secondary" onClick={() => setSelectedProduct(null)}>Close</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="admin-modal-overlay" onClick={() => setProductToDelete(null)}>
          <motion.div 
            className="admin-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}
          >
            <div className="admin-modal-body" style={{ padding: '30px 24px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Trash2 size={30} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 10px', color: '#1a1d2e' }}>Delete Product</h2>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>{productToDelete.title}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="admin-modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'center', background: '#f9fafb' }}>
              <button className="admin-btn-secondary" onClick={() => setProductToDelete(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn-primary" style={{ background: '#ef4444', border: 'none', flex: 1, justifyContent: 'center' }} onClick={confirmDelete}>Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
