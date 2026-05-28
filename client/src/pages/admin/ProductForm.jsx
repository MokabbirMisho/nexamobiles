import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api.js';
import { getBrands, getCategories } from '../../services/catalog.service.js';
import Loader from '../../components/common/Loader.jsx';

const emptyVariant = { ram: '', storage: '', color: '', stock: 0 };

export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', price: '', brandId: '', categoryId: '',
    mainImage: '', isFeatured: false, isNewArrival: false,
    images: '', variants: [{ ...emptyVariant }],
  });
  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  useEffect(() => {
    getBrands().then(setBrands);
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!editing) return;
    // load existing product by id via list (simple approach)
    api.get('/products').then((r) => {
      const p = r.data.find((x) => x.id === Number(id));
      if (p) setForm((f) => ({
        ...f, name: p.name, description: p.description || '', price: p.price,
        brandId: p.brandId, categoryId: p.categoryId, mainImage: p.mainImage || '',
        isFeatured: p.isFeatured, isNewArrival: p.isNewArrival,
        images: (p.images || []).map((i) => i.imageUrl).join(', '),
        variants: p.variants?.length ? p.variants : [{ ...emptyVariant }],
      }));
    }).finally(() => setLoading(false));
  }, [editing, id]);

  const setVariant = (i, k) => (e) => {
    const variants = [...form.variants];
    variants[i] = { ...variants[i], [k]: e.target.value };
    setForm({ ...form, variants });
  };
  const addVariant = () => setForm({ ...form, variants: [...form.variants, { ...emptyVariant }] });
  const removeVariant = (i) => setForm({ ...form, variants: form.variants.filter((_, idx) => idx !== i) });

  const submit = async (e) => {
    e.preventDefault(); setError('');
    const payload = {
      name: form.name, description: form.description, price: form.price,
      brandId: form.brandId, categoryId: form.categoryId, mainImage: form.mainImage,
      isFeatured: form.isFeatured, isNewArrival: form.isNewArrival,
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
      variants: form.variants.map((v) => ({ ...v, stock: Number(v.stock) })),
    };
    try {
      if (editing) await api.put(`/products/${id}`, payload);
      else await api.post('/products', payload);
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  if (loading) return <Loader />;
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-graphite">{editing ? 'Edit product' : 'Add product'}</h1>
      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input className="input" placeholder="Name" value={form.name} onChange={set('name')} required />
        <textarea className="input" rows="3" placeholder="Description" value={form.description} onChange={set('description')} />
        <div className="grid grid-cols-2 gap-4">
          <input className="input" type="number" step="0.01" placeholder="Price (€)" value={form.price} onChange={set('price')} required />
          <input className="input" placeholder="Main image URL" value={form.mainImage} onChange={set('mainImage')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select className="input" value={form.brandId} onChange={set('brandId')} required>
            <option value="">Select brand</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select className="input" value={form.categoryId} onChange={set('categoryId')} required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <input className="input" placeholder="Gallery image URLs (comma separated)" value={form.images} onChange={set('images')} />
        <div className="flex gap-6 text-sm text-gray-600">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} /> Featured</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isNewArrival} onChange={set('isNewArrival')} /> New arrival</label>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-graphite">Variants</p>
            <button type="button" onClick={addVariant} className="text-sm text-accent">+ Add variant</button>
          </div>
          <div className="mt-3 space-y-3">
            {form.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-5 items-center gap-2">
                <input className="input" placeholder="RAM" value={v.ram || ''} onChange={setVariant(i, 'ram')} />
                <input className="input" placeholder="Storage" value={v.storage || ''} onChange={setVariant(i, 'storage')} />
                <input className="input" placeholder="Color" value={v.color || ''} onChange={setVariant(i, 'color')} />
                <input className="input" type="number" placeholder="Stock" value={v.stock} onChange={setVariant(i, 'stock')} />
                <button type="button" onClick={() => removeVariant(i)} className="text-sm text-gray-400 hover:text-red-500">Remove</button>
              </div>
            ))}
          </div>
          {editing && <p className="mt-2 text-xs text-gray-400">Note: variant edits create new variants; manage stock under Stock.</p>}
        </div>

        <button className="btn-primary">{editing ? 'Save changes' : 'Create product'}</button>
      </form>
    </div>
  );
}
