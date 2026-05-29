import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';

export default function Account() {
  const { user, updateProfile, deleteAccount, logout } = useAuthStore();
  const clearLocal = useCartStore((s) => s.clearLocal);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleLogout = () => { logout(); clearLocal(); navigate('/'); };

  const handleDelete = async () => {
    setMsg(''); setErr(''); setBusy(true);
    try {
      await deleteAccount();
      clearLocal();
      navigate('/');
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Could not delete account');
      setBusy(false);
    }
  };

  const saveName = async (e) => {
    e.preventDefault();
    setMsg(''); setErr(''); setBusy(true);
    try {
      await updateProfile({ name });
      setMsg('Name updated.');
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Could not update name');
    } finally { setBusy(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (pw.next !== pw.confirm) return setErr('New passwords do not match');
    if (pw.next.length < 6) return setErr('New password must be at least 6 characters');
    setBusy(true);
    try {
      await updateProfile({ currentPassword: pw.current, newPassword: pw.next });
      setPw({ current: '', next: '', confirm: '' });
      setMsg('Password updated.');
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Could not update password');
    } finally { setBusy(false); }
  };

  return (
    <div className="container-page max-w-2xl py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-graphite">My Account</h1>
        <button onClick={handleLogout}
          className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          Log out
        </button>
      </div>

      {msg && <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</p>}
      {err && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}

      {/* Account info */}
      <div className="card mt-6 p-6">
        <p className="text-sm text-gray-500">Email</p>
        <p className="font-medium text-graphite">{user?.email}</p>
        <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
      </div>

      {/* Edit name */}
      <form onSubmit={saveName} className="card mt-6 space-y-3 p-6">
        <p className="font-medium text-graphite">Profile</p>
        <div>
          <label className="mb-1 block text-sm text-gray-600">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button disabled={busy || !name.trim()} className="btn-primary disabled:opacity-60">
          {busy ? 'Saving...' : 'Save name'}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={savePassword} className="card mt-6 space-y-3 p-6">
        <p className="font-medium text-graphite">Change password</p>
        <div>
          <label className="mb-1 block text-sm text-gray-600">Current password</label>
          <input type="password" className="input" value={pw.current}
            onChange={(e) => setPw({ ...pw, current: e.target.value })} placeholder="••••••" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-600">New password</label>
            <input type="password" className="input" value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Confirm new password</label>
            <input type="password" className="input" value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </div>
        </div>
        <button disabled={busy || !pw.next} className="btn-primary disabled:opacity-60">
          {busy ? 'Saving...' : 'Update password'}
        </button>
      </form>

      {/* Danger zone — delete account */}
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">Delete account</p>
        <p className="mt-1 text-sm text-red-600">
          This permanently deletes your account and all your orders. This cannot be undone.
        </p>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            Delete my account
          </button>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            <button onClick={handleDelete} disabled={busy}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">
              {busy ? 'Deleting...' : 'Yes, delete permanently'}
            </button>
            <button onClick={() => setConfirmDelete(false)} disabled={busy}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
