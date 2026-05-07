import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiSearch, FiPackage, FiRefreshCw, FiCreditCard, FiUser, FiTruck, FiShield } from 'react-icons/fi';
import './Static.css';

const CATEGORIES = [
  { icon: <FiPackage size={22} />, label: 'Orders', color: '#ff6b35', bg: '#fff8f5' },
  { icon: <FiRefreshCw size={22} />, label: 'Returns', color: '#1cc88a', bg: '#e0f7ef' },
  { icon: <FiTruck size={22} />, label: 'Shipping', color: '#4e73df', bg: '#eaeffd' },
  { icon: <FiCreditCard size={22} />, label: 'Payments', color: '#f6c23e', bg: '#fef9e3' },
  { icon: <FiUser size={22} />, label: 'Account', color: '#6f42c1', bg: '#f3e8ff' },
  { icon: <FiShield size={22} />, label: 'Security', color: '#e74a3b', bg: '#fde8e7' },
];

const FAQS = [
  {
    category: 'Orders',
    items: [
      { q: 'How do I track my order?', a: 'Go to My Orders in your account. Each order shows its current status (Confirmed → Processing → Shipped → Delivered). You\'ll also receive email notifications at each stage.' },
      { q: 'Can I cancel my order?', a: 'Orders can be cancelled as long as they haven\'t been shipped yet. Go to My Orders, find the order, and click "Cancel Order". Refunds are processed within 3–5 business days.' },
      { q: 'Can I change the delivery address?', a: 'Contact us immediately after placing the order. We can update the address if the order hasn\'t been shipped yet.' },
      { q: 'What if I receive a wrong item?', a: 'We\'re sorry! Contact our support team within 48 hours of delivery. Take a photo of the item and we\'ll arrange a free return and resend the correct item.' },
    ]
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is the return policy?', a: 'Most items can be returned within 30 days of delivery in their original condition. Electronics must be returned within 15 days. Perishable items cannot be returned.' },
      { q: 'How long does a refund take?', a: 'Once we receive and inspect the returned item (3–5 days), your refund is processed within 5–7 business days to your original payment method.' },
      { q: 'Who pays for return shipping?', a: 'If the return is due to our error (wrong or defective item), we cover all return shipping costs. For other returns, a flat return shipping fee may apply.' },
    ]
  },
  {
    category: 'Shipping',
    items: [
      { q: 'How long does shipping take?', a: 'Standard shipping: 3–7 business days. Express shipping: 1–2 business days. Same-day delivery is available in select cities for orders placed before noon.' },
      { q: 'Is there free shipping?', a: 'Yes! Orders over $50 qualify for free standard shipping automatically at checkout. AbhiShop Prime members get free shipping on all orders.' },
      { q: 'Do you ship internationally?', a: 'Currently we ship to the US, Canada, and the UK. International shipping times are 7–14 business days.' },
    ]
  },
  {
    category: 'Payments',
    items: [
      { q: 'What payment methods are accepted?', a: 'We accept all major credit/debit cards (Visa, Mastercard, Amex, Discover), PayPal, Apple Pay, and Google Pay. Buy Now Pay Later is also available.' },
      { q: 'Is my payment information secure?', a: 'Absolutely. We use 256-bit SSL encryption for all transactions and are PCI-DSS compliant. We never store your full card number.' },
      { q: 'When am I charged?', a: 'Your card is charged when your order is confirmed and the item is ready to ship, not at the time of ordering.' },
    ]
  },
  {
    category: 'Account',
    items: [
      { q: 'How do I reset my password?', a: 'Click "Forgot password?" on the login page. Enter your email and we\'ll send a reset link valid for 30 minutes.' },
      { q: 'Can I have multiple shipping addresses?', a: 'Yes! Go to Account Settings → Addresses to add, edit, or remove delivery addresses. You can set one as your default address.' },
      { q: 'How do I delete my account?', a: 'Contact our support team to request account deletion. Note that order history will be retained for legal compliance for 7 years.' },
    ]
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className={`faq-question ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)}>
        {q}
        <FiChevronDown size={18} className="faq-chevron" />
      </button>
      {open && <div className="faq-answer">{a}</div>}
    </div>
  );
}

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const allFaqs = FAQS.flatMap(cat => cat.items.map(item => ({ ...item, category: cat.category })));
  const filtered = allFaqs.filter(f => {
    const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || f.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="page-wrapper">
      <div className="container static-page">
        <div className="static-hero static-hero--purple">
          <div className="static-hero-eyebrow">Help Center</div>
          <h1 className="static-hero-title">How can we help you?</h1>
          <p className="static-hero-sub">Search our knowledge base or browse by category below.</p>

          <div style={{ position: 'relative', marginTop: 24, maxWidth: 480 }}>
            <FiSearch size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: 44, background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff', width: '100%' }}
              placeholder="Search help articles…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category quick links */}
        <div className="static-grid" style={{ marginBottom: 28 }}>
          {CATEGORIES.map(c => (
            <button
              key={c.label}
              className="static-feature-card"
              onClick={() => setActiveCategory(c.label === activeCategory ? 'All' : c.label)}
              style={{ cursor: 'pointer', border: activeCategory === c.label ? `2px solid ${c.color}` : '2px solid transparent' }}
            >
              <div className="static-feature-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
              <div className="static-feature-title">{c.label}</div>
            </button>
          ))}
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {['All', ...FAQS.map(f => f.category)].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="btn btn-sm"
              style={{
                background: activeCategory === cat ? 'var(--primary)' : 'transparent',
                color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                border: activeCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border)',
              }}
            >
              {cat}
            </button>
          ))}
          {search && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{filtered.length} results for "{search}"</span>}
        </div>

        <div className="faq-list">
          {filtered.length === 0 ? (
            <div className="static-content" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No results found. <Link to="/contact">Contact us</Link> for personalized help.</p>
            </div>
          ) : (
            filtered.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)
          )}
        </div>

        <div className="static-content" style={{ textAlign: 'center', padding: '32px' }}>
          <h3 style={{ marginBottom: 8 }}>Still need help?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Our support team is available 7 days a week.</p>
          <Link to="/contact" className="btn btn-primary">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
