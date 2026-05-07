import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiZap, FiClock, FiTag, FiTrendingDown } from 'react-icons/fi';
import { fetchProducts } from '../../store/slices/productSlice';
import ProductCard from '../../components/product/ProductCard';
import './DealsPage.css';

const SORT_OPTIONS = [
  { value: 'discount', label: 'Best Discount' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function DealsPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.products);
  const [sort, setSort] = useState('discount');

  useEffect(() => {
    const sortMap = { discount: null, price_asc: 'price', rating: 'rating', popular: 'popular' };
    dispatch(fetchProducts({ pageSize: 48, sortBy: sortMap[sort], sortOrder: sort === 'price_asc' ? 'asc' : 'desc' }));
  }, [dispatch, sort]);

  // Client-side: only items with a discount price
  const deals = items
    .filter(p => p.discountPrice && p.discountPrice < p.price)
    .sort((a, b) => {
      if (sort === 'discount') {
        const discA = (1 - a.discountPrice / a.price);
        const discB = (1 - b.discountPrice / b.price);
        return discB - discA;
      }
      return 0;
    });

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Hero banner */}
        <div className="deals-hero">
          <div className="deals-hero-content">
            <div className="deals-hero-badge"><FiZap size={14} /> Limited Time Offers</div>
            <h1 className="deals-hero-title">Today's Best Deals</h1>
            <p className="deals-hero-sub">Save big on top brands — fresh deals added daily</p>
          </div>
          <div className="deals-hero-icons">
            <FiTrendingDown size={80} />
          </div>
        </div>

        {/* Stats row */}
        <div className="deals-stats">
          <div className="deals-stat">
            <FiTag size={22} className="deals-stat-icon" />
            <div>
              <p className="deals-stat-num">{deals.length}</p>
              <p className="deals-stat-label">Active Deals</p>
            </div>
          </div>
          <div className="deals-stat">
            <FiZap size={22} className="deals-stat-icon" />
            <div>
              <p className="deals-stat-num">Up to {deals.length > 0 ? Math.max(...deals.map(p => Math.round((1 - p.discountPrice / p.price) * 100))) : 0}% off</p>
              <p className="deals-stat-label">Max Savings</p>
            </div>
          </div>
          <div className="deals-stat">
            <FiClock size={22} className="deals-stat-icon" />
            <div>
              <p className="deals-stat-num">Daily</p>
              <p className="deals-stat-label">Refreshed</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="deals-controls">
          <h2 className="deals-section-title">
            {deals.length} deal{deals.length !== 1 ? 's' : ''} found
          </h2>
          <div className="deals-sort">
            <label>Sort by:</label>
            <select className="input-field" value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid-products">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 8 }} />)}
          </div>
        ) : deals.length === 0 ? (
          <div className="deals-empty card">
            <FiTag size={52} />
            <h3>No deals right now</h3>
            <p>Check back soon for great offers!</p>
            <Link to="/products" className="btn btn-primary">Browse All Products</Link>
          </div>
        ) : (
          <div className="grid-products">
            {deals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
