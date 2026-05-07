import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowLeft, FiPackage } from 'react-icons/fi';
import { fetchWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import './WishlistPage.css';

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={n <= Math.round(rating) ? 'star-filled' : 'star-empty'}>★</span>
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector(s => s.wishlist);
  const { user } = useSelector(s => s.auth);

  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [dispatch, user]);

  const handleRemove = (productId) => dispatch(removeFromWishlist(productId));

  const handleAddToCart = (item) => {
    dispatch(addToCart({ productId: item.productId, quantity: 1 }));
  };

  const handleMoveAllToCart = () => {
    items.forEach(item => {
      if (item.stockQuantity > 0) dispatch(addToCart({ productId: item.productId, quantity: 1 }));
    });
  };

  if (loading) return (
    <div className="page-wrapper">
      <div className="container">
        <div className="wishlist-skeleton">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="wishlist-skeleton-item skeleton" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="wishlist-header">
          <div>
            <h1 className="section-title"><FiHeart size={26} style={{ color: 'var(--primary)' }} /> My Wishlist</h1>
            <p className="section-subtitle">{items.length} {items.length === 1 ? 'item' : 'items'} saved</p>
          </div>
          {items.length > 0 && (
            <button className="btn btn-primary" onClick={handleMoveAllToCart}>
              <FiShoppingCart size={16} /> Add All to Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="wishlist-empty card">
            <FiHeart size={64} className="wishlist-empty-icon" />
            <h2>Your wishlist is empty</h2>
            <p>Save items you love by clicking the heart icon on any product.</p>
            <Link to="/products" className="btn btn-primary">
              <FiPackage size={16} /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map(item => {
              const price = item.discountPrice ?? item.price;
              const hasDiscount = item.discountPrice && item.discountPrice < item.price;
              const discountPct = hasDiscount ? Math.round((1 - item.discountPrice / item.price) * 100) : 0;

              return (
                <div key={item.id} className="wishlist-card card">
                  <Link to={`/products/${item.productId}`} className="wishlist-img-wrap">
                    <img src={item.imageUrl} alt={item.name} className="wishlist-img" />
                    {hasDiscount && <span className="wishlist-discount-badge">-{discountPct}%</span>}
                  </Link>

                  <div className="wishlist-info">
                    <span className="wishlist-brand">{item.brand}</span>
                    <Link to={`/products/${item.productId}`} className="wishlist-name">{item.name}</Link>

                    <div className="wishlist-rating">
                      <StarRating rating={item.rating} />
                      <span className="wishlist-review-count">({item.reviewCount})</span>
                    </div>

                    <div className="wishlist-price-row">
                      <span className="wishlist-price">${price.toFixed(2)}</span>
                      {hasDiscount && <span className="wishlist-original-price">${item.price.toFixed(2)}</span>}
                    </div>

                    <p className={`wishlist-stock ${item.stockQuantity === 0 ? 'out-of-stock' : item.stockQuantity < 5 ? 'low-stock' : 'in-stock'}`}>
                      {item.stockQuantity === 0 ? 'Out of Stock' : item.stockQuantity < 5 ? `Only ${item.stockQuantity} left` : 'In Stock'}
                    </p>

                    <div className="wishlist-actions">
                      <button
                        className="btn btn-primary btn-sm wishlist-cart-btn"
                        onClick={() => handleAddToCart(item)}
                        disabled={item.stockQuantity === 0}
                      >
                        <FiShoppingCart size={14} /> Add to Cart
                      </button>
                      <button className="btn btn-outline btn-sm wishlist-remove-btn" onClick={() => handleRemove(item.productId)}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button className="wishlist-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={16} /> Continue Shopping
        </button>
      </div>
    </div>
  );
}
