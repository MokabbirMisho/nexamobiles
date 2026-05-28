import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../controllers/cart.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', getCart);
router.post('/', addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeCartItem);
export default router;
