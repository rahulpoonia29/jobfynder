// src/prisma/prismaClient.js
import { PrismaClient } from "@prisma/client";

// Create a Prisma Client instance
const prisma = new PrismaClient();

// Handle graceful shutdown (disconnect Prisma on app termination)
async function shutdownPrisma() {
	await prisma.$disconnect();
}

export default { prisma, shutdownPrisma };
