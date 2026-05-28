import { useState } from 'react';

// Visual-only card form shown when no Stripe key is configured.
// Lets you preview the layout. Does NOT process real payments.
export default function MockCardForm({ total }) {
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvc: '' });
  const set = (k) => (e) => setCard({ ...card, [k]: e.target.value });

  const fmtNumber = (v) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
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
      <button type="button" disabled className="btn-primary mt-2 w-full opacity-60">
        Pay €{Number(total).toFixed(2)}
      </button>
      <p className="text-center text-xs text-gray-400">
        Preview only — add your Stripe key to enable real card payments.
      </p>
    </form>
  );
}
