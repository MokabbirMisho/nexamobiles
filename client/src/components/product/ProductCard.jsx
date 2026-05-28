import { Link } from 'react-router-dom';
import Price from '../common/Price.jsx';

export default function ProductCard({ product }) {
  const fromPrice = product.price;
  return (
    <Link to={`/products/${product.slug}`} className="card group overflow-hidden transition hover:shadow-md">
      <div className="aspect-square overflow-hidden bg-gray-50">
        {product.mainImage ? (
          <img src={product.mainImage} alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">No image</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          {product.isNewArrival && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">New</span>}
          {product.brand && <span className="text-xs text-gray-400">{product.brand.name}</span>}
        </div>
        <p className="mt-1 font-medium text-graphite">{product.name}</p>
        <Price value={fromPrice} className="mt-1 block text-sm text-gray-600" />
      </div>
    </Link>
  );
}
