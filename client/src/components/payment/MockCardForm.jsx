import { useState } from 'react';
import api from '../../services/api.js';

// Demo card form used while Stripe is not configured. It does NOT process a
// real charge — on submit it confirms the order in "demo" mode so the order
// is marked paid and the confirmation email + PDF receipt are sent.
export default function MockCardForm({ order, total, onPaid, onError }) {
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvc: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setCard({ ...card, [k]: e.target.value });

  const fmtNumber = (v) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const filled = card.name && card.number.replace(/\s/g, '').length >= 12 && card.expiry && card.cvc;

  const submit = async (e) => {
    e.preventDefault();
    if (!filled) return;
    setBusy(true);
    try {
      await api.post('/payments/mock/confirm', { orderId: order.id });
      onPaid?.();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Payment failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm text-gray-600">Cardholder name</label>
        <input className="input" placeholder="Name on card" value={card.name} onChange={set('name')} />
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-600">Card number</label>
        <input className="input" inputMode="numeric" placeholder="1234 5678 9012 3456"
          value={card.number} onChange={(e) => setCard({ ...card, number: fmtNumber(e.target.value) })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm text-gray-600">Expiry</label>
          <input className="input" placeholder="MM/YY" value={card.expiry}
            onChange={(e) => setCard({ ...card, expiry: fmtExpiry(e.target.value) })} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600">CVC</label>
          <input className="input" inputMode="numeric" placeholder="123" maxLength={4}
            value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '') })} />
        </div>
      </div>
      <button type="submit" disabled={!filled || busy} className="btn-primary mt-2 w-full disabled:opacity-60">
        {busy ? 'Processing...' : `Pay €${Number(total).toFixed(2)}`}
      </button>
      <p className="text-center text-xs text-gray-400">
        Demo mode — no real charge. Confirms your order and emails a PDF receipt.
      </p>
    </form>
  );
}
