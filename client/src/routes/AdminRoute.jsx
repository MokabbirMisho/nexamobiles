import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

export default function AdminRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/" replace />;
  return children;
}
