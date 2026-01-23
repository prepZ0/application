import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton
 *
 * Configured for serverless environments:
 * - Uses connection pooling via Supabase's pooler
 * - Singleton pattern to prevent too many connections
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Disconnect prisma on process termination
 */
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
