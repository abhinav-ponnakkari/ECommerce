import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedProducts } from '../../store/slices/productSlice';
import ProductCard from '../../components/product/ProductCard';
import './HomePage.css';

const HERO_BANNERS = [
  {
    id: 1, title: 'The Latest in Tech', subtitle: 'Shop cutting-edge electronics',
    cta: 'Shop Electronics', link: '/products?categoryId=1',
    bg: 'linear-gradient(135deg, #131921 0%, #1e2d3e 100%)',
    img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600',
  },
  {
    id: 2, title: 'Fashion Forward', subtitle: 'Discover the latest trends',
    cta: 'Shop Fashion', link: '/products?categoryId=2',
    bg: 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
    img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600',
  },
  {
    id: 3, title: "Today's Deals", subtitle: 'Save big on top products',
    cta: 'See All Deals', link: '/products?isFeatured=true',
    bg: 'linear-gradient(135deg, #8B0000 0%, #FF6B35 100%)',
    img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600',
  },
];

function HeroBanner() {
  return (
    <div className="hero-banner" style={{ background: HERO_BANNERS[0].bg }}>
      <div className="container hero-inner">
        <div className="hero-content">
          <span className="hero-tag">New Arrivals</span>
          <h1 className="hero-title">{HERO_BANNERS[0].title}</h1>
          <p className="hero-subtitle">{HERO_BANNERS[0].subtitle}</p>
          <div className="hero-actions">
            <Link to={HERO_BANNERS[0].link} className="btn btn-primary btn-lg">{HERO_BANNERS[0].cta}</Link>
            <Link to="/products" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: '#fff' }}>Browse All</Link>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <img src={HERO_BANNERS[0].img} alt="Featured" className="hero-image" />
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ category }) {
  return (
    <Link to={`/products?categoryId=${category.id}`} className="category-card card">
      <div className="category-image-wrapper">
        <img src={category.imageUrl} alt={category.name} className="category-image" loading="lazy" />
      </div>
      <div className="category-info">
        <h3 className="category-name">{category.name}</h3>
        <p className="category-count">{category.productCount} products</p>
      </div>
    </Link>
  );
}

function PromoBar() {
  const promos = [
    { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $50' },
    { icon: '🔄', title: 'Easy Returns', desc: '30-day return policy' },
    { icon: '🔒', title: 'Secure Payment', desc: '100% secure transactions' },
    { icon: '🎁', title: 'Daily Deals', desc: 'New offers every day' },
  ];
  return (
    <div className="promo-bar">
      <div className="container promo-grid">
        {promos.map((p, i) => (
          <div key={i} className="promo-item">
            <span className="promo-icon">{p.icon}</span>
            <div>
              <strong>{p.title}</strong>
              <p>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  const dispatch = useDispatch();
  const { featured, loading } = useSelector((state) => state.products);
  const { items: categories } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  return (
    <div className="home-page">
      <HeroBanner />
      <PromoBar />

      <div className="container home-sections">
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Find everything you need</p>
            </div>
            <Link to="/products" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="categories-grid">
            {categories.map(cat => <CategoryCard key={cat.id} category={cat} />)}
          </div>
        </section>

        <section className="section deals-section">
          <div className="deals-header">
            <div>
              <h2 className="section-title">Today's Deals</h2>
              <p className="section-subtitle">Limited time offers — shop now!</p>
            </div>
            <Link to="/products?isFeatured=true" className="btn btn-outline btn-sm">See All Deals</Link>
          </div>
          {loading ? (
            <div className="grid-products">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-skeleton card">
                  <div className="skeleton" style={{ height: '200px' }} />
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="skeleton" style={{ height: '12px', width: '60%' }} />
                    <div className="skeleton" style={{ height: '16px' }} />
                    <div className="skeleton" style={{ height: '16px', width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-products">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        <section className="section banner-section">
          <div className="mini-banners">
            {HERO_BANNERS.slice(1).map(b => (
              <Link key={b.id} to={b.link} className="mini-banner" style={{ background: b.bg }}>
                <div className="mini-banner-content">
                  <h3>{b.title}</h3>
                  <p>{b.subtitle}</p>
                  <span className="mini-banner-cta">{b.cta} →</span>
                </div>
                <img src={b.img} alt={b.title} className="mini-banner-img" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
