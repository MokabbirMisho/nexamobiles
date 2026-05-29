import prisma from '../config/prisma.js';
import { stripe, createPayPalOrder, capturePayPalOrder } from '../services/payment.service.js';
import { markOrderPaid } from './order.controller.js';

const loadOwnedOrder = async (orderId, user) => {
  const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });
  if (!order || order.userId !== user.id) return null;
  return order;
};

// POST /api/payments/stripe/create-session  { orderId }
export const createStripeSession = async (req, res, next) => {
  try {
    if (!stripe) return res.status(503).json({ message: 'Stripe not configured' });
    const order = await loadOwnedOrder(req.body.orderId, req.user);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: `NexaMobiles Order #${order.id}` },
          unit_amount: Math.round(Number(order.totalAmount) * 100),
        },
        quantity: 1,
      }],
      success_url: `${process.env.CLIENT_URL}/orders/${order.id}?paid=1`,
      cancel_url: `${process.env.CLIENT_URL}/checkout?canceled=1`,
      metadata: { orderId: String(order.id) },
    });
    res.json({ url: session.url, sessionId: session.id });
  } catch (err) { next(err); }
};

// POST /api/payments/stripe/create-intent  { orderId }  -> for embedded Stripe Elements card form
export const createStripeIntent = async (req, res, next) => {
  try {
    if (!stripe) return res.status(503).json({ message: 'Stripe not configured' });
    const order = await loadOwnedOrder(req.body.orderId, req.user);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalAmount) * 100),
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: String(order.id) },
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) { next(err); }
};

// POST /api/payments/stripe/confirm-intent  { orderId, paymentIntentId }
export const confirmStripeIntent = async (req, res, next) => {
  try {
    if (!stripe) return res.status(503).json({ message: 'Stripe not configured' });
    const { orderId, paymentIntentId } = req.body;
    const order = await loadOwnedOrder(orderId, req.user);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded')
      return res.status(400).json({ message: 'Payment not completed' });

    const updated = await markOrderPaid(order.id, 'stripe', intent.id, order.totalAmount);
    res.json(updated);
  } catch (err) { next(err); }
};

// POST /api/payments/stripe/confirm  { orderId, sessionId }  (Checkout-session fallback)
export const confirmStripe = async (req, res, next) => {
  try {
    if (!stripe) return res.status(503).json({ message: 'Stripe not configured' });
    const { orderId, sessionId } = req.body;
    const order = await loadOwnedOrder(orderId, req.user);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid')
      return res.status(400).json({ message: 'Payment not completed' });

    const updated = await markOrderPaid(order.id, 'stripe', session.payment_intent, order.totalAmount);
    res.json(updated);
  } catch (err) { next(err); }
};

// POST /api/payments/mock/confirm  { orderId }
// Demo payment: completes an order without a real gateway. Only allowed while
// Stripe is not configured (i.e. the visual MockCardForm is in use).
export const confirmMockPayment = async (req, res, next) => {
  try {
    if (stripe)
      return res.status(400).json({ message: 'Real payments are enabled; use the card form.' });
    const order = await loadOwnedOrder(req.body.orderId, req.user);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentStatus === 'PAID')
      return res.status(400).json({ message: 'Order already paid' });

    const updated = await markOrderPaid(order.id, 'mock', `demo-${order.id}`, order.totalAmount);
    res.json(updated);
  } catch (err) { next(err); }
};

// POST /api/payments/paypal/create-order  { orderId }
export const paypalCreateOrder = async (req, res, next) => {
  try {
    const order = await loadOwnedOrder(req.body.orderId, req.user);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const ppOrder = await createPayPalOrder(order.totalAmount);
    res.json(ppOrder);
  } catch (err) { next(err); }
};

// POST /api/payments/paypal/capture-order  { orderId, paypalOrderId }
export const paypalCaptureOrder = async (req, res, next) => {
  try {
    const { orderId, paypalOrderId } = req.body;
    const order = await loadOwnedOrder(orderId, req.user);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const capture = await capturePayPalOrder(paypalOrderId);
    if (capture.status !== 'COMPLETED')
      return res.status(400).json({ message: 'PayPal payment not completed', capture });

    const updated = await markOrderPaid(order.id, 'paypal', capture.id, order.totalAmount);
    res.json(updated);
  } catch (err) { next(err); }
};
