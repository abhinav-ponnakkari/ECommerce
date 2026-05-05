import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import { fetchOrders, cancelOrder } from '../../store/slices/orderSlice';
import './OrdersPage.css';

const STATUS_COLORS = {
  Pending: 'badge-warning',
  Confirmed: 'badge-primary',
  Processing: 'badge-warning',
  Shipped: 'badge-warning',
  Delivered: 'badge-success',
  Cancelled: 'badge-error',
  Refunded: 'badge-error',
};

function OrdersPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.orders);

  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

  if (loading) return (
    <div className="page-wrapper container">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card" style={{ padding: '20px', marginBottom: '16px' }}>
          <div className="skeleton" style={{ height: '20px', width: '200px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: '8px' }} />
          <div className="skeleton" style={{ height: '16px', width: '40%' }} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="orders-page page-wrapper">
      <div className="container">
        <h1 className="orders-title">Your Orders</h1>

        {items.length === 0 ? (
          <div className="empty-orders">
            <FiPackage size={60} style={{ color: 'var(--text-secondary)' }} />
            <h3>No orders yet</h3>
            <p>When you place an order, it will appear here</p>
            <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {items.map(order => (
              <div key={order.id} className="order-card card">
                <div className="order-card-header">
                  <div className="order-header-left">
                    <span className="order-number">#{order.orderNumber}</span>
                    <span className={`badge ${STATUS_COLORS[order.status] || 'badge-warning'}`}>{order.status}</span>
                  </div>
                  <div className="order-header-right">
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="order-total">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="order-items-preview">
                  {order.items.slice(0, 3).map(item => (
                    <div key={item.id} className="order-preview-item">
                      <img src={item.productImage} alt={item.productName} />
                      <div>
                        <p>{item.productName}</p>
                        <p className="text-muted text-sm">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-muted text-sm">+{order.items.length - 3} more items</p>
                  )}
                </div>

                <div className="order-card-footer">
                  <div className="order-footer-info">
                    <span className="text-sm text-muted">Payment: {order.paymentMethod}</span>
                    <span className="text-sm text-muted">{order.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                  </div>
                  <div className="order-footer-actions">
                    {(order.status === 'Pending' || order.status === 'Confirmed') && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => dispatch(cancelOrder(order.id))}
                      >
                        Cancel
                      </button>
                    )}
                    <Link to={`/orders/${order.id}`} className="btn btn-sm btn-outline">
                      View Details <FiChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
