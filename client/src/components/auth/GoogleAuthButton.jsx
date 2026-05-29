import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';

const enabled = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Renders a "Sign in with Google" button. After a successful Google sign-in
// it logs the user into our backend, merges the guest cart and runs onDone().
export default function GoogleAuthButton({ onDone, onError }) {
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const mergeGuestCart = useCartStore((s) => s.mergeGuestCart);

  if (!enabled) return null;

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        or
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <div className="flex justify-center">
        <GoogleLogin
          width="320"
          onSuccess={async (res) => {
            try {
              await googleLogin(res.credential);
              await mergeGuestCart();
              onDone?.();
            } catch (err) {
              onError?.(err.response?.data?.message || 'Google login failed');
            }
          }}
          onError={() => onError?.('Google login failed')}
        />
      </div>
    </div>
  );
}
