import prisma from '../config/prisma.js';
import { slugify } from '../utils/slug.js';

const productInclude = {
  brand: true,
  category: true,
  images: true,
  variants: true,
};

// GET /api/products?brand=&category=&featured=&newArrival=&search=
export const listProducts = async (req, res, next) => {
  try {
    const { brand, category, featured, newArrival, search } = req.query;
    const where = {};
    if (brand) where.brand = { slug: brand };
    if (category) where.category = { slug: category };
    if (featured === 'true') where.isFeatured = true;
    if (newArrival === 'true') where.isNewArrival = true;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const products = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: productInclude,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      name, description, price, brandId, categoryId, mainImage,
      isFeatured = false, isNewArrival = false, images = [], variants = [],
    } = req.body;

    if (!name || price == null || !brandId || !categoryId)
      return res.status(400).json({ message: 'name, price, brandId and categoryId are required' });

    const slug = `${slugify(name)}-${Date.now().toString(36)}`;
    const product = await prisma.product.create({
      data: {
        name, slug, description, price: Number(price),
        brandId: Number(brandId), categoryId: Number(categoryId),
        mainImage, isFeatured: !!isFeatured, isNewArrival: !!isNewArrival,
        images: { create: images.map((url) => ({ imageUrl: url })) },
        variants: {
          create: variants.map((v) => ({
            ram: v.ram, storage: v.storage, color: v.color,
            stock: Number(v.stock) || 0, sku: v.sku || null,
          })),
        },
      },
      include: productInclude,
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, description, price, brandId, categoryId, mainImage, isFeatured, isNewArrival } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = Number(price);
    if (brandId !== undefined) data.brandId = Number(brandId);
    if (categoryId !== undefined) data.categoryId = Number(categoryId);
    if (mainImage !== undefined) data.mainImage = mainImage;
    if (isFeatured !== undefined) data.isFeatured = !!isFeatured;
    if (isNewArrival !== undefined) data.isNewArrival = !!isNewArrival;

    const product = await prisma.product.update({ where: { id }, data, include: productInclude });
    res.json(product);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Product not found' });
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Product not found' });
    next(err);
  }
};

// PUT /api/products/variants/:variantId/stock  { stock }
export const updateVariantStock = async (req, res, next) => {
  try {
    const variant = await prisma.productVariant.update({
      where: { id: Number(req.params.variantId) },
      data: { stock: Number(req.body.stock) },
    });
    res.json(variant);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Variant not found' });
    next(err);
  }
};
