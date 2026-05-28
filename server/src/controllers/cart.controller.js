import prisma from '../config/prisma.js';

const cartInclude = {
  variant: { include: { product: { include: { brand: true, images: true } } } },
};

export const getCart = async (req, res, next) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: cartInclude,
      orderBy: { id: 'asc' },
    });
    res.json(items);
  } catch (err) { next(err); }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productVariantId, quantity = 1 } = req.body;
    if (!productVariantId) return res.status(400).json({ message: 'productVariantId is required' });

    const variant = await prisma.productVariant.findUnique({ where: { id: Number(productVariantId) } });
    if (!variant) return res.status(404).json({ message: 'Variant not found' });

    const existing = await prisma.cartItem.findFirst({
      where: { userId: req.user.id, productVariantId: Number(productVariantId) },
    });

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + Number(quantity) },
        include: cartInclude,
      });
    } else {
      item = await prisma.cartItem.create({
        data: { userId: req.user.id, productVariantId: Number(productVariantId), quantity: Number(quantity) },
        include: cartInclude,
      });
    }
    res.status(201).json(item);
  } catch (err) { next(err); }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const item = await prisma.cartItem.findFirst({
      where: { id: Number(req.params.itemId), userId: req.user.id },
    });
    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    if (Number(quantity) <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
      return res.json({ message: 'Item removed' });
    }
    const updated = await prisma.cartItem.update({
      where: { id: item.id }, data: { quantity: Number(quantity) }, include: cartInclude,
    });
    res.json(updated);
  } catch (err) { next(err); }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const item = await prisma.cartItem.findFirst({
      where: { id: Number(req.params.itemId), userId: req.user.id },
    });
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    await prisma.cartItem.delete({ where: { id: item.id } });
    res.json({ message: 'Item removed' });
  } catch (err) { next(err); }
};
