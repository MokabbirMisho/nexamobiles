import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getBrands } from '../../services/catalog.service.js';
import ProductGrid from '../../components/product/ProductGrid.jsx';
import Loader from '../../components/common/Loader.jsx';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ featured: 'true' }),
      getProducts({ newArrival: 'true' }),
      getProducts({ category: 'accessories' }),
      getBrands(),
    ]).then(([f, n, a, b]) => {
      setFeatured(f); setNewArrivals(n); setAccessories(a); setBrands(b);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white">
        <div className="container-page grid items-center gap-8 py-16 sm:grid-cols-2 sm:py-24">
          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-graphite sm:text-5xl">
              The latest phones. <br />Priced to move.
            </h1>
            <p className="mt-4 max-w-md text-gray-500">
              Genuine new devices from Apple, Samsung, Vivo, Oppo and Realme — delivered fast across Germany.
            </p>
            <Link to="/shop" className="btn-primary mt-8">Shop now</Link>
          </div>
          {featured[0] && (
            <Link to={`/products/${featured[0].slug}`} className="flex justify-center">
              <img src={featured[0].mainImage} alt={featured[0].name} className="max-h-80 rounded-3xl object-contain" />
            </Link>
          )}
        </div>
      </section>

      {/* Brand strip */}
      <section className="container-page py-10">
        <div className="flex flex-wrap justify-center gap-3">
          {brands.map((b) => (
            <Link key={b.id} to={`/brands/${b.slug}`}
              className="rounded-full border border-gray-200 px-5 py-2 text-sm text-gray-600 hover:border-gray-400">
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      <Section title="Featured phones" items={featured} />
      <Section title="New arrivals" items={newArrivals} />
      <Section title="Accessories" items={accessories} />

      {/* Why choose us */}
      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            ['Genuine products', 'Every device is brand new and authentic.'],
            ['Secure payment', 'Card and PayPal, encrypted end to end.'],
            ['Fast checkout', 'From cart to confirmation in seconds.'],
          ].map(([t, d]) => (
            <div key={t} className="card p-6">
              <p className="font-medium text-graphite">{t}</p>
              <p className="mt-1 text-sm text-gray-500">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Section({ title, items }) {
  if (!items?.length) return null;
  return (
    <section className="container-page py-8">
      <h2 className="mb-5 text-2xl font-semibold tracking-tight text-graphite">{title}</h2>
      <ProductGrid products={items} />
    </section>
  );
}
