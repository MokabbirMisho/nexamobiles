import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton.jsx';

export default function Signup() {
  const register = useAuthStore((s) => s.register);
  const mergeGuestCart = useCartStore((s) => s.mergeGuestCart);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      await mergeGuestCart();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="container-page flex justify-center py-16">
      <form onSubmit={submit} className="card w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold text-graphite">Create account</h1>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="mt-6 space-y-3">
          <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} required />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
          <input className="input" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')} required />
        </div>
        <button disabled={busy} className="btn-primary mt-6 w-full">{busy ? 'Creating...' : 'Sign up'}</button>
        <GoogleAuthButton onDone={() => navigate('/')} onError={setError} />
        <p className="mt-4 text-center text-sm text-gray-500">
          Have an account? <Link to="/login" className="text-accent">Login</Link>
        </p>
      </form>
    </div>
  );
}
