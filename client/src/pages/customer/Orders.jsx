import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import Loader from '../../components/common/Loader.jsx';
import Empty from '../../components/common/Empty.jsx';
import Price from '../../components/common/Price.jsx';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/orders/my-orders').then((r) => setOrders(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <Loader />;
  if (!orders.length) return <div className="container-page"><Empty title="No orders yet"
    action={<Link to="/shop" className="btn-primary">Start shopping</Link>} /></div>;

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-graphite">Your orders</h1>
      <div className="mt-6 space-y-3">
        {orders.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="card flex items-center justify-between p-5 hover:shadow-md">
            <div>
              <p className="font-medium text-graphite">Order #{o.id}</p>
              <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString()} · {o.items.length} item(s)</p>
            </div>
            <div className="text-right">
              <Price value={o.totalAmount} className="font-medium text-graphite" />
              <p className="text-xs text-gray-400">{o.status} · {o.paymentStatus}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
