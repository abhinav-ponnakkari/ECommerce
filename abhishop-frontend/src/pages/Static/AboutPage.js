import { Link } from 'react-router-dom';
import './Static.css';

const FEATURES = [
  { icon: '🚀', title: 'Fast Delivery', desc: 'Orders shipped within 24 hours to your doorstep across the country.', color: '#fff8f5', iconBg: '#fff8f5' },
  { icon: '🔒', title: 'Secure Payments', desc: '256-bit SSL encryption protects every transaction you make.', color: '#e8f4e8', iconBg: '#e8f4e8' },
  { icon: '↩️', title: 'Easy Returns', desc: '30-day hassle-free returns on all eligible items.', color: '#e0f2fe', iconBg: '#e0f2fe' },
  { icon: '🎧', title: '24/7 Support', desc: 'Our team is always here to help via chat, email, or phone.', color: '#f3e8ff', iconBg: '#f3e8ff' },
  { icon: '🏷️', title: 'Best Prices', desc: 'Price-match guarantee ensures you always get the best deal.', color: '#fef9e3', iconBg: '#fef9e3' },
  { icon: '🌎', title: 'Nationwide', desc: 'We deliver to every state and major city across the country.', color: '#f0fdf4', iconBg: '#f0fdf4' },
];

const TEAM = [
  { name: 'Abhinav Ponnakkari', role: 'Founder & CEO', color: 'FF6B35' },
  { name: 'Sarah Chen', role: 'Head of Product', color: '6f42c1' },
  { name: 'Marcus Williams', role: 'VP Engineering', color: '0f766e' },
  { name: 'Priya Sharma', role: 'Head of Operations', color: '1d4ed8' },
];

export default function AboutPage() {
  return (
    <div className="page-wrapper">
      <div className="container static-page">
        <div className="static-hero static-hero--orange">
          <div className="static-hero-eyebrow">About Us</div>
          <h1 className="static-hero-title">We're building the future of shopping</h1>
          <p className="static-hero-sub">AbhiShop connects millions of customers with the best products from trusted sellers worldwide.</p>
        </div>

        <div className="static-stats">
          {[
            { num: '2M+', label: 'Happy Customers' },
            { num: '500K+', label: 'Products Listed' },
            { num: '50+', label: 'Categories' },
            { num: '4.9★', label: 'Average Rating' },
          ].map(s => (
            <div key={s.label} className="static-stat">
              <div className="static-stat-num">{s.num}</div>
              <div className="static-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="static-content">
          <h2>Our Story</h2>
          <p>AbhiShop was founded in 2024 with a simple mission: make quality products accessible to everyone at fair prices. What started as a small passion project quickly grew into one of the most trusted e-commerce platforms in the country.</p>
          <p>We believe shopping should be effortless, enjoyable, and trustworthy. Every feature we build, every partnership we form, and every decision we make is guided by that belief.</p>

          <h2>Our Mission</h2>
          <p>To be Earth's most customer-centric company — a place where customers can find and discover anything they might want to buy online, at the lowest possible prices, delivered fast and reliably.</p>

          <h2>Our Values</h2>
          <ul>
            <li><strong>Customer obsession</strong> — We start with the customer and work backwards.</li>
            <li><strong>Ownership</strong> — We act on behalf of the entire company, not just our team.</li>
            <li><strong>Invent and simplify</strong> — We expect innovation from everyone.</li>
            <li><strong>Deliver results</strong> — We focus on key inputs and deliver results with the right quality.</li>
          </ul>
        </div>

        <h2 className="section-title" style={{ marginBottom: 16 }}>Why Choose AbhiShop?</h2>
        <div className="static-grid" style={{ marginBottom: 32 }}>
          {FEATURES.map(f => (
            <div key={f.title} className="static-feature-card">
              <div className="static-feature-icon" style={{ background: f.iconBg }}>{f.icon}</div>
              <div className="static-feature-title">{f.title}</div>
              <div className="static-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>

        <h2 className="section-title" style={{ marginBottom: 16 }}>Meet the Team</h2>
        <div className="static-team-grid" style={{ marginBottom: 32 }}>
          {TEAM.map(t => (
            <div key={t.name} className="static-team-card">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=${t.color}&color=fff&size=72&bold=true`}
                alt={t.name}
                className="static-team-avatar"
              />
              <div className="static-team-name">{t.name}</div>
              <div className="static-team-role">{t.role}</div>
            </div>
          ))}
        </div>

        <div className="static-content" style={{ textAlign: 'center', padding: '40px' }}>
          <h2 style={{ borderBottom: 'none', marginTop: 0 }}>Ready to start shopping?</h2>
          <p>Join millions of satisfied customers on AbhiShop.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            <Link to="/products" className="btn btn-primary btn-lg">Browse Products</Link>
            <Link to="/register" className="btn btn-outline btn-lg">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
