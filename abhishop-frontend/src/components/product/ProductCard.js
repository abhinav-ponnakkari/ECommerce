import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiShoppingCart, FiStar, FiHeart } from 'react-icons/fi';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import './ProductCard.css';

function StarRating({ rating, count }) {
  return (
    <div className="product-rating">
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={12}
            className={star <= Math.round(rating) ? 'star-filled' : 'star-empty'}
            fill={star <= Math.round(rating) ? '#f0c040' : 'none'}
          />
        ))}
      </div>
      <span className="rating-count">({count.toLocaleString()})</span>
    </div>
  );
}

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { productIds: wishlistIds } = useSelector((state) => state.wishlist);
  const isWishlisted = wishlistIds.includes(product.id);

  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { window.location.href = '/login'; return; }
    dispatch(addToCart({ productId: product.id, quantity: 1 }));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { window.location.href = '/login'; return; }
    dispatch(toggleWishlist(product.id));
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card card">
      <div className="product-image-wrapper">
        <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
        {hasDiscount && <span className="discount-badge">-{discountPct}%</span>}
        {product.stockQuantity === 0 && <div className="out-of-stock-overlay">Out of Stock</div>}
        {product.isFeatured && <span className="featured-badge">Featured</span>}
        <button
          className={`product-wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
          onClick={handleWishlist}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiHeart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="product-info">
        <p className="product-brand">{product.brand}</p>
        <h3 className="product-name">{product.name}</h3>
        <StarRating rating={product.rating} count={product.reviewCount} />
        <div className="product-price-row">
          <div className="product-prices">
            <span className="price-current">${effectivePrice.toFixed(2)}</span>
            {hasDiscount && <span className="price-original">${product.price.toFixed(2)}</span>}
          </div>
        </div>
        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <p className="low-stock">Only {product.stockQuantity} left in stock!</p>
        )}
        <button
          className="btn btn-secondary btn-sm add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={product.stockQuantity === 0}
        >
          <FiShoppingCart size={14} />
          {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}

export default ProductCard;
