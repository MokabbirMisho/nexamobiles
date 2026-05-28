import api from './api.js';
export const getProducts = (params) => api.get('/products', { params }).then((r) => r.data);
export const getProduct = (slug) => api.get(`/products/${slug}`).then((r) => r.data);
export const getBrands = () => api.get('/brands').then((r) => r.data);
export const getCategories = () => api.get('/categories').then((r) => r.data);
