import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import { brands, categories } from './catalog.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';

const router = Router();
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/brands', brands);
router.use('/categories', categories);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);

// admin/orders alias from blueprint
router.use('/admin/orders', orderRoutes);
export default router;
