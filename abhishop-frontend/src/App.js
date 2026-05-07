import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from './components/layout/Layout';

import HomePage from './pages/Home/HomePage';
import ProductsPage from './pages/Products/ProductsPage';
import ProductDetailPage from './pages/ProductDetail/ProductDetailPage';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import OrderSuccessPage from './pages/Checkout/OrderSuccessPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import OrdersPage from './pages/Orders/OrdersPage';
import OrderDetailPage from './pages/Orders/OrderDetailPage';
import WishlistPage from './pages/Wishlist/WishlistPage';
import AddressesPage from './pages/Addresses/AddressesPage';
import DealsPage from './pages/Deals/DealsPage';

import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminUsers from './pages/Admin/AdminUsers';

import AboutPage from './pages/Static/AboutPage';
import ContactPage from './pages/Static/ContactPage';
import HelpPage from './pages/Static/HelpPage';
import TermsPage from './pages/Static/TermsPage';
import PrivacyPage from './pages/Static/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';

import { fetchCart } from './store/slices/cartSlice';
import { fetchCategories } from './store/slices/categorySlice';
import { fetchWishlist } from './store/slices/wishlistSlice';

function PrivateRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Admin') return <Navigate to="/" replace />;
  return children;
}

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCategories());
    if (user) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Protected */}
        <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
        <Route path="/order-success" element={<PrivateRoute><OrderSuccessPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
        <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
        <Route path="/addresses" element={<PrivateRoute><AddressesPage /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
