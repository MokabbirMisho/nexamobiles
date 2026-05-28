import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import Loader from '../../components/common/Loader.jsx';
import Price from '../../components/common/Price.jsx';

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const reload = () => { setLoading(true); api.get('/orders/admin/all').then((r) => setOrders(r.data)).finally(() => setLoading(false)); };
  useEffect(reload, []);

  const changeStatus = async (id, status) => { await api.put(`/orders/admin/${id}/status`, { status }); reload(); };

  if (loading) return <Loader />;
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-graphite">Orders</h1>
      <div className="card mt-6 divide-y divide-gray-100">
        {orders.map((o) => (
          <div key={o.id} className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <p className="font-medium text-graphite">#{o.id} · {o.user?.name}</p>
              <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString()} · {o.paymentStatus}</p>
            </div>
            <Price value={o.totalAmount} className="text-sm text-gray-600" />
            <select className="input max-w-[10rem]" value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
        {!orders.length && <p className="p-6 text-sm text-gray-400">No orders yet.</p>}
      </div>
    </div>
  );
}
