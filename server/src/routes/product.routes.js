import { Router } from 'express';
import {
  listProducts, getProductBySlug, createProduct, updateProduct,
  deleteProduct, updateVariantStock,
} from '../controllers/product.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/admin.js';

const router = Router();
router.get('/', listProducts);
router.get('/:slug', getProductBySlug);
router.post('/', requireAuth, requireAdmin, createProduct);
router.put('/variants/:variantId/stock', requireAuth, requireAdmin, updateVariantStock);
router.put('/:id', requireAuth, requireAdmin, updateProduct);
router.delete('/:id', requireAuth, requireAdmin, deleteProduct);
export default router;
