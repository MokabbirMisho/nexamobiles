import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { getProducts } from '../../services/catalog.service.js';
import Loader from '../../components/common/Loader.jsx';
import Price from '../../components/common/Price.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    Promise.all([getProducts(), api.get('/orders/admin/all').then((r) => r.data)])
      .then(([products, orders]) => {
        const revenue = orders.filter((o) => o.paymentStatus === 'PAID')
          .reduce((s, o) => s + Number(o.totalAmount), 0);
        setStats({ products: products.length, orders: orders.length, revenue });
      });
  }, []);
  if (!stats) return <Loader />;

  const cards = [
    ['Products', stats.products],
    ['Orders', stats.orders],
    ['Revenue (paid)', <Price key="r" value={stats.revenue} />],
  ];
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-graphite">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map(([label, val]) => (
          <div key={label} className="card p-6">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-graphite">{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
