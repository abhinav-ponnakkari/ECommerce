import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';
import './Static.css';

const CONTACT_INFO = [
  { icon: <FiMail size={18} />, label: 'Email Us', value: 'support@abhishop.com', href: 'mailto:support@abhishop.com' },
  { icon: <FiPhone size={18} />, label: 'Call Us', value: '1-800-ABHISHOP', href: 'tel:18002244746' },
  { icon: <FiMapPin size={18} />, label: 'Our Office', value: '123 Commerce Street\nSan Francisco, CA 94105' },
  { icon: <FiClock size={18} />, label: 'Business Hours', value: 'Mon–Fri: 9AM–6PM PST\nSat–Sun: 10AM–4PM PST' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate send
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setSending(false);
  };

  const f = k => e => setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="page-wrapper">
      <div className="container static-page">
        <div className="static-hero static-hero--dark">
          <div className="static-hero-eyebrow">Contact Us</div>
          <h1 className="static-hero-title">We'd love to hear from you</h1>
          <p className="static-hero-sub">Got a question? A concern? A compliment? We're here 7 days a week.</p>
        </div>

        <div className="contact-layout">
          <div className="contact-form-card">
            {sent ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '40px 0', textAlign: 'center' }}>
                <FiCheckCircle size={56} style={{ color: 'var(--success)' }} />
                <h3 style={{ fontSize: 22, fontWeight: 700 }}>Message sent!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                <button className="btn btn-outline" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>Send Another</button>
              </div>
            ) : (
              <>
                <h3 className="contact-form-title">Send us a message</h3>
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="contact-form-row">
                    <div className="input-group">
                      <label>Your Name *</label>
                      <input className="input-field" value={form.name} onChange={f('name')} placeholder="John Smith" required />
                    </div>
                    <div className="input-group">
                      <label>Email Address *</label>
                      <input className="input-field" type="email" value={form.email} onChange={f('email')} placeholder="john@example.com" required />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Subject *</label>
                    <select className="input-field" value={form.subject} onChange={f('subject')} required>
                      <option value="">Select a topic…</option>
                      {['Order Issue', 'Return / Refund', 'Product Question', 'Account Help', 'Payment Problem', 'Shipping Inquiry', 'Other'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Message *</label>
                    <textarea className="input-field" rows={5} value={form.message} onChange={f('message')} placeholder="Tell us how we can help…" required style={{ resize: 'vertical' }} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={sending}>
                    {sending ? 'Sending…' : <><FiSend size={15} /> Send Message</>}
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="contact-info-card">
            {CONTACT_INFO.map(info => (
              <div key={info.label} className="contact-info-item">
                <div className="contact-info-icon">{info.icon}</div>
                <div>
                  <div className="contact-info-label">{info.label}</div>
                  {info.href ? (
                    <a href={info.href} className="contact-info-value" style={{ color: 'var(--primary)' }}>{info.value}</a>
                  ) : (
                    <div className="contact-info-value" style={{ whiteSpace: 'pre-line' }}>{info.value}</div>
                  )}
                </div>
              </div>
            ))}

            <div style={{ marginTop: 8, padding: '16px', background: '#fff8f5', borderRadius: 8, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Average response time</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{'< 24 hours'}</p>
            </div>
          </div>
        </div>

        <div className="static-content">
          <h2>Frequently Asked Quick Questions</h2>
          <p><strong>Where is my order?</strong> Track your order in <a href="/orders">My Orders</a>. You'll also receive email updates at each stage.</p>
          <p><strong>How do I return an item?</strong> Visit our <a href="/help">Help Center</a> to start a return. Most items are eligible within 30 days of delivery.</p>
          <p><strong>Can I change my order?</strong> Orders can be modified within 1 hour of placement. Contact us immediately if you need a change.</p>
          <p><strong>Is my payment information safe?</strong> Yes — we use 256-bit SSL encryption and never store your card details.</p>
        </div>
      </div>
    </div>
  );
}
