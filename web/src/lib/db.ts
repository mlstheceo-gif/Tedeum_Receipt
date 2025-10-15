import { PrismaClient } from "@prisma/client";

// Prisma Client를 싱글톤으로 유지해 개발 중 핫리로드 이슈 방지
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
