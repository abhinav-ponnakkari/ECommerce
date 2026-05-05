import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { fetchProducts, fetchBrands } from '../../store/slices/productSlice';
import ProductCard from '../../components/product/ProductCard';
import './ProductsPage.css';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

function FilterSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-section">
      <button className="filter-section-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </button>
      {open && <div className="filter-section-body">{children}</div>}
    </div>
  );
}

function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, loading, totalCount, totalPages, page } = useSelector((state) => state.products);
  const { items: categories } = useSelector((state) => state.categories);
  const { brands } = useSelector((state) => state.products);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brand: searchParams.get('brand') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    inStock: searchParams.get('inStock') === 'true',
    isFeatured: searchParams.get('isFeatured') === 'true',
    page: parseInt(searchParams.get('page') || '1'),
    pageSize: 12,
  });

  const loadProducts = useCallback(() => {
    const params = { ...filters };
    if (filters.sortBy === 'price-asc') { params.sortBy = 'price'; params.sortOrder = 'asc'; }
    else if (filters.sortBy === 'price-desc') { params.sortBy = 'price'; params.sortOrder = 'desc'; }
    dispatch(fetchProducts(params));
    if (filters.categoryId) dispatch(fetchBrands(filters.categoryId));
  }, [filters, dispatch]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== false) params.set(k, v); });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', categoryId: '', minPrice: '', maxPrice: '', brand: '', sortBy: 'createdAt', sortOrder: 'desc', inStock: false, isFeatured: false, page: 1, pageSize: 12 });
  };

  const selectedCategory = categories.find(c => c.id === parseInt(filters.categoryId));
  const hasFilters = filters.search || filters.categoryId || filters.minPrice || filters.maxPrice || filters.brand || filters.inStock || filters.isFeatured;

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="container">
          <div className="breadcrumb">
            <span>Home</span> / <span>{selectedCategory?.name || 'All Products'}</span>
            {filters.search && <> / <span>"{filters.search}"</span></>}
          </div>
          <div className="products-toolbar">
            <div className="toolbar-left">
              <button className="btn btn-outline btn-sm filter-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <FiFilter size={16} /> Filters {sidebarOpen ? '←' : '→'}
              </button>
              <span className="results-count">
                {loading ? 'Loading...' : `${totalCount.toLocaleString()} results`}
              </span>
              {hasFilters && (
                <button className="btn btn-sm clear-filters-btn" onClick={clearFilters}>
                  <FiX size={14} /> Clear All
                </button>
              )}
            </div>
            <div className="toolbar-right">
              <select
                className="sort-select"
                value={filters.sortBy === 'price' ? `price-${filters.sortOrder}` : filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container products-body">
        <aside className={`filters-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="btn-close-sidebar" onClick={() => setSidebarOpen(false)}><FiX /></button>
          </div>

          <FilterSection title="Category" defaultOpen>
            {categories.map(cat => (
              <label key={cat.id} className="filter-option">
                <input type="radio" name="category" checked={filters.categoryId === String(cat.id)} onChange={() => updateFilter('categoryId', String(cat.id))} />
                <span>{cat.name}</span>
                <span className="option-count">({cat.productCount})</span>
              </label>
            ))}
            {filters.categoryId && (
              <button className="clear-option-btn" onClick={() => updateFilter('categoryId', '')}>Clear</button>
            )}
          </FilterSection>

          <FilterSection title="Price Range" defaultOpen>
            <div className="price-inputs">
              <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} className="input-field" min="0" />
              <span>—</span>
              <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} className="input-field" min="0" />
            </div>
          </FilterSection>

          {brands.length > 0 && (
            <FilterSection title="Brand">
              {brands.map(brand => (
                <label key={brand} className="filter-option">
                  <input type="radio" name="brand" checked={filters.brand === brand} onChange={() => updateFilter('brand', brand)} />
                  <span>{brand}</span>
                </label>
              ))}
              {filters.brand && (
                <button className="clear-option-btn" onClick={() => updateFilter('brand', '')}>Clear</button>
              )}
            </FilterSection>
          )}

          <FilterSection title="Availability">
            <label className="filter-option">
              <input type="checkbox" checked={filters.inStock} onChange={(e) => updateFilter('inStock', e.target.checked)} />
              <span>In Stock Only</span>
            </label>
            <label className="filter-option">
              <input type="checkbox" checked={filters.isFeatured} onChange={(e) => updateFilter('isFeatured', e.target.checked)} />
              <span>Featured Products</span>
            </label>
          </FilterSection>
        </aside>

        <div className="products-content">
          {loading ? (
            <div className="grid-products">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="product-skeleton card">
                  <div className="skeleton" style={{ height: '200px' }} />
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="skeleton" style={{ height: '12px', width: '60%' }} />
                    <div className="skeleton" style={{ height: '16px' }} />
                    <div className="skeleton" style={{ height: '16px', width: '80%' }} />
                    <div className="skeleton" style={{ height: '32px', marginTop: '8px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="empty-products">
              <div className="empty-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid-products">
                {items.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => updateFilter('page', page - 1)}>← Prev</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => updateFilter('page', i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => updateFilter('page', page + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
