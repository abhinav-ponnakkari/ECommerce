import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiUser, FiLock, FiPackage, FiSave } from 'react-icons/fi';
import { updateProfile } from '../../store/slices/authSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './ProfilePage.css';

function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phoneNumber: user?.phoneNumber || '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    dispatch(updateProfile(profile));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) { setPwError("Passwords don't match"); return; }
    if (password.newPassword.length < 6) { setPwError('Min 6 characters'); return; }
    setPwError('');
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: password.currentPassword, newPassword: password.newPassword });
      toast.success('Password updated!');
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page page-wrapper">
      <div className="container profile-layout">
        <aside className="profile-sidebar card">
          <div className="profile-avatar-section">
            <img src={user?.avatarUrl} alt={user?.firstName} className="profile-avatar" />
            <h3>{user?.firstName} {user?.lastName}</h3>
            <p className="text-muted text-sm">{user?.email}</p>
            <span className="badge badge-primary">{user?.role}</span>
          </div>
          <nav className="profile-nav">
            {[
              { id: 'profile', icon: <FiUser size={16} />, label: 'Profile Settings' },
              { id: 'security', icon: <FiLock size={16} />, label: 'Security' },
            ].map(item => (
              <button key={item.id} className={`profile-nav-item ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
                {item.icon} {item.label}
              </button>
            ))}
            <a href="/orders" className="profile-nav-item">
              <FiPackage size={16} /> My Orders
            </a>
          </nav>
        </aside>

        <main className="profile-main">
          {tab === 'profile' && (
            <div className="profile-section card">
              <h2 className="section-title" style={{ fontSize: '20px', marginBottom: '4px' }}>Profile Information</h2>
              <p className="text-muted text-sm mb-4">Update your personal details</p>
              <form onSubmit={handleProfileSave} className="profile-form">
                <div className="form-row">
                  <div className="input-group">
                    <label>First Name</label>
                    <input className="input-field" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label>Last Name</label>
                    <input className="input-field" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} required />
                  </div>
                </div>
                <div className="input-group">
                  <label>Email <span className="text-muted text-sm">(cannot be changed)</span></label>
                  <input className="input-field" value={user?.email} disabled style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }} />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input className="input-field" type="tel" value={profile.phoneNumber} onChange={e => setProfile({ ...profile, phoneNumber: e.target.value })} placeholder="+1 234 567 8900" />
                </div>
                <button type="submit" className="btn btn-primary">
                  <FiSave size={16} /> Save Changes
                </button>
              </form>
            </div>
          )}

          {tab === 'security' && (
            <div className="profile-section card">
              <h2 className="section-title" style={{ fontSize: '20px', marginBottom: '4px' }}>Change Password</h2>
              <p className="text-muted text-sm mb-4">Keep your account secure</p>
              <form onSubmit={handlePasswordChange} className="profile-form">
                <div className="input-group">
                  <label>Current Password</label>
                  <input type="password" className="input-field" value={password.currentPassword} onChange={e => setPassword({ ...password, currentPassword: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>New Password</label>
                  <input type="password" className={`input-field ${pwError ? 'error' : ''}`} value={password.newPassword} onChange={e => setPassword({ ...password, newPassword: e.target.value })} required placeholder="Min 6 characters" />
                </div>
                <div className="input-group">
                  <label>Confirm New Password</label>
                  <input type="password" className={`input-field ${pwError ? 'error' : ''}`} value={password.confirmPassword} onChange={e => setPassword({ ...password, confirmPassword: e.target.value })} required />
                  {pwError && <span className="text-error">{pwError}</span>}
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <FiLock size={16} /> {saving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ProfilePage;
