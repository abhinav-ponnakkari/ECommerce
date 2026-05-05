import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiMail, FiSmartphone, FiLock, FiEye, FiEyeOff,
  FiArrowRight, FiArrowLeft, FiRefreshCw, FiCheckCircle, FiZap,
} from 'react-icons/fi';
import { login, clearError } from '../../store/slices/authSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './AuthPages.css';

const LOGIN_TABS = [
  { id: 'email',  label: 'Email',  icon: <FiMail size={15} /> },
  { id: 'mobile', label: 'Mobile', icon: <FiSmartphone size={15} /> },
];

const OTP_LENGTH = 6;
const OTP_EXPIRY = 120;

// ── OTP 6-box input ──────────────────────────────────────────────────────────
function OtpInput({ value, onChange, disabled }) {
  const boxes = value.padEnd(OTP_LENGTH, '').split('').slice(0, OTP_LENGTH);
  const refs  = useRef([]);

  const focus = (i) => refs.current[i]?.focus();

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = value.slice(0, i) + value.slice(i + 1);
      onChange(next);
      if (i > 0) focus(i - 1);
      return;
    }
    if (e.key === 'ArrowLeft' && i > 0)               { focus(i - 1); return; }
    if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) { focus(i + 1); return; }
  };

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    if (!char) return;
    const next = value.slice(0, i) + char + value.slice(i + 1);
    onChange(next.slice(0, OTP_LENGTH));
    if (i < OTP_LENGTH - 1) focus(i + 1);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(paste);
    focus(Math.min(paste.length, OTP_LENGTH - 1));
  };

  return (
    <div className="otp-boxes" onPaste={handlePaste}>
      {boxes.map((ch, i) => (
        <input
          key={i}
          ref={el => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={ch}
          disabled={disabled}
          className={`otp-box ${ch ? 'otp-box--filled' : ''}`}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onFocus={e => e.target.select()}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

// ── Countdown timer ──────────────────────────────────────────────────────────
function Countdown({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => { setLeft(seconds); }, [seconds]);

  useEffect(() => {
    if (left <= 0) { onExpire(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onExpire]);

  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  return (
    <span className={`countdown ${left <= 10 ? 'countdown--urgent' : ''}`}>{m}:{s}</span>
  );
}

// ── DevOtp banner ────────────────────────────────────────────────────────────
function DevOtpBanner({ code, onFill }) {
  return (
    <div className="dev-otp-banner">
      <FiCheckCircle size={15} />
      <span>
        <strong>Dev mode OTP:</strong>{' '}
        <button className="dev-otp-code" type="button" onClick={() => onFill(code)}>
          {code}
        </button>
        <span className="dev-otp-hint"> (click to fill)</span>
      </span>
    </div>
  );
}

// ── OTP Step (reusable for both email and mobile) ────────────────────────────
function OtpStep({ devOtp, otp, onOtpChange, verifying, canResend, onExpire, timerKey, onResend, resendLoading, onBack, backLabel, onVerify }) {
  return (
    <div className="otp-section">
      {devOtp && <DevOtpBanner code={devOtp} onFill={onOtpChange} />}

      <OtpInput value={otp} onChange={onOtpChange} disabled={verifying} />

      <button
        className="btn btn-primary btn-full btn-lg auth-btn"
        onClick={() => onVerify(otp)}
        disabled={otp.length !== OTP_LENGTH || verifying}
        type="button"
      >
        {verifying
          ? <span className="btn-loading"><span className="spinner-sm" /> Verifying…</span>
          : <span><FiCheckCircle size={16} /> Verify &amp; Sign In</span>}
      </button>

      <div className="otp-meta">
        {!canResend ? (
          <span className="otp-expire-msg">
            OTP expires in&nbsp;
            <Countdown key={timerKey} seconds={OTP_EXPIRY} onExpire={onExpire} />
          </span>
        ) : (
          <span className="otp-expired-msg">OTP expired</span>
        )}
        <button
          type="button"
          className={`resend-btn ${!canResend ? 'resend-btn--disabled' : ''}`}
          onClick={() => { if (canResend) onResend(); }}
          disabled={!canResend || resendLoading}
        >
          <FiRefreshCw size={13} />
          {resendLoading ? 'Resending…' : 'Resend OTP'}
        </button>
      </div>

      <button type="button" className="otp-back-btn"
        onClick={onBack}>
        <FiArrowLeft size={14} /> {backLabel}
      </button>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, loading, error } = useSelector(s => s.auth);
  const from = location.state?.from || '/';

  // Main tab: 'email' | 'mobile'
  const [tab, setTab] = useState('email');

  // Email sub-mode: 'password' | 'otp'
  const [emailMode, setEmailMode] = useState('password');

  // Email password form
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);

  // Email OTP state
  const [emailOtpStep,    setEmailOtpStep]    = useState(false);
  const [emailOtp,        setEmailOtp]        = useState('');
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [emailVerifying,  setEmailVerifying]  = useState(false);
  const [emailDevOtp,     setEmailDevOtp]     = useState('');
  const [emailTimerKey,   setEmailTimerKey]   = useState(0);
  const [emailCanResend,  setEmailCanResend]  = useState(false);

  // Mobile OTP state
  const [phone,      setPhone]      = useState('');
  const [otpStep,    setOtpStep]    = useState(false);
  const [otp,        setOtp]        = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifying,  setVerifying]  = useState(false);
  const [devOtp,     setDevOtp]     = useState('');
  const [timerKey,   setTimerKey]   = useState(0);
  const [canResend,  setCanResend]  = useState(false);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
    return () => dispatch(clearError());
  }, [user, navigate, from, dispatch]);

  const switchTab = (id) => {
    setTab(id);
    setOtpStep(false); setOtp(''); setDevOtp('');
    setEmailOtpStep(false); setEmailOtp(''); setEmailDevOtp('');
    dispatch(clearError());
  };

  const switchEmailMode = (mode) => {
    setEmailMode(mode);
    setEmailOtpStep(false); setEmailOtp(''); setEmailDevOtp('');
    dispatch(clearError());
  };

  // Derive whether we're on any OTP entry step (hides tab bar + sub-toggle)
  const isOtpEntry = (tab === 'mobile' && otpStep) || (tab === 'email' && emailMode === 'otp' && emailOtpStep);

  // ── Email password login ──────────────────────────────
  const handleEmailLogin = (e) => {
    e.preventDefault();
    dispatch(login({ loginId: email.trim(), password }));
  };

  // ── Email OTP: send ───────────────────────────────────
  const handleSendEmailOtp = async (e) => {
    e?.preventDefault();
    setEmailOtpLoading(true);
    setEmailDevOtp('');
    try {
      const { data } = await api.post('/auth/send-email-otp', { email: email.trim() });
      setEmailOtpStep(true);
      setEmailOtp('');
      setEmailCanResend(false);
      setEmailTimerKey(k => k + 1);
      if (data.devOtp) setEmailDevOtp(data.devOtp);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setEmailOtpLoading(false);
    }
  };

  // ── Email OTP: verify ─────────────────────────────────
  const handleVerifyEmailOtp = useCallback(async (code) => {
    if ((code || emailOtp).length !== OTP_LENGTH) return;
    setEmailVerifying(true);
    try {
      const { data } = await api.post('/auth/verify-email-otp', {
        email: email.trim(),
        code: (code || emailOtp).trim(),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.firstName}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setEmailOtp('');
    } finally {
      setEmailVerifying(false);
    }
  }, [emailOtp, email, from, navigate]);

  const handleEmailOtpChange = (val) => {
    setEmailOtp(val);
    if (val.length === OTP_LENGTH) handleVerifyEmailOtp(val);
  };

  // ── Mobile OTP: send ──────────────────────────────────
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setOtpLoading(true);
    setDevOtp('');
    try {
      const { data } = await api.post('/auth/send-otp', { phoneNumber: phone.trim() });
      setOtpStep(true);
      setOtp('');
      setCanResend(false);
      setTimerKey(k => k + 1);
      if (data.devOtp) setDevOtp(data.devOtp);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Mobile OTP: verify ────────────────────────────────
  const handleVerifyOtp = useCallback(async (code) => {
    if ((code || otp).length !== OTP_LENGTH) return;
    setVerifying(true);
    try {
      const { data } = await api.post('/auth/verify-otp', {
        phoneNumber: phone.trim(),
        code: (code || otp).trim(),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.firstName}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp('');
    } finally {
      setVerifying(false);
    }
  }, [otp, phone, from, navigate]);

  const handleOtpChange = (val) => {
    setOtp(val);
    if (val.length === OTP_LENGTH) handleVerifyOtp(val);
  };

  const fillDemo = () => {
    setTab('email');
    setEmailMode('password');
    setEmail('admin@abhishop.com');
    setPassword('Admin@123');
  };

  // ── subtitle helper ───────────────────────────────────
  const subtitle = () => {
    if (tab === 'mobile' && otpStep)
      return `6-digit code sent to ${phone.replace(/.(?=.{4})/g, '*')}`;
    if (tab === 'email' && emailMode === 'otp' && emailOtpStep)
      return `6-digit code sent to ${email.replace(/^(.)(.+)(@.+)$/, (_, a, b, c) => a + b.replace(/./g, '*') + c)}`;
    return 'Sign in to your account to continue';
  };

  return (
    <div className="auth-page">
      <div className="auth-card login-card card">

        {/* Logo */}
        <Link to="/" className="auth-logo">
          <span className="logo-abhi">Abhi</span><span className="logo-shop">Shop</span>
        </Link>

        {/* Heading */}
        <h1 className="auth-title">
          {isOtpEntry ? 'Enter OTP' : 'Welcome back'}
        </h1>
        <p className="auth-subtitle">{subtitle()}</p>

        {/* Main tab switcher — hidden during OTP entry */}
        {!isOtpEntry && (
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
        )}

        {/* Email sub-toggle (password vs OTP) — only when email tab, not in OTP entry */}
        {tab === 'email' && !isOtpEntry && (
          <div className="email-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${emailMode === 'password' ? 'active' : ''}`}
              onClick={() => switchEmailMode('password')}
            >
              <FiLock size={13} /> Password
            </button>
            <button
              type="button"
              className={`mode-btn ${emailMode === 'otp' ? 'active' : ''}`}
              onClick={() => switchEmailMode('otp')}
            >
              <FiZap size={13} /> Email OTP
            </button>
          </div>
        )}

        {/* Redux error for password login */}
        {error && tab === 'email' && emailMode === 'password' && !isOtpEntry && (
          <div className="auth-error" role="alert"><span>⚠</span> {error}</div>
        )}

        {/* ── EMAIL PASSWORD FORM ──────────────────────────────────── */}
        {tab === 'email' && emailMode === 'password' && (
          <form onSubmit={handleEmailLogin} className="auth-form" noValidate>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" size={16} />
                <input
                  id="email" type="email" className="input-field input-padded"
                  placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  required autoFocus autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="forgot-link" tabIndex={-1}>Forgot password?</Link>
              </div>
              <div className="input-with-icon">
                <FiLock className="input-icon" size={16} />
                <input
                  id="password" type={showPw ? 'text' : 'password'}
                  className="input-field input-padded input-padded-right"
                  placeholder="Enter your password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  required autoComplete="current-password"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <label className="remember-row">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              <span>Keep me signed in</span>
            </label>

            <button type="submit" className="btn btn-primary btn-full btn-lg auth-btn"
              disabled={loading || !email || !password}>
              {loading
                ? <span className="btn-loading"><span className="spinner-sm" /> Signing in…</span>
                : <span>Sign In <FiArrowRight size={16} /></span>}
            </button>
          </form>
        )}

        {/* ── EMAIL OTP: step 1 — enter email ─────────────────────── */}
        {tab === 'email' && emailMode === 'otp' && !emailOtpStep && (
          <form onSubmit={handleSendEmailOtp} className="auth-form" noValidate>
            <div className="input-group">
              <label htmlFor="email-otp">Email Address</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" size={16} />
                <input
                  id="email-otp" type="email" className="input-field input-padded"
                  placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  required autoFocus autoComplete="email"
                />
              </div>
              <span className="field-hint">We'll send a 6-digit code to this address — completely free</span>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg auth-btn"
              disabled={emailOtpLoading || !email.trim()}>
              {emailOtpLoading
                ? <span className="btn-loading"><span className="spinner-sm" /> Sending OTP…</span>
                : <span>Send OTP to Email <FiArrowRight size={16} /></span>}
            </button>
          </form>
        )}

        {/* ── EMAIL OTP: step 2 — enter OTP ───────────────────────── */}
        {tab === 'email' && emailMode === 'otp' && emailOtpStep && (
          <OtpStep
            devOtp={emailDevOtp}
            otp={emailOtp}
            onOtpChange={handleEmailOtpChange}
            verifying={emailVerifying}
            canResend={emailCanResend}
            onExpire={() => setEmailCanResend(true)}
            timerKey={emailTimerKey}
            onResend={handleSendEmailOtp}
            resendLoading={emailOtpLoading}
            onBack={() => { setEmailOtpStep(false); setEmailOtp(''); setEmailDevOtp(''); }}
            backLabel="Change email"
            onVerify={handleVerifyEmailOtp}
          />
        )}

        {/* ── MOBILE STEP 1: phone number ──────────────────────────── */}
        {tab === 'mobile' && !otpStep && (
          <form onSubmit={handleSendOtp} className="auth-form" noValidate>
            <div className="input-group">
              <label htmlFor="phone">Mobile Number</label>
              <div className="input-with-icon">
                <FiSmartphone className="input-icon" size={16} />
                <input
                  id="phone" type="tel" className="input-field input-padded"
                  placeholder="+1 234 567 8900" value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required autoFocus autoComplete="tel"
                />
              </div>
              <span className="field-hint">Enter the number registered with your account</span>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg auth-btn"
              disabled={otpLoading || !phone.trim()}>
              {otpLoading
                ? <span className="btn-loading"><span className="spinner-sm" /> Sending OTP…</span>
                : <span>Send OTP <FiArrowRight size={16} /></span>}
            </button>
          </form>
        )}

        {/* ── MOBILE STEP 2: OTP entry ─────────────────────────────── */}
        {tab === 'mobile' && otpStep && (
          <OtpStep
            devOtp={devOtp}
            otp={otp}
            onOtpChange={handleOtpChange}
            verifying={verifying}
            canResend={canResend}
            onExpire={() => setCanResend(true)}
            timerKey={timerKey}
            onResend={handleSendOtp}
            resendLoading={otpLoading}
            onBack={() => { setOtpStep(false); setOtp(''); setDevOtp(''); }}
            backLabel="Change number"
            onVerify={handleVerifyOtp}
          />
        )}

        {/* Divider + demo */}
        {!isOtpEntry && (
          <>
            <div className="auth-divider"><span>OR</span></div>
            <div className="demo-credentials">
              <p>Try the demo account:</p>
              <button className="demo-btn" onClick={fillDemo} type="button">
                ⚡ Fill Admin Credentials
              </button>
            </div>
          </>
        )}

        <div className="auth-footer">
          New to AbhiShop?{' '}
          <Link to="/register" state={{ from }}>Create a free account</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
