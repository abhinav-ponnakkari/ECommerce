import { Link, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiPackage } from 'react-icons/fi';
import './OrderSuccessPage.css';

function OrderSuccessPage() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="success-page">
      <div className="success-card card">
        <div className="success-icon">
          <FiCheckCircle size={64} color="var(--success)" />
        </div>
        <h1>Order Placed Successfully!</h1>
        <p className="success-msg">
          Thank you for shopping at AbhiShop! Your order has been confirmed.
        </p>
        {order && (
          <div className="order-info">
            <div className="order-number">
              <FiPackage size={20} />
              <div>
                <span className="label">Order Number</span>
                <strong>{order.orderNumber}</strong>
              </div>
            </div>
            <div className="order-meta">
              <div><span>Status</span><strong className="badge badge-success">{order.status}</strong></div>
              <div><span>Payment</span><strong>{order.paymentMethod}</strong></div>
              <div><span>Total</span><strong>${order.totalAmount.toFixed(2)}</strong></div>
            </div>
          </div>
        )}
        <div className="success-actions">
          <Link to="/orders" className="btn btn-primary btn-lg">View My Orders</Link>
          <Link to="/products" className="btn btn-outline btn-lg">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
