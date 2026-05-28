import { NavLink, Outlet } from 'react-router-dom';

const link = ({ isActive }) =>
  `block rounded-xl px-4 py-2 text-sm ${isActive ? 'bg-accent/10 text-accent' : 'text-gray-600 hover:bg-gray-50'}`;

export default function AdminLayout() {
  return (
    <div className="container-page grid gap-8 py-10 md:grid-cols-[200px_1fr]">
      <aside>
        <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Admin</p>
        <nav className="space-y-1">
          <NavLink to="/admin" end className={link}>Dashboard</NavLink>
          <NavLink to="/admin/products" className={link}>Products</NavLink>
          <NavLink to="/admin/products/new" className={link}>Add product</NavLink>
          <NavLink to="/admin/orders" className={link}>Orders</NavLink>
          <NavLink to="/admin/stock" className={link}>Stock</NavLink>
        </nav>
      </aside>
      <section><Outlet /></section>
    </div>
  );
}
