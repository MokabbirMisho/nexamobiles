import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore.js';
import { useAuthStore } from '../../store/authStore.js';
import CartItem from '../../components/cart/CartItem.jsx';
import CartSummary from '../../components/cart/CartSummary.jsx';
import Empty from '../../components/common/Empty.jsx';

export default function Cart() {
  const { items, total, updateQty, remove } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  if (!items.length)
    return <div className="container-page"><Empty title="Your cart is empty"
      action={<Link to="/shop" className="btn-primary">Browse phones</Link>} /></div>;

  const goCheckout = () => navigate(token ? '/checkout' : '/login', token ? {} : { state: { from: { pathname: '/checkout' } } });

  return (
    <div className="container-page grid gap-10 py-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-semibold tracking-tight text-graphite">Cart</h1>
        <div className="mt-6">
          {items.map((item) => (
            <CartItem key={item.id} item={item}
              onQty={(q) => updateQty(item.id, q)} onRemove={() => remove(item.id)} />
          ))}
        </div>
      </div>
      <div>
        <CartSummary total={total()}>
          <button onClick={goCheckout} className="btn-primary mt-6 w-full">
            {token ? 'Proceed to checkout' : 'Login to checkout'}
          </button>
        </CartSummary>
      </div>
    </div>
  );
}
