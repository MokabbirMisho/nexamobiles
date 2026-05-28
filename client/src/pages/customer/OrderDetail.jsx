import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api.js';
import Loader from '../../components/common/Loader.jsx';
import Price from '../../components/common/Price.jsx';

export default function OrderDetail() {
  const { orderId } = useParams();
  const [params] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const justPaid = params.get('paid') === '1';

  useEffect(() => { api.get(`/orders/${orderId}`).then((r) => setOrder(r.data)).finally(() => setLoading(false)); }, [orderId]);

  if (loading) return <Loader />;
  if (!order) return <div className="container-page py-24 text-center text-gray-500">Order not found.</div>;

  return (
    <div className="container-page max-w-2xl py-12">
      {justPaid && (
        <div className="mb-6 rounded-2xl bg-green-50 p-5 text-center">
          <p className="text-lg font-semibold text-green-700">Payment successful 🎉</p>
          <p className="text-sm text-green-600">A confirmation email is on its way.</p>
        </div>
      )}
      <h1 className="text-2xl font-semibold tracking-tight text-graphite">Order #{order.id}</h1>
      <p className="mt-1 text-sm text-gray-400">
        {new Date(order.createdAt).toLocaleString()} · {order.status} · {order.paymentStatus}
      </p>

      <div className="card mt-6 divide-y divide-gray-100 p-2">
        {order.items.map((it) => (
          <div key={it.id} className="flex justify-between px-4 py-3 text-sm">
            <span className="text-graphite">{it.product?.name} × {it.quantity}</span>
            <Price value={Number(it.unitPrice) * it.quantity} className="text-gray-600" />
          </div>
        ))}
        <div className="flex justify-between px-4 py-3 font-semibold text-graphite">
          <span>Total</span><Price value={order.totalAmount} />
        </div>
      </div>
    </div>
  );
}
