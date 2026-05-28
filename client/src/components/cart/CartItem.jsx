import Price from '../common/Price.jsx';

export default function CartItem({ item, onQty, onRemove }) {
  const p = item.variant?.product;
  const v = item.variant;
  return (
    <div className="flex items-center gap-4 border-b border-gray-100 py-4">
      <img src={p?.mainImage} alt={p?.name} className="h-20 w-20 rounded-xl object-cover" />
      <div className="flex-1">
        <p className="font-medium text-graphite">{p?.name}</p>
        <p className="text-xs text-gray-400">{[v?.storage, v?.color].filter(Boolean).join(' · ')}</p>
        <Price value={p?.price} className="text-sm text-gray-600" />
      </div>
      <div className="flex items-center gap-2">
        <button className="h-7 w-7 rounded-full border border-gray-300" onClick={() => onQty(item.quantity - 1)}>−</button>
        <span className="w-6 text-center text-sm">{item.quantity}</span>
        <button className="h-7 w-7 rounded-full border border-gray-300" onClick={() => onQty(item.quantity + 1)}>+</button>
      </div>
      <button onClick={onRemove} className="text-sm text-gray-400 hover:text-red-500">Remove</button>
    </div>
  );
}
