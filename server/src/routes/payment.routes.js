import { Router } from 'express';
import {
  createStripeSession, confirmStripe, createStripeIntent, confirmStripeIntent,
  paypalCreateOrder, paypalCaptureOrder,
} from '../controllers/payment.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);
router.post('/stripe/create-intent', createStripeIntent);
router.post('/stripe/confirm-intent', confirmStripeIntent);
router.post('/stripe/create-session', createStripeSession);
router.post('/stripe/confirm', confirmStripe);
router.post('/paypal/create-order', paypalCreateOrder);
router.post('/paypal/capture-order', paypalCaptureOrder);
export default router;
