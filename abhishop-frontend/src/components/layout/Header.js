import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiShoppingCart, FiSearch, FiUser, FiMenu, FiX,
  FiChevronDown, FiPackage, FiLogOut, FiSettings
} from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';
import { resetCart } from '../../store/slices/cartSlice';
import './Header.css';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { itemCount } = useSelector((state) => state.cart);
  const { items: categories } = useSelector((state) => state.categories);

  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="container header-top-inner">
          <Link to="/" className="logo">
            <span className="logo-abhi">Abhi</span>
            <span className="logo-shop">Shop</span>
          </Link>

          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-category" onClick={() => setCategoryOpen(!categoryOpen)}>
              All <FiChevronDown size={12} />
              {categoryOpen && (
                <div className="category-dropdown">
                  <div className="category-item" onClick={() => { navigate('/products'); setCategoryOpen(false); }}>
                    All Departments
                  </div>
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      className="category-item"
                      onClick={() => { navigate(`/products?categoryId=${cat.id}`); setCategoryOpen(false); }}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Search products, brands and more..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <FiSearch size={18} />
            </button>
          </form>

          <div className="header-actions">
            {user ? (
              <div className="user-menu-wrapper" onMouseLeave={() => setUserMenuOpen(false)}>
                <button className="header-btn" onMouseEnter={() => setUserMenuOpen(true)}>
                  <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName}`} alt={user.firstName} className="user-avatar" />
                  <div className="user-info">
                    <span className="user-greeting">Hello, {user.firstName}</span>
                    <span className="user-account">Account <FiChevronDown size={11} /></span>
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <strong>{user.firstName} {user.lastName}</strong>
                      <span>{user.email}</span>
                    </div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <FiSettings size={15} /> Account Settings
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <FiPackage size={15} /> My Orders
                    </Link>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item dropdown-signout" onClick={handleLogout}>
                      <FiLogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="header-btn">
                <FiUser size={20} />
                <div className="user-info">
                  <span className="user-greeting">Hello, Sign in</span>
                  <span className="user-account">Account <FiChevronDown size={11} /></span>
                </div>
              </Link>
            )}

            <Link to="/cart" className="cart-btn">
              <div className="cart-icon-wrapper">
                <FiShoppingCart size={24} />
                {itemCount > 0 && <span className="cart-badge">{itemCount > 99 ? '99+' : itemCount}</span>}
              </div>
              <span className="cart-label">Cart</span>
            </Link>

            <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        <div className="container">
          <Link to="/products" className="nav-link">All Products</Link>
          {categories.slice(0, 6).map(cat => (
            <Link key={cat.id} to={`/products?categoryId=${cat.id}`} className="nav-link">
              {cat.name}
            </Link>
          ))}
          <Link to="/products?isFeatured=true" className="nav-link nav-link-deals">Today's Deals</Link>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-nav">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <FiSearch size={16} />
            </button>
          </form>
          <Link to="/" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/products" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>All Products</Link>
          {categories.map(cat => (
            <Link key={cat.id} to={`/products?categoryId=${cat.id}`} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              {cat.name}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/orders" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>My Orders</Link>
              <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Profile</Link>
              <button className="mobile-nav-link mobile-signout" onClick={() => { handleLogout(); setMobileOpen(false); }}>Sign Out</button>
            </>
          ) : (
            <Link to="/login" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
