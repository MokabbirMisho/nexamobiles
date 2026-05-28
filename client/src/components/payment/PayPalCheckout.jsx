import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import api from '../../services/api.js';

// Renders the official PayPal button. Clicking it opens PayPal's secure login popup.
export default function PayPalCheckout({ order, onPaid, onError }) {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';

  return (
    <PayPalScriptProvider options={{ clientId, currency: 'EUR' }}>
      <PayPalButtons
        style={{ layout: 'vertical', shape: 'pill' }}
        createOrder={async () => {
          const { data } = await api.post('/payments/paypal/create-order', { orderId: order.id });
          return data.id; // PayPal order id from our server
        }}
        onApprove={async (data) => {
          try {
            await api.post('/payments/paypal/capture-order', {
              orderId: order.id, paypalOrderId: data.orderID,
            });
            onPaid();
          } catch (err) {
            onError(err.response?.data?.message || 'PayPal capture failed');
          }
        }}
        onError={(err) => onError(err?.message || 'PayPal error')}
      />
    </PayPalScriptProvider>
  );
}
