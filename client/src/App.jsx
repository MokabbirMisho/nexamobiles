import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AdminRoute from './routes/AdminRoute.jsx';
import { useCartStore } from './store/cartStore.js';

import Home from './pages/public/Home.jsx';
import Shop from './pages/public/Shop.jsx';
import ProductDetails from './pages/public/ProductDetails.jsx';
import Cart from './pages/public/Cart.jsx';
import Login from './pages/public/Login.jsx';
import Signup from './pages/public/Signup.jsx';

import Checkout from './pages/customer/Checkout.jsx';
import Orders from './pages/customer/Orders.jsx';
import OrderDetail from './pages/customer/OrderDetail.jsx';

import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ProductList from './pages/admin/ProductList.jsx';
import ProductForm from './pages/admin/ProductForm.jsx';
import OrderList from './pages/admin/OrderList.jsx';
import StockManager from './pages/admin/StockManager.jsx';

export default function App() {
  const load = useCartStore((s) => s.load);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/brands/:brandSlug" element={<Shop />} />
          <Route path="/categories/:categorySlug" element={<Shop />} />
          <Route path="/products/:productSlug" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="stock" element={<StockManager />} />
          </Route>

          <Route path="*" element={<div className="container-page py-24 text-center text-gray-500">Page not found.</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
