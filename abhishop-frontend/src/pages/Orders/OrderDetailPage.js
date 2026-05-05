import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiArrowLeft } from 'react-icons/fi';

const STATUS_STEPS = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items } = useSelector(s => s.orders);
  const order = items.find(o => o.id === parseInt(id));

  if (!order) return (
    <div className="page-wrapper container flex-center" style={{ flexDirection: 'column', gap: '16px' }}>
      <h2>Order not found</h2>
      <Link to="/orders" className="btn btn-primary">View All Orders</Link>
    </div>
  );

  const statusIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '800px' }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/orders')} style={{ marginBottom: '20px' }}>
          <FiArrowLeft size={16} /> Back to Orders
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Order Details</h1>
        <p className="text-muted" style={{ marginBottom: '24px' }}>Order #{order.orderNumber}</p>

        {order.status !== 'Cancelled' && order.status !== 'Refunded' && (
          <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>Order Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {STATUS_STEPS.map((s, i) => (
                <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i <= statusIndex ? 'var(--primary)' : 'var(--border)', color: i <= statusIndex ? '#fff' : 'var(--text-secondary)',
                    fontWeight: '700', fontSize: '13px', zIndex: 1, position: 'relative'
                  }}>{i <= statusIndex ? '✓' : i + 1}</div>
                  {i < STATUS_STEPS.length - 1 && <div style={{ position: 'absolute', top: '16px', left: '50%', width: '100%', height: '2px', background: i < statusIndex ? 'var(--primary)' : 'var(--border)' }} />}
                  <span style={{ fontSize: '12px', color: i <= statusIndex ? 'var(--primary)' : 'var(--text-secondary)', marginTop: '8px', fontWeight: i === statusIndex ? '700' : '400' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card" style={{ marginBottom: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            <h3>Items Ordered</h3>
          </div>
          {order.items.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <img src={item.productImage} alt={item.productName} style={{ width: '80px', height: '80px', objectFit: 'contain', background: '#f8f8f8', borderRadius: '4px' }} />
              <div style={{ flex: 1 }}>
                <Link to={`/products/${item.productId}`} style={{ color: 'var(--primary)', fontWeight: '500' }}>{item.productName}</Link>
                <p className="text-muted text-sm">Qty: {item.quantity}</p>
                <p className="text-muted text-sm">Unit price: ${item.unitPrice.toFixed(2)}</p>
              </div>
              <strong style={{ fontSize: '16px' }}>${item.totalPrice.toFixed(2)}</strong>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="card" style={{ padding: '16px 20px' }}>
            <h4 style={{ marginBottom: '12px' }}>Shipping Address</h4>
            <p style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--text-secondary)' }}>{order.shippingAddress}</p>
          </div>
          <div className="card" style={{ padding: '16px 20px' }}>
            <h4 style={{ marginBottom: '12px' }}>Payment Summary</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Method:</span><span>{order.paymentMethod}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span><span>${order.subTotal.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping:</span><span>{order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost.toFixed(2)}`}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax:</span><span>${order.tax.toFixed(2)}</span></div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px' }}><span>Total:</span><span>${order.totalAmount.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;
