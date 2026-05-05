import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../store/slices/authSlice';
import './AuthPages.css';

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phoneNumber: '' });
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (user) navigate('/', { replace: true });
    return () => dispatch(clearError());
  }, [user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setPwError("Passwords don't match"); return; }
    if (form.password.length < 6) { setPwError('Password must be at least 6 characters'); return; }
    setPwError('');
    const { confirmPassword, ...data } = form;
    dispatch(register(data));
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-card register-card card">
        <Link to="/" className="auth-logo">
          <span className="logo-abhi">Abhi</span><span className="logo-shop">Shop</span>
        </Link>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join millions of happy shoppers</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="name-row">
            <div className="input-group">
              <label>First Name</label>
              <input className="input-field" value={form.firstName} onChange={update('firstName')} required placeholder="John" />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input className="input-field" value={form.lastName} onChange={update('lastName')} required placeholder="Doe" />
            </div>
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" className="input-field" value={form.email} onChange={update('email')} required placeholder="your@email.com" />
          </div>
          <div className="input-group">
            <label>Phone Number <span className="optional">(optional)</span></label>
            <input type="tel" className="input-field" value={form.phoneNumber} onChange={update('phoneNumber')} placeholder="+1 234 567 8900" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" className={`input-field ${pwError ? 'error' : ''}`} value={form.password} onChange={update('password')} required placeholder="Min 6 characters" />
          </div>
          <div className="input-group">
            <label>Confirm Password</label>
            <input type="password" className={`input-field ${pwError ? 'error' : ''}`} value={form.confirmPassword} onChange={update('confirmPassword')} required placeholder="Repeat password" />
            {pwError && <span className="text-error">{pwError}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
