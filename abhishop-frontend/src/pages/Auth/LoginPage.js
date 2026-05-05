import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import './AuthPages.css';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const from = location.state?.from || '/';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
    return () => dispatch(clearError());
  }, [user, navigate, from, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">
          <span className="logo-abhi">Abhi</span><span className="logo-shop">Shop</span>
        </div>
        <h1 className="auth-title">Sign In</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email" className="input-field"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              required autoFocus placeholder="your@email.com"
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password" className="input-field"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              required placeholder="Enter password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>OR</span></div>

        <div className="demo-credentials">
          <p>Demo Credentials:</p>
          <button
            className="demo-btn"
            onClick={() => setForm({ email: 'admin@abhishop.com', password: 'Admin@123' })}
          >
            Fill Admin Login
          </button>
        </div>

        <div className="auth-footer">
          New to AbhiShop?{' '}
          <Link to="/register" state={{ from }}>Create an account</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
