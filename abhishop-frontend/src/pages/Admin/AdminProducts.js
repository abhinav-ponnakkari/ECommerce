import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { fetchProducts } from '../../store/slices/productSlice';
import { adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from '../../store/slices/adminSlice';
import { fetchCategories } from '../../store/slices/categorySlice';

const EMPTY = { name: '', description: '', price: '', discountPrice: '', imageUrl: '', images: '', stockQuantity: '', brand: '', sku: '', categoryId: '', isFeatured: false };

function toApiForm(f) {
  return {
    name: f.name, description: f.description,
    price: parseFloat(f.price),
    discountPrice: f.discountPrice ? parseFloat(f.discountPrice) : null,
    imageUrl: f.imageUrl,
    images: f.images ? f.images.split('\n').map(s => s.trim()).filter(Boolean) : [],
    stockQuantity: parseInt(f.stockQuantity, 10),
    brand: f.brand, sku: f.sku,
    categoryId: parseInt(f.categoryId, 10),
    isFeatured: f.isFeatured,
  };
}

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.products);
  const { items: categories } = useSelector(s => s.categories);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts({ pageSize: 100 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  const filtered = items.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY); setEditProduct(null); setShowModal(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description || '',
      price: p.price.toString(),
      discountPrice: p.discountPrice?.toString() || '',
      imageUrl: p.imageUrl || '',
      images: (p.images || []).join('\n'),
      stockQuantity: p.stockQuantity.toString(),
      brand: p.brand, sku: p.sku || '',
      categoryId: p.categoryId.toString(),
      isFeatured: p.isFeatured,
    });
    setEditProduct(p);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = toApiForm(form);
      if (editProduct) {
        await dispatch(adminUpdateProduct({ id: editProduct.id, ...payload })).unwrap();
        dispatch(fetchProducts({ pageSize: 100 }));
      } else {
        await dispatch(adminCreateProduct(payload)).unwrap();
        dispatch(fetchProducts({ pageSize: 100 }));
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    await dispatch(adminDeleteProduct(p.id));
    dispatch(fetchProducts({ pageSize: 100 }));
  };

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Products</div>
          <div className="admin-page-sub">{items.length} products total</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus size={16} /> Add Product</button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-controls">
            <div style={{ position: 'relative' }}>
              <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                className="admin-search-input"
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32 }}
              />
            </div>
          </div>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{filtered.length} results</span>
        </div>
        <div className="admin-table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className={p.stockQuantity < 10 ? 'row-warning' : ''}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={p.imageUrl} alt={p.name} className="admin-product-thumb" />
                        <div>
                          <div className="admin-product-name">{p.name}</div>
                          <div className="admin-product-brand">{p.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.categoryName}</td>
                    <td>
                      {p.discountPrice ? (
                        <span>
                          <span style={{ fontWeight: 700 }}>${p.discountPrice.toFixed(2)}</span>
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', marginLeft: 6, fontSize: 12 }}>${p.price.toFixed(2)}</span>
                        </span>
                      ) : <span style={{ fontWeight: 700 }}>${p.price.toFixed(2)}</span>}
                    </td>
                    <td>
                      <span style={{ color: p.stockQuantity === 0 ? 'var(--error)' : p.stockQuantity < 10 ? '#c07400' : 'var(--success)', fontWeight: 600 }}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td>⭐ {p.rating.toFixed(1)} ({p.reviewCount})</td>
                    <td>
                      <span className={`status-badge ${p.isFeatured ? 'status-confirmed' : 'status-inactive'}`}>
                        {p.isFeatured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        <button className="admin-icon-btn admin-icon-btn--edit" onClick={() => openEdit(p)} title="Edit"><FiEdit2 size={14} /></button>
                        <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => handleDelete(p)} title="Delete"><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="admin-modal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 className="admin-modal-title" style={{ marginBottom: 0 }}>{editProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button className="admin-icon-btn" onClick={() => setShowModal(false)}><FiX size={18} /></button>
            </div>
            <form className="admin-modal-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Product Name *</label>
                <input className="input-field" value={form.name} onChange={f('name')} required />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea className="input-field" rows={3} value={form.description} onChange={f('description')} style={{ resize: 'vertical' }} />
              </div>
              <div className="admin-modal-row">
                <div className="input-group">
                  <label>Price ($) *</label>
                  <input className="input-field" type="number" step="0.01" min="0" value={form.price} onChange={f('price')} required />
                </div>
                <div className="input-group">
                  <label>Discount Price ($)</label>
                  <input className="input-field" type="number" step="0.01" min="0" value={form.discountPrice} onChange={f('discountPrice')} />
                </div>
              </div>
              <div className="admin-modal-row">
                <div className="input-group">
                  <label>Brand *</label>
                  <input className="input-field" value={form.brand} onChange={f('brand')} required />
                </div>
                <div className="input-group">
                  <label>SKU</label>
                  <input className="input-field" value={form.sku} onChange={f('sku')} />
                </div>
              </div>
              <div className="admin-modal-row">
                <div className="input-group">
                  <label>Category *</label>
                  <select className="input-field" value={form.categoryId} onChange={f('categoryId')} required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Stock Quantity *</label>
                  <input className="input-field" type="number" min="0" value={form.stockQuantity} onChange={f('stockQuantity')} required />
                </div>
              </div>
              <div className="input-group">
                <label>Main Image URL *</label>
                <input className="input-field" value={form.imageUrl} onChange={f('imageUrl')} required />
              </div>
              <div className="input-group">
                <label>Additional Images (one URL per line)</label>
                <textarea className="input-field" rows={3} value={form.images} onChange={f('images')} placeholder="https://..." style={{ resize: 'vertical' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isFeatured} onChange={f('isFeatured')} style={{ accentColor: 'var(--primary)' }} />
                Featured product
              </label>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
