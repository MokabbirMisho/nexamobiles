import { useEffect, useState } from 'react';
import { getProducts } from '../../services/catalog.service.js';
import api from '../../services/api.js';
import Loader from '../../components/common/Loader.jsx';

export default function StockManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(null);
  const reload = () => { setLoading(true); getProducts().then(setProducts).finally(() => setLoading(false)); };
  useEffect(reload, []);

  const save = async (variantId, stock) => {
    await api.put(`/products/variants/${variantId}/stock`, { stock: Number(stock) });
    setSaved(variantId); setTimeout(() => setSaved(null), 1200);
  };

  if (loading) return <Loader />;
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-graphite">Stock management</h1>
      <div className="mt-6 space-y-6">
        {products.map((p) => (
          <div key={p.id} className="card p-4">
            <p className="font-medium text-graphite">{p.name}</p>
            <div className="mt-3 space-y-2">
              {p.variants.map((v) => (
                <div key={v.id} className="flex items-center gap-3 text-sm">
                  <span className="flex-1 text-gray-600">{[v.storage, v.color].filter(Boolean).join(' · ') || v.sku}</span>
                  <input type="number" defaultValue={v.stock} className="input max-w-[6rem]"
                    onBlur={(e) => save(v.id, e.target.value)} />
                  {saved === v.id && <span className="text-xs text-green-600">Saved ✓</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
