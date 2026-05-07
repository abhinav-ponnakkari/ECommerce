import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch, FiToggleLeft, FiToggleRight, FiShield, FiUser } from 'react-icons/fi';
import { fetchAdminUsers, toggleUserActive } from '../../store/slices/adminSlice';

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { users, usersLoading } = useSelector(s => s.admin);
  const { user: currentUser } = useSelector(s => s.auth);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => { dispatch(fetchAdminUsers()); }, [dispatch]);

  const filtered = users.filter(u => {
    const matchSearch =
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleToggle = async (userId) => {
    if (userId === currentUser?.id) return;
    setTogglingId(userId);
    try { await dispatch(toggleUserActive(userId)).unwrap(); }
    finally { setTogglingId(null); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Users</div>
          <div className="admin-page-sub">{users.length} registered users</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-controls">
            <div style={{ position: 'relative' }}>
              <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                className="admin-search-input"
                placeholder="Search users…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32 }}
              />
            </div>
            {['All', 'Admin', 'Customer'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className="btn btn-sm"
                style={{
                  background: roleFilter === r ? 'var(--primary)' : 'transparent',
                  color: roleFilter === r ? '#fff' : 'var(--text-secondary)',
                  border: roleFilter === r ? '1px solid var(--primary)' : '1px solid var(--border)',
                }}
              >
                {r}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{filtered.length} results</span>
        </div>

        <div className="admin-table-wrap">
          {usersLoading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Toggle</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={`https://ui-avatars.com/api/?name=${u.firstName}+${u.lastName}&background=FF6B35&color=fff&size=32`}
                          alt={u.firstName}
                          style={{ width: 32, height: 32, borderRadius: '50%' }}
                        />
                        <span style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.phoneNumber || '—'}</td>
                    <td>
                      <span className={`status-badge ${u.role === 'Admin' ? 'status-admin' : 'status-customer'}`}>
                        {u.role === 'Admin' ? <FiShield size={11} /> : <FiUser size={11} />}
                        &nbsp;{u.role}
                      </span>
                    </td>
                    <td>{u.orderCount}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`status-badge ${u.isActive ? 'status-active' : 'status-inactive'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-icon-btn"
                        onClick={() => handleToggle(u.id)}
                        disabled={togglingId === u.id || u.id === currentUser?.id}
                        title={u.id === currentUser?.id ? "Can't deactivate yourself" : u.isActive ? 'Deactivate user' : 'Activate user'}
                        style={{ color: u.isActive ? 'var(--success)' : 'var(--error)', width: 'auto', padding: '4px 10px', gap: 4 }}
                      >
                        {u.isActive
                          ? <><FiToggleRight size={16} /> Active</>
                          : <><FiToggleLeft size={16} /> Inactive</>}
                      </button>
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
