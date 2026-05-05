import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiChevronLeft, FiCheck } from 'react-icons/fi';
import { createOrder } from '../../store/slices/orderSlice';
import api from '../../services/api';
import './CheckoutPage.css';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
  { id: 'paypal', label: 'PayPal', icon: '🅿️' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
];

const STEPS = ['Shipping', 'Payment', 'Review'];

function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subTotal, tax, shippingCost, total } = useSelector(s => s.cart);
  const { loading } = useSelector(s => s.orders);
  const { user } = useSelector(s => s.auth);

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [notes, setNotes] = useState('');

  const [newAddress, setNewAddress] = useState({
    fullName: `${user?.firstName} ${user?.lastName}`,
    street: '', city: '', state: '', zipCode: '', country: 'United States', phoneNumber: user?.phoneNumber || '',
  });

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
    api.get('/addresses').then(r => {
      setAddresses(r.data);
      const defaultAddr = r.data.find(a => a.isDefault) || r.data[0];
      if (defaultAddr) setSelectedAddress(defaultAddr);
    }).catch(() => {});
  }, [items.length, navigate]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/addresses', { ...newAddress, isDefault: addresses.length === 0 });
    setAddresses(prev => [...prev, data]);
    setSelectedAddress(data);
  };

  const formatAddress = (addr) =>
    `${addr.fullName}, ${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return;
    const result = await dispatch(createOrder({
      shippingAddress: formatAddress(selectedAddress),
      paymentMethod,
      notes,
    }));
    if (!result.error) navigate('/order-success', { state: { order: result.payload } });
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/cart')}>
            <FiChevronLeft size={16} /> Back to Cart
          </button>
          <h1>Checkout</h1>
        </div>

        <div className="step-indicator">
          {STEPS.map((s, i) => (
            <div key={s} className={`step-item ${i <= step ? 'active' : ''} ${i < step ? 'completed' : ''}`}>
              <div className="step-circle">
                {i < step ? <FiCheck size={16} /> : i + 1}
              </div>
              <span className="step-label">{s}</span>
              {i < STEPS.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            {step === 0 && (
              <div className="checkout-section card">
                <h2>Shipping Address</h2>
                {addresses.length > 0 && (
                  <div className="saved-addresses">
                    <h3>Saved Addresses</h3>
                    {addresses.map(addr => (
                      <label key={addr.id} className={`address-option ${selectedAddress?.id === addr.id ? 'selected' : ''}`}>
                        <input type="radio" name="address" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} />
                        <div className="address-details">
                          <strong>{addr.fullName}</strong>
                          {addr.isDefault && <span className="badge badge-primary" style={{ marginLeft: '8px' }}>Default</span>}
                          <p>{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
                          <p>{addr.country}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <div className="new-address-form">
                  <h3>Add New Address</h3>
                  <form onSubmit={handleAddAddress}>
                    <div className="form-grid">
                      <div className="input-group">
                        <label>Full Name</label>
                        <input className="input-field" value={newAddress.fullName} onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })} required />
                      </div>
                      <div className="input-group">
                        <label>Phone</label>
                        <input className="input-field" value={newAddress.phoneNumber} onChange={e => setNewAddress({ ...newAddress, phoneNumber: e.target.value })} />
                      </div>
                      <div className="input-group span-full">
                        <label>Street Address</label>
                        <input className="input-field" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} required />
                      </div>
                      <div className="input-group">
                        <label>City</label>
                        <input className="input-field" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                      </div>
                      <div className="input-group">
                        <label>State</label>
                        <input className="input-field" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                      </div>
                      <div className="input-group">
                        <label>ZIP Code</label>
                        <input className="input-field" value={newAddress.zipCode} onChange={e => setNewAddress({ ...newAddress, zipCode: e.target.value })} required />
                      </div>
                      <div className="input-group">
                        <label>Country</label>
                        <input className="input-field" value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} required />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-outline btn-sm" style={{ marginTop: '12px' }}>Save Address</button>
                  </form>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(1)} disabled={!selectedAddress}>
                  Continue to Payment →
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="checkout-section card">
                <h2>Payment Method</h2>
                <div className="payment-methods">
                  {PAYMENT_METHODS.map(pm => (
                    <label key={pm.id} className={`payment-option ${paymentMethod === pm.id ? 'selected' : ''}`}>
                      <input type="radio" name="payment" checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} />
                      <span className="payment-icon">{pm.icon}</span>
                      <span className="payment-label">{pm.label}</span>
                    </label>
                  ))}
                </div>
                {paymentMethod === 'card' && (
                  <div className="card-form form-grid">
                    <div className="input-group span-full"><label>Card Number</label><input className="input-field" placeholder="**** **** **** ****" /></div>
                    <div className="input-group"><label>Expiry</label><input className="input-field" placeholder="MM/YY" /></div>
                    <div className="input-group"><label>CVV</label><input className="input-field" placeholder="***" /></div>
                    <div className="input-group span-full"><label>Cardholder Name</label><input className="input-field" placeholder="Name on card" /></div>
                  </div>
                )}
                <div className="input-group" style={{ marginTop: '16px' }}>
                  <label>Order Notes (optional)</label>
                  <textarea className="input-field" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any special instructions..." />
                </div>
                <div className="checkout-nav-btns">
                  <button className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>Review Order →</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-section card">
                <h2>Review Your Order</h2>
                <div className="review-section">
                  <div className="review-block">
                    <div className="flex-between">
                      <h4>Shipping to</h4>
                      <button className="btn-edit" onClick={() => setStep(0)}>Edit</button>
                    </div>
                    <p>{formatAddress(selectedAddress)}</p>
                  </div>
                  <div className="review-block">
                    <div className="flex-between">
                      <h4>Payment</h4>
                      <button className="btn-edit" onClick={() => setStep(1)}>Edit</button>
                    </div>
                    <p>{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</p>
                  </div>
                  <div className="review-items">
                    <h4>Items ({items.length})</h4>
                    {items.map(item => (
                      <div key={item.id} className="review-item-row">
                        <img src={item.productImage} alt={item.productName} className="review-item-img" />
                        <div className="review-item-info">
                          <span>{item.productName}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                        <span className="review-item-price">${item.subTotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="checkout-nav-btns">
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? 'Placing Order...' : `Place Order ($${total.toFixed(2)})`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-sidebar">
            <div className="order-summary card">
              <h2>Order Summary</h2>
              <div className="summary-items">
                {items.map(item => (
                  <div key={item.id} className="summary-item">
                    <img src={item.productImage} alt={item.productName} />
                    <div>
                      <p className="truncate" style={{ maxWidth: '160px' }}>{item.productName}</p>
                      <p className="text-muted text-sm">Qty: {item.quantity}</p>
                    </div>
                    <span>${item.subTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />
              <div className="summary-row"><span>Subtotal</span><span>${subTotal.toFixed(2)}</span></div>
              <div className="summary-row"><span>Shipping</span><span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span></div>
              <div className="summary-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
              <div className="summary-total"><strong>Total</strong><strong>${total.toFixed(2)}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
