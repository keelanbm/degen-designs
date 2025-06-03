import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: ['error', 'warn']
  })
}

// Create a new client for each request to avoid prepared statement issues
export function getPrismaClient() {
  return prismaClientSingleton()
}

// For backwards compatibility and non-API routes
export const prisma = getPrismaClient()

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message)
    this.name = 'DatabaseError'
  }
}