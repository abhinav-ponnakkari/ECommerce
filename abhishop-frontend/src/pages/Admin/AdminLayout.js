import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers,
  FiBarChart2, FiChevronRight
} from 'react-icons/fi';
import './Admin.css';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: <FiBarChart2 size={18} />, end: true },
  { to: '/admin/products', label: 'Products', icon: <FiPackage size={18} /> },
  { to: '/admin/orders', label: 'Orders', icon: <FiShoppingBag size={18} /> },
  { to: '/admin/users', label: 'Users', icon: <FiUsers size={18} /> },
];

export default function AdminLayout() {
  const { user } = useSelector(s => s.auth);
  if (!user || user.role !== 'Admin') return <Navigate to="/" replace />;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <FiGrid size={20} />
          <span>Admin Panel</span>
        </div>
        <nav className="admin-nav">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              {n.icon}
              <span>{n.label}</span>
              <FiChevronRight size={14} className="admin-nav-arrow" />
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
