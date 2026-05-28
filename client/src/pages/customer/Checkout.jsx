import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import api from '../../services/api.js';
import { useCartStore } from '../../store/cartStore.js';
import CartSummary from '../../components/cart/CartSummary.jsx';
import Empty from '../../components/common/Empty.jsx';
import StripeCardForm from '../../components/payment/StripeCardForm.jsx';
import MockCardForm from '../../components/payment/MockCardForm.jsx';
import PayPalCheckout from '../../components/payment/PayPalCheckout.jsx';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export default function Checkout() {
  const { items, total, load } = useCartStore();
  const navigate = useNavigate();
  const [method, setMethod] = useState('card');
  const [order, setOrder] = useState(null);   // the created (unpaid) order
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!items.length && !order)
    return <div className="container-page"><Empty title="Nothing to checkout" /></div>;

  const amount = total();

  // Step 1: create the order, then reveal the payment form
  const startPayment = async () => {
    setBusy(true); setError('');
    try {
      const { data } = await api.post('/orders', {});
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create order');
    } finally { setBusy(false); }
  };

  const handlePaid = async () => {
    await load();
    navigate(`/orders/${order.id}?paid=1`);
  };

  return (
    <div className="container-page grid gap-10 py-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-semibold tracking-tight text-graphite">Checkout</h1>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        {/* Method picker */}
        <div className="mt-8 space-y-3">
          <p className="font-medium text-graphite">Payment method</p>
          {[['card', 'Credit / Debit card'], ['paypal', 'PayPal']].map(([val, label]) => (
            <label key={val}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${method === val ? 'border-accent bg-accent/5' : 'border-gray-200'}`}>
              <input type="radio" name="pm" value={val} checked={method === val}
                onChange={() => setMethod(val)} disabled={!!order} />
              <span className="text-sm text-graphite">{label}</span>
            </label>
          ))}
        </div>

        {/* Payment form area */}
        <div className="mt-8">
          {!order ? (
            <button onClick={startPayment} disabled={busy} className="btn-primary">
              {busy ? 'Preparing...' : 'Continue to payment'}
            </button>
          ) : method === 'card' ? (
            stripePromise ? (
              <div className="card max-w-md p-6">
                <p className="mb-4 font-medium text-graphite">Enter card details</p>
                <Elements stripe={stripePromise}>
                  <StripeCardForm order={order} total={amount} onPaid={handlePaid} onError={setError} />
                </Elements>
              </div>
            ) : (
              <div className="card max-w-md p-6">
                <p className="mb-4 font-medium text-graphite">Enter card details</p>
                <MockCardForm total={amount} />
              </div>
            )
          ) : (
            <div className="card max-w-md p-6">
              <p className="mb-4 font-medium text-graphite">Pay with PayPal</p>
              <PayPalCheckout order={order} onPaid={handlePaid} onError={setError} />
            </div>
          )}
        </div>
      </div>

      <div>
        <CartSummary total={amount} />
      </div>
    </div>
  );
}
