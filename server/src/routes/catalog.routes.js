import { Router } from 'express';
import { listBrands, listCategories } from '../controllers/catalog.controller.js';

const brands = Router();
brands.get('/', listBrands);
const categories = Router();
categories.get('/', listCategories);
export { brands, categories };
