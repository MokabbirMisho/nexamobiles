import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const mergeGuestCart = useCartStore((s) => s.mergeGuestCart);
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from?.pathname || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      await login(email, password);
      await mergeGuestCart();
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="container-page flex justify-center py-16">
      <form onSubmit={submit} className="card w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold text-graphite">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Login to continue to checkout.</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="mt-6 space-y-3">
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button disabled={busy} className="btn-primary mt-6 w-full">{busy ? 'Logging in...' : 'Login'}</button>
        <p className="mt-4 text-center text-sm text-gray-500">
          No account? <Link to="/signup" className="text-accent">Sign up</Link>
        </p>
        <p className="mt-2 text-center text-xs text-gray-400">Demo admin: [email protected] / admin123</p>
      </form>
    </div>
  );
}
