import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiMail, FiSmartphone, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { login, clearError } from '../../store/slices/authSlice';
import './AuthPages.css';

const LOGIN_TABS = [
  { id: 'email',  label: 'Email',  icon: <FiMail size={15} /> },
  { id: 'mobile', label: 'Mobile', icon: <FiSmartphone size={15} /> },
];

function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, loading, error } = useSelector(s => s.auth);

  const from = location.state?.from || '/';

  const [tab, setTab]           = useState('email');   // 'email' | 'mobile'
  const [loginId, setLoginId]   = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
    return () => dispatch(clearError());
  }, [user, navigate, from, dispatch]);

  // Reset input when switching tabs
  const switchTab = (id) => {
    setTab(id);
    setLoginId('');
    dispatch(clearError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ loginId: loginId.trim(), password }));
  };

  const fillDemo = () => {
    setTab('email');
    setLoginId('admin@abhishop.com');
    setPassword('Admin@123');
  };

  return (
    <div className="auth-page">
      <div className="auth-card login-card card">

        {/* Logo */}
        <Link to="/" className="auth-logo">
          <span className="logo-abhi">Abhi</span><span className="logo-shop">Shop</span>
        </Link>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {/* Tab switcher */}
        <div className="login-tabs">
          {LOGIN_TABS.map(t => (
            <button
              key={t.id}
              className={`login-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => switchTab(t.id)}
              type="button"
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="auth-error" role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>

          {tab === 'email' ? (
            <div className="input-group">
              <label htmlFor="loginId">Email Address</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" size={16} />
                <input
                  id="loginId"
                  type="email"
                  className="input-field input-padded"
                  placeholder="your@email.com"
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>
            </div>
          ) : (
            <div className="input-group">
              <label htmlFor="loginId">Mobile Number</label>
              <div className="input-with-icon">
                <FiSmartphone className="input-icon" size={16} />
                <input
                  id="loginId"
                  type="tel"
                  className="input-field input-padded"
                  placeholder="+1 234 567 8900"
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  required
                  autoFocus
                  autoComplete="tel"
                />
              </div>
              <span className="field-hint">Enter the number you registered with</span>
            </div>
          )}

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-link" tabIndex={-1}>Forgot password?</Link>
            </div>
            <div className="input-with-icon">
              <FiLock className="input-icon" size={16} />
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                className="input-field input-padded input-padded-right"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw(v => !v)}
                tabIndex={-1}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <label className="remember-row">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
            />
            <span>Keep me signed in</span>
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg auth-btn"
            disabled={loading || !loginId || !password}
          >
            {loading
              ? <span className="btn-loading"><span className="spinner-sm" /> Signing in…</span>
              : <span>Sign In <FiArrowRight size={16} /></span>
            }
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider"><span>OR</span></div>

        {/* Demo quick-fill */}
        <div className="demo-credentials">
          <p>Try the demo account:</p>
          <button className="demo-btn" onClick={fillDemo} type="button">
            ⚡ Fill Admin Credentials
          </button>
        </div>

        <div className="auth-footer">
          New to AbhiShop?{' '}
          <Link to="/register" state={{ from }}>Create a free account</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
