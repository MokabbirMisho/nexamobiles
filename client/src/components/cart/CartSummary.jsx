import Price from '../common/Price.jsx';

export default function CartSummary({ total, children }) {
  return (
    <div className="card p-6">
      <p className="text-lg font-semibold text-graphite">Order summary</p>
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>Subtotal</span><Price value={total} />
      </div>
      <div className="mt-1 flex justify-between text-sm text-gray-600">
        <span>Shipping</span><span>Free</span>
      </div>
      <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base font-semibold text-graphite">
        <span>Total</span><Price value={total} />
      </div>
      {children}
    </div>
  );
}
