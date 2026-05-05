import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiTrash2, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../../store/slices/cartSlice';
import './CartPage.css';

function CartItem({ item }) {
  const dispatch = useDispatch();
  const effectivePrice = item.productDiscountPrice || item.productPrice;

  return (
    <div className="cart-item">
      <Link to={`/products/${item.productId}`} className="cart-item-image">
        <img src={item.productImage} alt={item.productName} />
      </Link>
      <div className="cart-item-details">
        <Link to={`/products/${item.productId}`} className="cart-item-name">{item.productName}</Link>
        <div className="cart-item-price">${effectivePrice.toFixed(2)}</div>
        {item.productDiscountPrice && (
          <div className="cart-item-original">Was: <s>${item.productPrice.toFixed(2)}</s></div>
        )}
        <div className="cart-item-stock">
          {item.stockQuantity <= 5 && item.stockQuantity > 0
            ? <span className="text-error">Only {item.stockQuantity} left</span>
            : <span style={{ color: 'var(--success)' }}>In Stock</span>}
        </div>
      </div>
      <div className="cart-item-controls">
        <div className="qty-controls">
          <button className="qty-btn" onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity - 1 }))}>−</button>
          <span className="qty-value">{item.quantity}</span>
          <button className="qty-btn" onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity + 1 }))} disabled={item.quantity >= item.stockQuantity}>+</button>
        </div>
        <button className="btn-remove" onClick={() => dispatch(removeFromCart(item.id))}>
          <FiTrash2 size={16} /> Delete
        </button>
      </div>
      <div className="cart-item-subtotal">
        <span className="subtotal-label">Subtotal:</span>
        <span className="subtotal-value">${item.subTotal.toFixed(2)}</span>
      </div>
    </div>
  );
}

function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subTotal, tax, shippingCost, total, loading } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);

  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [dispatch, user]);

  if (!user) return (
    <div className="page-wrapper container flex-center" style={{ flexDirection: 'column', gap: '20px' }}>
      <FiShoppingBag size={60} style={{ color: 'var(--text-secondary)' }} />
      <h2>Your cart is waiting!</h2>
      <p className="text-muted">Sign in to see your saved items</p>
      <Link to="/login" className="btn btn-primary btn-lg">Sign In</Link>
    </div>
  );

  if (items.length === 0) return (
    <div className="page-wrapper container flex-center" style={{ flexDirection: 'column', gap: '20px' }}>
      <FiShoppingBag size={60} style={{ color: 'var(--text-secondary)' }} />
      <h2>Your cart is empty</h2>
      <p className="text-muted">Looks like you haven't added anything yet</p>
      <Link to="/products" className="btn btn-primary btn-lg">Continue Shopping</Link>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>
            <FiArrowLeft size={16} /> Continue Shopping
          </button>
          <h1 className="cart-title">Shopping Cart <span>({items.length} {items.length === 1 ? 'item' : 'items'})</span></h1>
          <button className="btn btn-sm clear-btn" onClick={() => dispatch(clearCart())}>Clear Cart</button>
        </div>

        <div className="cart-layout">
          <div className="cart-items-section">
            {items.map(item => <CartItem key={item.id} item={item} />)}
          </div>

          <div className="cart-summary card">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-row">
              <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
              <span>${subTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? 'free-shipping' : ''}>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            {shippingCost === 0 && <p className="free-shipping-msg">🎉 You qualify for free shipping!</p>}
            {shippingCost > 0 && (
              <p className="shipping-threshold">Add ${(50 - subTotal).toFixed(2)} more for free shipping</p>
            )}
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <hr className="divider" />
            <div className="summary-total">
              <span>Order Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-primary btn-lg btn-full checkout-btn"
              onClick={() => navigate('/checkout')}
              disabled={loading}
            >
              Proceed to Checkout
            </button>
            <div className="secure-checkout">
              🔒 Secure & encrypted checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
