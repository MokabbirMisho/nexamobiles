import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';

export default function Navbar() {
  const { user, token } = useAuthStore();
  const count = useCartStore((s) => s.count());

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
              <Link to="/account" className="text-gray-600 hover:text-graphite">
                {user?.name?.split(' ')[0] || 'Account'}
              </Link>
            </>
          ) : (
            <Link to="/login" className="btn-primary">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
