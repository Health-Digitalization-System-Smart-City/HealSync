// Centralized Prisma Client access.
//
// - A single PrismaClient instance is shared across the application.
// - In development, Next.js hot-reloads modules frequently; the client is
//   cached on `globalThis` to avoid exhausting the database connection pool
//   with new connections on every reload.
// - Prisma 7 requires a driver adapter; we use @prisma/adapter-pg for
//   PostgreSQL.
// - The client is created lazily on first use. This keeps `next build` and
//   static analysis working even when DATABASE_URL is not configured yet; a
//   clear error is only thrown if the client is actually used at runtime.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and configure DATABASE_URL.",
    );
  }

  const adapter = new PrismaPg(connectionString);

  return new PrismaClient({ adapter });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Lazy proxy: the Prisma Client is only constructed on first property access
 * (i.e. the first database operation). Importing this module never throws.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(getPrismaClient(), property, receiver);
  },
  has(_target, property) {
    return property in getPrismaClient();
  },
});
