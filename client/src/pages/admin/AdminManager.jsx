import { useState } from 'react';
import api from '../../services/api.js';

export default function AdminManager() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg(''); setErr(''); setBusy(true);
    try {
      const { data } = await api.post('/auth/admins', form);
      setMsg(
        data.promoted
          ? `${data.user.email} is now an admin (existing account promoted).`
          : `New admin created: ${data.user.email}`,
      );
      setForm({ name: '', email: '', password: '' });
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Could not create admin');
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-graphite">Admins</h1>
      <p className="mt-1 text-sm text-gray-500">
        Create a new admin, or promote an existing customer to admin by their email.
      </p>

      {msg && <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</p>}
      {err && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}

      <form onSubmit={submit} className="card mt-6 space-y-3 p-6">
        <div>
          <label className="mb-1 block text-sm text-gray-600">Email</label>
          <input className="input" type="email" required value={form.email}
            onChange={set('email')} placeholder="newadmin@example.com" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600">Name <span className="text-gray-400">(new admin only)</span></label>
          <input className="input" value={form.name} onChange={set('name')} placeholder="Full name" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600">Password <span className="text-gray-400">(new admin only)</span></label>
          <input className="input" type="password" value={form.password}
            onChange={set('password')} placeholder="At least 6 characters" />
        </div>
        <button disabled={busy || !form.email} className="btn-primary disabled:opacity-60">
          {busy ? 'Saving...' : 'Add admin'}
        </button>
        <p className="text-xs text-gray-400">
          If the email already has an account, it's promoted to admin (name/password ignored).
          Otherwise a brand-new admin account is created.
        </p>
      </form>
    </div>
  );
}
