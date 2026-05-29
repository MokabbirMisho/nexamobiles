import prisma from '../config/prisma.js';
import { sendOrderConfirmation } from '../services/email.service.js';

const orderInclude = {
  items: { include: { product: true, variant: true } },
  payment: true,
};

// POST /api/orders  -> creates an order from the user's cart
export const createOrder = async (req, res, next) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { variant: { include: { product: true } } },
    });
    if (cartItems.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    // stock check
    for (const ci of cartItems) {
      if (ci.variant.stock < ci.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${ci.variant.product.name}`,
        });
      }
    }

    const totalAmount = cartItems.reduce(
      (sum, ci) => sum + Number(ci.variant.product.price) * ci.quantity, 0,
    );

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          items: {
            create: cartItems.map((ci) => ({
              product: { connect: { id: ci.variant.productId } },
              variant: { connect: { id: ci.productVariantId } },
              quantity: ci.quantity,
              unitPrice: ci.variant.product.price,
            })),
          },
        },
        include: orderInclude,
      });
      // clear cart
      await tx.cartItem.deleteMany({ where: { userId: req.user.id } });
      return created;
    });

    res.status(201).json(order);
  } catch (err) { next(err); }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) { next(err); }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { ...orderInclude, user: { select: { id: true, name: true, email: true } } },
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId !== req.user.id && !req.user.isAdmin)
      return res.status(403).json({ message: 'Not allowed' });
    res.json(order);
  } catch (err) { next(err); }
};

// Admin: all orders
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { ...orderInclude, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) { next(err); }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) }, data: { status },
    });
    res.json(order);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Order not found' });
    next(err);
  }
};

// Internal helper used by payment controller after success
export const markOrderPaid = async (orderId, provider, providerPaymentId, amount) => {
  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      include: { items: { include: { product: true, variant: true } }, user: true },
    });
    await tx.payment.create({
      data: { orderId, provider, providerPaymentId, amount, status: 'SUCCEEDED' },
    });
    // decrement stock
    for (const it of updated.items) {
      await tx.productVariant.update({
        where: { id: it.productVariantId },
        data: { stock: { decrement: it.quantity } },
      });
    }
    return updated;
  });
  try { await sendOrderConfirmation(order.user, order); } catch (e) { console.error('email failed', e.message); }
  return order;
};
