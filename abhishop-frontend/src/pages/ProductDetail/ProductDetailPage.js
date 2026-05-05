import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiStar, FiShoppingCart, FiArrowLeft, FiPackage, FiRefreshCw, FiShield, FiTruck } from 'react-icons/fi';
import { fetchProduct, clearSelectedProduct } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import api from '../../services/api';
import './ProductDetailPage.css';

function StarRating({ rating, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="stars-row">
      {[1, 2, 3, 4, 5].map(star => (
        <FiStar
          key={star}
          size={interactive ? 22 : 16}
          className={star <= (hovered || Math.round(rating)) ? 'star-filled' : 'star-empty'}
          fill={star <= (hovered || Math.round(rating)) ? '#f0c040' : 'none'}
          style={interactive ? { cursor: 'pointer' } : {}}
          onMouseEnter={interactive ? () => setHovered(star) : undefined}
          onMouseLeave={interactive ? () => setHovered(0) : undefined}
          onClick={interactive ? () => onRate(star) : undefined}
        />
      ))}
    </div>
  );
}

function ReviewForm({ productId, onReviewAdded }) {
  const { user } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return (
    <div className="review-login-prompt">
      <Link to="/login" className="btn btn-primary">Sign in to write a review</Link>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/reviews', { rating, title, comment, productId });
      onReviewAdded(data);
      setTitle(''); setComment(''); setRating(5);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h4>Write a Review</h4>
      <div className="input-group">
        <label>Your Rating</label>
        <StarRating rating={rating} interactive onRate={setRating} />
      </div>
      <div className="input-group">
        <label>Title</label>
        <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Summarize your review" />
      </div>
      <div className="input-group">
        <label>Review</label>
        <textarea className="input-field" value={comment} onChange={e => setComment(e.target.value)} required rows={4} placeholder="What did you like or dislike?" />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProduct: product, productLoading } = useSelector(s => s.products);
  const { user } = useSelector(s => s.auth);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState('description');

  useEffect(() => {
    dispatch(fetchProduct(parseInt(id)));
    api.get(`/reviews/product/${id}`).then(r => setReviews(r.data)).catch(() => {});
    return () => dispatch(clearSelectedProduct());
  }, [id, dispatch]);

  const handleAddToCart = () => {
    if (!user) { navigate('/login'); return; }
    dispatch(addToCart({ productId: parseInt(id), quantity }));
  };

  const handleBuyNow = () => {
    if (!user) { navigate('/login'); return; }
    dispatch(addToCart({ productId: parseInt(id), quantity }));
    navigate('/cart');
  };

  if (productLoading) return (
    <div className="page-wrapper container">
      <div className="product-detail-skeleton">
        <div className="skeleton" style={{ height: '400px', borderRadius: '8px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '20px', width: `${70 + i * 5}%` }} />)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="page-wrapper container flex-center" style={{ flexDirection: 'column', gap: '16px' }}>
      <h2>Product not found</h2>
      <Link to="/products" className="btn btn-primary">Browse Products</Link>
    </div>
  );

  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const savings = hasDiscount ? (product.price - product.discountPrice).toFixed(2) : 0;
  const discountPct = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
  const allImages = product.images?.length ? product.images : [product.imageUrl];

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-breadcrumb">
          <button onClick={() => navigate(-1)} className="back-btn"><FiArrowLeft size={16} /> Back</button>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <Link to={`/products?categoryId=${product.categoryId}`}>{product.categoryName}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="product-main">
          <div className="product-gallery">
            <div className="gallery-thumbnails">
              {allImages.map((img, i) => (
                <button key={i} className={`thumbnail-btn ${selectedImage === i ? 'active' : ''}`} onClick={() => setSelectedImage(i)}>
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
            <div className="gallery-main-image">
              <img src={allImages[selectedImage]} alt={product.name} />
              {hasDiscount && <span className="gallery-badge">-{discountPct}%</span>}
            </div>
          </div>

          <div className="product-details">
            <p className="product-brand-tag">{product.brand}</p>
            <h1 className="product-title">{product.name}</h1>

            <div className="product-meta">
              <div className="stars-row">
                <StarRating rating={product.rating} />
                <span className="rating-value">{product.rating.toFixed(1)}</span>
                <span className="review-count-link">{product.reviewCount.toLocaleString()} ratings</span>
              </div>
              <span className="sku-badge">SKU: {product.sku}</span>
            </div>

            <hr className="divider" />

            <div className="price-section">
              {hasDiscount && <span className="was-price">Was: <s>${product.price.toFixed(2)}</s></span>}
              <div className="current-price">
                <span className="price-label">Price:</span>
                <span className="price-main">${effectivePrice.toFixed(2)}</span>
              </div>
              {hasDiscount && (
                <p className="savings-text">
                  <span className="badge badge-error">Save ${savings} ({discountPct}% off)</span>
                </p>
              )}
            </div>

            <div className={`stock-status ${product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stockQuantity > 10 ? '✓ In Stock' :
               product.stockQuantity > 0 ? `⚠ Only ${product.stockQuantity} left!` : '✗ Out of Stock'}
            </div>

            <div className="quantity-selector">
              <label>Qty:</label>
              <div className="qty-controls">
                <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))} disabled={quantity >= product.stockQuantity}>+</button>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn btn-secondary btn-lg btn-full" onClick={handleAddToCart} disabled={product.stockQuantity === 0}>
                <FiShoppingCart size={20} /> Add to Cart
              </button>
              <button className="btn btn-primary btn-lg btn-full" onClick={handleBuyNow} disabled={product.stockQuantity === 0}>
                Buy Now
              </button>
            </div>

            <div className="shipping-info">
              <div className="ship-item"><FiTruck size={16} /> <span>Free shipping on orders over $50</span></div>
              <div className="ship-item"><FiPackage size={16} /> <span>Ships in 1-2 business days</span></div>
              <div className="ship-item"><FiRefreshCw size={16} /> <span>30-day easy returns</span></div>
              <div className="ship-item"><FiShield size={16} /> <span>Secure & encrypted checkout</span></div>
            </div>
          </div>
        </div>

        <div className="product-tabs">
          <div className="tab-buttons">
            {['description', 'reviews'].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'description' ? 'Description' : `Reviews (${reviews.length})`}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {tab === 'description' && (
              <div className="description-content">
                <p>{product.description}</p>
                <div className="product-specs">
                  <h4>Product Details</h4>
                  <table>
                    <tbody>
                      <tr><td>Brand</td><td>{product.brand}</td></tr>
                      <tr><td>Category</td><td>{product.categoryName}</td></tr>
                      <tr><td>SKU</td><td>{product.sku}</td></tr>
                      <tr><td>Availability</td><td>{product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} units)` : 'Out of Stock'}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {tab === 'reviews' && (
              <div className="reviews-content">
                <div className="reviews-summary">
                  <div className="avg-rating">
                    <span className="avg-score">{product.rating.toFixed(1)}</span>
                    <StarRating rating={product.rating} />
                    <span className="text-muted text-sm">{product.reviewCount} reviews</span>
                  </div>
                </div>
                <div className="reviews-list">
                  {reviews.length === 0 && <p className="text-muted">No reviews yet. Be the first!</p>}
                  {reviews.map(r => (
                    <div key={r.id} className="review-item">
                      <div className="review-header">
                        <div>
                          <strong>{r.userName}</strong>
                          {r.isVerifiedPurchase && <span className="verified-badge">✓ Verified Purchase</span>}
                        </div>
                        <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <StarRating rating={r.rating} />
                      <strong className="review-title">{r.title}</strong>
                      <p className="review-comment">{r.comment}</p>
                    </div>
                  ))}
                </div>
                <ReviewForm productId={parseInt(id)} onReviewAdded={(r) => setReviews(prev => [r, ...prev])} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
