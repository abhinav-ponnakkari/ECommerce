import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        Back to top
      </div>
      <div className="footer-main">
        <div className="container footer-grid">
          <div className="footer-col">
            <h4>Get to Know Us</h4>
            <Link to="/about">About AbhiShop</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/help">Help Center</Link>
          </div>
          <div className="footer-col">
            <h4>Shop With Us</h4>
            <Link to="/products">All Products</Link>
            <Link to="/deals">Today's Deals</Link>
            <Link to="/cart">Your Cart</Link>
            <Link to="/orders">Track Orders</Link>
            <Link to="/wishlist">Wishlist</Link>
          </div>
          <div className="footer-col">
            <h4>Customer Service</h4>
            <Link to="/help">Help Center</Link>
            <Link to="/help#returns">Returns &amp; Refunds</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/addresses">My Addresses</Link>
          </div>
          <div className="footer-col">
            <h4>Connect With Us</h4>
            <div className="social-links">
              <a href="#!" className="social-link"><FiFacebook size={20} /></a>
              <a href="#!" className="social-link"><FiTwitter size={20} /></a>
              <a href="#!" className="social-link"><FiInstagram size={20} /></a>
              <a href="#!" className="social-link"><FiYoutube size={20} /></a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <Link to="/" className="footer-logo">
            <span style={{ color: 'var(--primary)' }}>Abhi</span>
            <span>Shop</span>
          </Link>
          <p>© {new Date().getFullYear()} AbhiShop. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
