import prisma from '../config/prisma.js';

export const listBrands = async (req, res, next) => {
  try {
    res.json(await prisma.brand.findMany({ orderBy: { name: 'asc' } }));
  } catch (err) { next(err); }
};

export const listCategories = async (req, res, next) => {
  try {
    res.json(await prisma.category.findMany({ orderBy: { name: 'asc' } }));
  } catch (err) { next(err); }
};
