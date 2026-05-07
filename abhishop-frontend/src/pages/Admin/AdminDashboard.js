import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiUsers, FiPackage, FiShoppingBag, FiDollarSign,
  FiClock, FiAlertTriangle, FiArrowRight
} from 'react-icons/fi';
import { fetchAdminStats } from '../../store/slices/adminSlice';

const STATUS_CLASS = {
  Pending: 'status-pending', Confirmed: 'status-confirmed',
  Processing: 'status-processing', Shipped: 'status-shipped',
  Delivered: 'status-delivered', Cancelled: 'status-cancelled',
};

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { stats, statsLoading } = useSelector(s => s.admin);

  useEffect(() => { dispatch(fetchAdminStats()); }, [dispatch]);

  if (statsLoading || !stats) return (
    <div>
      <div className="admin-page-header"><div className="admin-page-title">Dashboard</div></div>
      <div className="admin-stats-grid">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 88, borderRadius: 8 }} />)}
      </div>
    </div>
  );

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <FiUsers size={22} />, color: '#4e73df', bg: '#eaeffd' },
    { label: 'Total Products', value: stats.totalProducts, icon: <FiPackage size={22} />, color: '#1cc88a', bg: '#e0f7ef' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <FiShoppingBag size={22} />, color: '#f6c23e', bg: '#fef9e3' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue?.toFixed(2)}`, icon: <FiDollarSign size={22} />, color: '#e74a3b', bg: '#fde8e7' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: <FiClock size={22} />, color: '#fd7e14', bg: '#fff0e5' },
    { label: 'Low Stock Items', value: stats.lowStockProducts, icon: <FiAlertTriangle size={22} />, color: '#858796', bg: '#f0f0f5' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Dashboard</div>
          <div className="admin-page-sub">Overview of your store performance</div>
        </div>
      </div>

      <div className="admin-stats-grid">
        {statCards.map(s => (
          <div key={s.label} className="admin-stat-card" style={{ borderLeftColor: s.color }}>
            <div className="admin-stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div className="admin-stat-num">{s.value}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">Recent Orders</span>
            <Link to="/admin/orders" className="btn btn-outline btn-sm">
              View All <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders?.map(o => (
                  <tr key={o.id}>
                    <td><Link to={`/orders/${o.id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{o.orderNumber}</Link></td>
                    <td>{o.customerName}</td>
                    <td>${o.totalAmount.toFixed(2)}</td>
                    <td><span className={`status-badge ${STATUS_CLASS[o.status] || ''}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">Top Selling Products</span>
            <Link to="/admin/products" className="btn btn-outline btn-sm">
              View All <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts?.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={p.imageUrl} alt={p.name} className="admin-product-thumb" />
                        <span className="admin-product-name" style={{ maxWidth: 140 }}>{p.name}</span>
                      </div>
                    </td>
                    <td>{p.soldCount} units</td>
                    <td>${p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
