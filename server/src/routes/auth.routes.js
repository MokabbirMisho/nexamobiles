import { Router } from 'express';
import { register, login, me, googleLogin, updateProfile, deleteAccount, createAdmin } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/admin.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateProfile);
router.delete('/me', requireAuth, deleteAccount);
router.post('/admins', requireAuth, requireAdmin, createAdmin);
export default router;
