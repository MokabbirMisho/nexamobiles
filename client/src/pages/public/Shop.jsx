import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProducts, getBrands, getCategories } from '../../services/catalog.service.js';
import ProductGrid from '../../components/product/ProductGrid.jsx';
import Loader from '../../components/common/Loader.jsx';
import Empty from '../../components/common/Empty.jsx';

export default function Shop() {
  const { brandSlug, categorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState(brandSlug || '');
  const [category, setCategory] = useState(categorySlug || '');
  const [search, setSearch] = useState('');

  useEffect(() => { setBrand(brandSlug || ''); }, [brandSlug]);
  useEffect(() => { setCategory(categorySlug || ''); }, [categorySlug]);

  useEffect(() => {
    getBrands().then(setBrands);
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (brand) params.brand = brand;
    if (category) params.category = category;
    if (search) params.search = search;
    getProducts(params).then(setProducts).finally(() => setLoading(false));
  }, [brand, category, search]);

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-graphite">Shop</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input className="input max-w-xs" placeholder="Search phones..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-[10rem]" value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">All brands</option>
          {brands.map((b) => <option key={b.id} value={b.slug}>{b.name}</option>)}
        </select>
        <select className="input max-w-[12rem]" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      <div className="mt-8">
        {loading ? <Loader />
          : products.length ? <ProductGrid products={products} />
          : <Empty title="No products found" subtitle="Try a different filter." />}
      </div>
    </div>
  );
}
