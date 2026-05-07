import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch, FiExternalLink } from 'react-icons/fi';
import api from '../../services/api';
import { adminUpdateOrderStatus } from '../../store/slices/adminSlice';
import toast from 'react-hot-toast';

const STATUSES = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_CLASS = {
  Pending: 'status-pending', Confirmed: 'status-confirmed',
  Processing: 'status-processing', Shipped: 'status-shipped',
  Delivered: 'status-delivered', Cancelled: 'status-cancelled',
};

export default function AdminOrders() {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    api.get('/orders/all')
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await dispatch(adminUpdateOrderStatus({ id: orderId, status: newStatus })).unwrap();
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } finally {
      setUpdatingId(null);
    }
  };

  const revenue = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Orders</div>
          <div className="admin-page-sub">{orders.length} orders · ${revenue.toFixed(2)} total revenue</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-controls">
            <div style={{ position: 'relative' }}>
              <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                className="admin-search-input"
                placeholder="Search order number…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="btn btn-sm"
                  style={{
                    background: statusFilter === s ? 'var(--primary)' : 'transparent',
                    color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
                    border: statusFilter === s ? '1px solid var(--primary)' : '1px solid var(--border)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{filtered.length} results</span>
        </div>

        <div className="admin-table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Update Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700 }}>{o.orderNumber}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td>{o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}</td>
                    <td style={{ fontWeight: 700 }}>${o.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${o.paymentStatus === 'Paid' ? 'status-delivered' : 'status-pending'}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${STATUS_CLASS[o.status] || ''}`}>{o.status}</span>
                    </td>
                    <td>
                      <select
                        className="input-field"
                        style={{ padding: '6px 8px', fontSize: 13, width: 140 }}
                        value={o.status}
                        disabled={updatingId === o.id || o.status === 'Cancelled'}
                        onChange={e => handleStatusChange(o.id, e.target.value)}
                      >
                        {['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <Link to={`/orders/${o.id}`} className="admin-icon-btn" title="View">
                        <FiExternalLink size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
