import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../services/catalog.service.js';
import api from '../../services/api.js';
import Loader from '../../components/common/Loader.jsx';
import Price from '../../components/common/Price.jsx';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const reload = () => { setLoading(true); getProducts().then(setProducts).finally(() => setLoading(false)); };
  useEffect(reload, []);

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    reload();
  };

  if (loading) return <Loader />;
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-graphite">Products</h1>
        <Link to="/admin/products/new" className="btn-primary">Add product</Link>
      </div>
      <div className="card mt-6 divide-y divide-gray-100">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4">
            <img src={p.mainImage} alt="" className="h-12 w-12 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="font-medium text-graphite">{p.name}</p>
              <p className="text-xs text-gray-400">{p.brand?.name} · {p.category?.name}</p>
            </div>
            <Price value={p.price} className="text-sm text-gray-600" />
            <Link to={`/admin/products/${p.id}/edit`} className="text-sm text-accent">Edit</Link>
            <button onClick={() => remove(p.id)} className="text-sm text-gray-400 hover:text-red-500">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
