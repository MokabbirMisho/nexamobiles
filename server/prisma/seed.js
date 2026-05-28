import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

async function main() {
  console.log('Seeding NexaMobiles...');

  // --- Admin + demo customer ---
  const adminPass = await bcrypt.hash('admin123', 10);
  const custPass = await bcrypt.hash('customer123', 10);
  await prisma.user.upsert({
    where: { email: '[email protected]' },
    update: {},
    create: { name: 'Admin', email: '[email protected]', passwordHash: adminPass, isAdmin: true },
  });
  await prisma.user.upsert({
    where: { email: '[email protected]' },
    update: {},
    create: { name: 'Demo Customer', email: '[email protected]', passwordHash: custPass },
  });

  // --- Brands ---
  const brandNames = ['Apple', 'Samsung', 'Vivo', 'Oppo', 'Realme'];
  const brands = {};
  for (const name of brandNames) {
    brands[name] = await prisma.brand.upsert({
      where: { slug: slug(name) }, update: {}, create: { name, slug: slug(name) },
    });
  }

  // --- Categories ---
  const catNames = ['Smartphones', 'Accessories'];
  const cats = {};
  for (const name of catNames) {
    cats[name] = await prisma.category.upsert({
      where: { slug: slug(name) }, update: {}, create: { name, slug: slug(name) },
    });
  }

  // --- Products ---
  const products = [
    {
      name: 'iPhone 15', brand: 'Apple', category: 'Smartphones', price: 799.0,
      description: 'A total powerhouse. The iPhone 15 features the Dynamic Island, a 48MP main camera and USB-C.',
      mainImage: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800',
      isFeatured: true, isNewArrival: true,
      variants: [
        { ram: '6GB', storage: '128GB', color: 'Black', stock: 12 },
        { ram: '6GB', storage: '128GB', color: 'Blue', stock: 8 },
        { ram: '6GB', storage: '256GB', color: 'Black', stock: 5 },
      ],
    },
    {
      name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'Smartphones', price: 749.0,
      description: 'Galaxy AI is here. Brilliant 6.2" display and a pro-grade camera system.',
      mainImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
      isFeatured: true, isNewArrival: false,
      variants: [
        { ram: '8GB', storage: '128GB', color: 'Onyx Black', stock: 10 },
        { ram: '8GB', storage: '256GB', color: 'Marble Gray', stock: 6 },
      ],
    },
    {
      name: 'Vivo V30', brand: 'Vivo', category: 'Smartphones', price: 449.0,
      description: 'Studio-quality portraits with the Aura Light and a sleek slim design.',
      mainImage: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
      isFeatured: false, isNewArrival: true,
      variants: [
        { ram: '8GB', storage: '256GB', color: 'Peacock Green', stock: 9 },
        { ram: '12GB', storage: '512GB', color: 'Classic Black', stock: 4 },
      ],
    },
    {
      name: 'Oppo Reno 11', brand: 'Oppo', category: 'Smartphones', price: 399.0,
      description: 'Portrait expert with a vivid curved display and fast 67W charging.',
      mainImage: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800',
      isFeatured: true, isNewArrival: false,
      variants: [
        { ram: '8GB', storage: '256GB', color: 'Wave Green', stock: 7 },
        { ram: '12GB', storage: '256GB', color: 'Rock Grey', stock: 3 },
      ],
    },
    {
      name: 'Realme 12 Pro', brand: 'Realme', category: 'Smartphones', price: 329.0,
      description: 'Periscope portrait camera and a premium vegan-leather finish.',
      mainImage: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800',
      isFeatured: false, isNewArrival: true,
      variants: [
        { ram: '8GB', storage: '256GB', color: 'Navigator Beige', stock: 11 },
        { ram: '12GB', storage: '512GB', color: 'Submarine Blue', stock: 5 },
      ],
    },
    {
      name: 'AirPods Pro (2nd Gen)', brand: 'Apple', category: 'Accessories', price: 249.0,
      description: 'Up to 2x more Active Noise Cancellation with Adaptive Audio and USB-C.',
      mainImage: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800',
      isFeatured: true, isNewArrival: false,
      variants: [{ ram: null, storage: null, color: 'White', stock: 20 }],
    },
    {
      name: 'Samsung 25W Charger', brand: 'Samsung', category: 'Accessories', price: 29.0,
      description: 'Super Fast Charging USB-C power adapter.',
      mainImage: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800',
      isFeatured: false, isNewArrival: false,
      variants: [{ ram: null, storage: null, color: 'Black', stock: 30 }],
    },
  ];

  let sku = 1000;
  for (const p of products) {
    const created = await prisma.product.upsert({
      where: { slug: slug(p.name) },
      update: {},
      create: {
        name: p.name, slug: slug(p.name), description: p.description, price: p.price,
        brandId: brands[p.brand].id, categoryId: cats[p.category].id,
        mainImage: p.mainImage, isFeatured: p.isFeatured, isNewArrival: p.isNewArrival,
        images: { create: [{ imageUrl: p.mainImage }] },
        variants: {
          create: p.variants.map((v) => ({ ...v, sku: `NM-${sku++}` })),
        },
      },
    });
    console.log(`  + ${created.name}`);
  }

  console.log('Seed complete. Admin: [email protected] / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
