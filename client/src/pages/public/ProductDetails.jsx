import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../../services/catalog.service.js';
import { useCartStore } from '../../store/cartStore.js';
import VariantSelector from '../../components/product/VariantSelector.jsx';
import Price from '../../components/common/Price.jsx';
import Loader from '../../components/common/Loader.jsx';

export default function ProductDetails() {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const add = useCartStore((s) => s.add);
  const [product, setProduct] = useState(null);
  const [variant, setVariant] = useState(null);
  const [activeImg, setActiveImg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProduct(productSlug).then((p) => {
      setProduct(p);
      setVariant(p.variants?.find((v) => v.stock > 0) || p.variants?.[0] || null);
      setActiveImg(p.mainImage);
    }).finally(() => setLoading(false));
  }, [productSlug]);

  if (loading) return <Loader />;
  if (!product) return <div className="container-page py-24 text-center text-gray-500">Product not found.</div>;

  const gallery = [product.mainImage, ...(product.images || []).map((i) => i.imageUrl)]
    .filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

  const handleAdd = async () => {
    if (!variant) return;
    await add(variant, product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="container-page grid gap-10 py-12 md:grid-cols-2">
      <div>
        <div className="aspect-square overflow-hidden rounded-3xl bg-gray-50">
          <img src={activeImg} alt={product.name} className="h-full w-full object-cover" />
        </div>
        {gallery.length > 1 && (
          <div className="mt-4 flex gap-3">
            {gallery.map((img) => (
              <button key={img} onClick={() => setActiveImg(img)}
                className={`h-16 w-16 overflow-hidden rounded-xl border ${activeImg === img ? 'border-accent' : 'border-gray-200'}`}>
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm text-gray-400">{product.brand?.name} · {product.category?.name}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-graphite">{product.name}</h1>
        <Price value={product.price} className="mt-3 block text-2xl text-graphite" />
        <p className="mt-5 text-gray-600">{product.description}</p>

        {product.variants?.length > 0 && (
          <div className="mt-6">
            <VariantSelector variants={product.variants} selected={variant} onSelect={setVariant} />
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <button onClick={handleAdd} disabled={!variant || variant.stock <= 0} className="btn-primary disabled:opacity-50">
            {added ? 'Added ✓' : 'Add to cart'}
          </button>
          <button onClick={() => { handleAdd().then(() => navigate('/cart')); }}
            disabled={!variant || variant.stock <= 0} className="btn-outline disabled:opacity-50">
            Buy now
          </button>
        </div>
        {variant && <p className="mt-3 text-xs text-gray-400">{variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}</p>}
      </div>
    </div>
  );
}
