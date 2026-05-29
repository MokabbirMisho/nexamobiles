import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
const u = await prisma.user.findMany({ select: { id:true, email:true, isAdmin:true, passwordHash:true } });
for (const x of u) {
  console.log(x.id, JSON.stringify(x.email), 'admin='+x.isAdmin, 'pwmatch='+await bcrypt.compare('admin123', x.passwordHash));
}
await prisma.$disconnect();
