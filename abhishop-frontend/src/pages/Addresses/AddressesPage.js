import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiHome, FiCheck } from 'react-icons/fi';
import { fetchAddresses, createAddress, updateAddress, deleteAddress } from '../../store/slices/addressSlice';
import './AddressesPage.css';

const EMPTY_FORM = { fullName: '', street: '', city: '', state: '', zipCode: '', country: 'United States', phoneNumber: '', isDefault: false };

export default function AddressesPage() {
  const dispatch = useDispatch();
  const { items: addresses, loading } = useSelector(s => s.addresses);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { dispatch(fetchAddresses()); }, [dispatch]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (addr) => {
    setForm({ fullName: addr.fullName, street: addr.street, city: addr.city, state: addr.state, zipCode: addr.zipCode, country: addr.country, phoneNumber: addr.phoneNumber, isDefault: addr.isDefault });
    setEditId(addr.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await dispatch(updateAddress({ id: editId, ...form })).unwrap();
      else await dispatch(createAddress(form)).unwrap();
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this address?')) dispatch(deleteAddress(id));
  };

  return (
    <div className="page-wrapper">
      <div className="container addr-container">
        <div className="addr-header">
          <div>
            <h1 className="section-title"><FiMapPin size={24} style={{ color: 'var(--primary)' }} /> My Addresses</h1>
            <p className="section-subtitle">Manage your saved shipping addresses</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <FiPlus size={16} /> Add New Address
          </button>
        </div>

        {showForm && (
          <div className="addr-form-card card">
            <h3 className="addr-form-title">{editId ? 'Edit Address' : 'Add New Address'}</h3>
            <form onSubmit={handleSubmit} className="addr-form">
              <div className="addr-form-row">
                <div className="input-group">
                  <label>Full Name *</label>
                  <input className="input-field" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input className="input-field" value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} />
                </div>
              </div>

              <div className="input-group">
                <label>Street Address *</label>
                <input className="input-field" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} placeholder="123 Main St, Apt 4B" required />
              </div>

              <div className="addr-form-row">
                <div className="input-group">
                  <label>City *</label>
                  <input className="input-field" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required />
                </div>
                <div className="input-group">
                  <label>State / Province *</label>
                  <input className="input-field" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} required />
                </div>
                <div className="input-group">
                  <label>ZIP / Postal Code *</label>
                  <input className="input-field" value={form.zipCode} onChange={e => setForm(f => ({ ...f, zipCode: e.target.value }))} required />
                </div>
              </div>

              <div className="input-group">
                <label>Country</label>
                <select className="input-field" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                  {['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'India', 'Japan', 'Singapore', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <label className="addr-default-row">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} />
                Set as default address
              </label>

              <div className="addr-form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editId ? 'Update Address' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="addr-skeleton-grid">
            {[...Array(3)].map((_, i) => <div key={i} className="addr-skeleton skeleton" />)}
          </div>
        ) : addresses.length === 0 ? (
          <div className="addr-empty card">
            <FiHome size={52} className="addr-empty-icon" />
            <h3>No addresses saved</h3>
            <p>Add an address to speed up checkout.</p>
            <button className="btn btn-primary" onClick={openAdd}><FiPlus size={16} /> Add Address</button>
          </div>
        ) : (
          <div className="addr-grid">
            {addresses.map(addr => (
              <div key={addr.id} className={`addr-card card ${addr.isDefault ? 'addr-card--default' : ''}`}>
                {addr.isDefault && <span className="addr-default-badge"><FiCheck size={12} /> Default</span>}
                <div className="addr-icon"><FiMapPin size={20} /></div>
                <div className="addr-details">
                  <p className="addr-name">{addr.fullName}</p>
                  <p className="addr-line">{addr.street}</p>
                  <p className="addr-line">{addr.city}, {addr.state} {addr.zipCode}</p>
                  <p className="addr-line">{addr.country}</p>
                  {addr.phoneNumber && <p className="addr-phone">{addr.phoneNumber}</p>}
                </div>
                <div className="addr-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(addr)}><FiEdit2 size={14} /> Edit</button>
                  <button className="btn btn-outline btn-sm addr-delete-btn" onClick={() => handleDelete(addr.id)}><FiTrash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
