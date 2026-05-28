import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';

export default function Navbar() {
  const { user, token, logout } = useAuthStore();
  const count = useCartStore((s) => s.count());
  const clearLocal = useCartStore((s) => s.clearLocal);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); clearLocal(); navigate('/'); };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="text-xl font-semibold tracking-tight text-graphite">
          Nexa<span className="text-accent">Mobiles</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/shop" className="hidden text-gray-600 hover:text-graphite sm:block">Shop</Link>
          {user?.isAdmin && <Link to="/admin" className="text-gray-600 hover:text-graphite">Admin</Link>}
          <Link to="/cart" className="relative text-gray-600 hover:text-graphite">
            Cart
            {count > 0 && (
              <span className="absolute -right-3 -top-2 rounded-full bg-accent px-1.5 text-xs text-white">{count}</span>
            )}
          </Link>
          {token ? (
            <>
              <Link to="/orders" className="text-gray-600 hover:text-graphite">Orders</Link>
              <button onClick={handleLogout} className="text-gray-600 hover:text-graphite">Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn-primary">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
