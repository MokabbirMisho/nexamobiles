import { Router } from 'express';
import {
  createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus,
} from '../controllers/order.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/admin.js';

const router = Router();
router.use(requireAuth);
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/admin/all', requireAdmin, getAllOrders);
router.put('/admin/:id/status', requireAdmin, updateOrderStatus);
router.get('/:id', getOrderById);
export default router;
