import { create } from 'zustand';
import api from '../services/api.js';

const persisted = () => {
  try { return JSON.parse(localStorage.getItem('nexa_auth')) || {}; } catch { return {}; }
};
const save = (state) =>
  localStorage.setItem('nexa_auth', JSON.stringify({ user: state.user, token: state.token }));

export const useAuthStore = create((set, get) => ({
  user: persisted().user || null,
  token: persisted().token || null,

  isAuthenticated: () => !!get().token,
  isAdmin: () => !!get().user?.isAdmin,

  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    set({ user: data.user, token: data.token });
    save(get());
    return data.user;
  },

  async register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password });
    set({ user: data.user, token: data.token });
    save(get());
    return data.user;
  },

  async googleLogin(credential) {
    const { data } = await api.post('/auth/google', { credential });
    set({ user: data.user, token: data.token });
    save(get());
    return data.user;
  },

  logout() {
    set({ user: null, token: null });
    localStorage.removeItem('nexa_auth');
  },
}));
