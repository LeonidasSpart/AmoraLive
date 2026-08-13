// Import from the generated client (custom output path)
import { PrismaClient } from './generated/prisma/client.js';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Use a singleton to avoid multiple connections in development
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
