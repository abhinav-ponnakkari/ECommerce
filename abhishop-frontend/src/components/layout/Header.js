import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiShoppingCart, FiSearch, FiUser, FiMenu, FiX,
  FiChevronDown, FiPackage, FiLogOut, FiSettings,
  FiHeart, FiMapPin, FiShield, FiZap
} from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';
import { resetCart } from '../../store/slices/cartSlice';
import { resetWishlist } from '../../store/slices/wishlistSlice';
import './Header.css';

function Header() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((state) => state.auth);
  const { itemCount } = useSelector((state) => state.cart);
  const { productIds: wishlistIds } = useSelector((state) => state.wishlist);
  const { items: categories } = useSelector((state) => state.categories);

  const [search,       setSearch]       = useState('');
  const [mobileOpen,   setMobileOpen]   = useState(false);
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
    dispatch(resetWishlist());
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
            {/* Wishlist */}
            {user && (
              <Link to="/wishlist" className="header-icon-btn" title="Wishlist">
                <div style={{ position: 'relative' }}>
                  <FiHeart size={22} />
                  {wishlistIds.length > 0 && (
                    <span className="cart-badge" style={{ background: '#e74a3b' }}>
                      {wishlistIds.length > 99 ? '99+' : wishlistIds.length}
                    </span>
                  )}
                </div>
              </Link>
            )}

            {/* User menu */}
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
                    <Link to="/wishlist" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <FiHeart size={15} /> Wishlist
                      {wishlistIds.length > 0 && <span className="badge badge-primary" style={{ marginLeft: 'auto', fontSize: 10 }}>{wishlistIds.length}</span>}
                    </Link>
                    <Link to="/addresses" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <FiMapPin size={15} /> My Addresses
                    </Link>
                    {user.role === 'Admin' && (
                      <>
                        <hr className="dropdown-divider" />
                        <Link to="/admin" className="dropdown-item" style={{ color: 'var(--primary)', fontWeight: 600 }} onClick={() => setUserMenuOpen(false)}>
                          <FiShield size={15} /> Admin Panel
                        </Link>
                      </>
                    )}
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

      {/* Nav bar */}
      <nav className="header-nav">
        <div className="container">
          <Link to="/products" className="nav-link">All Products</Link>
          {categories.slice(0, 5).map(cat => (
            <Link key={cat.id} to={`/products?categoryId=${cat.id}`} className="nav-link">
              {cat.name}
            </Link>
          ))}
          <Link to="/deals" className="nav-link nav-link-deals"><FiZap size={13} /> Today's Deals</Link>
        </div>
      </nav>

      {/* Mobile nav */}
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
          <Link to="/deals" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Today's Deals</Link>
          {categories.map(cat => (
            <Link key={cat.id} to={`/products?categoryId=${cat.id}`} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              {cat.name}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/orders" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>My Orders</Link>
              <Link to="/wishlist" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Wishlist</Link>
              <Link to="/addresses" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Addresses</Link>
              <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Profile</Link>
              {user.role === 'Admin' && <Link to="/admin" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
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
