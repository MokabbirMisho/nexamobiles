import { useState } from 'react';
import {
  useStripe, useElements,
  CardNumberElement, CardExpiryElement, CardCvcElement,
} from '@stripe/react-stripe-js';
import api from '../../services/api.js';

const elementStyle = {
  style: {
    base: { fontSize: '15px', color: '#1d1d1f', '::placeholder': { color: '#9ca3af' } },
    invalid: { color: '#dc2626' },
  },
};

// Renders the card fields (cardholder name + number + expiry + cvc) and processes payment.
export default function StripeCardForm({ order, total, onPaid, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const pay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true); onError('');
    try {
      // 1. ask server for a PaymentIntent client secret
      const { data } = await api.post('/payments/stripe/create-intent', { orderId: order.id });

      // 2. confirm the card payment on the client (card data goes straight to Stripe)
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: { name },
        },
      });

      if (result.error) { onError(result.error.message); return; }

      // 3. tell server to mark the order paid
      if (result.paymentIntent?.status === 'succeeded') {
        await api.post('/payments/stripe/confirm-intent', {
          orderId: order.id, paymentIntentId: result.paymentIntent.id,
        });
        onPaid();
      }
    } catch (err) {
      onError(err.response?.data?.message || 'Payment failed');
    } finally { setBusy(false); }
  };

  const FieldBox = ({ children }) => (
    <div className="rounded-xl border border-gray-300 px-4 py-3">{children}</div>
  );

  return (
    <form onSubmit={pay} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm text-gray-600">Cardholder name</label>
        <input className="input" placeholder="Name on card" value={name}
          onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-600">Card number</label>
        <FieldBox><CardNumberElement options={elementStyle} /></FieldBox>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm text-gray-600">Expiry</label>
          <FieldBox><CardExpiryElement options={elementStyle} /></FieldBox>
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600">CVC</label>
          <FieldBox><CardCvcElement options={elementStyle} /></FieldBox>
        </div>
      </div>
      <button disabled={!stripe || busy} className="btn-primary mt-2 w-full">
        {busy ? 'Processing...' : `Pay €${Number(total).toFixed(2)}`}
      </button>
      <p className="text-center text-xs text-gray-400">Test card: 4242 4242 4242 4242 · any future date · any CVC</p>
    </form>
  );
}
