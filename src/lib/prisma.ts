import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const dbUrl = process.env.NODE_ENV === 'production'
    ? process.env.DATABASE_URL
    : process.env.DIRECT_URL

  if (!dbUrl) {
    throw new Error('Database URL is not configured. Please check your environment variables.')
  }

  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: dbUrl
      }
    },
    errorFormat: 'pretty',
  }).$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        try {
          const result = await query(args)
          return result
        } catch (error) {
          console.error(`Database operation failed: ${model}.${operation}`, {
            error: error instanceof Error ? error.message : String(error),
            model,
            operation,
          })
          throw error
        }
      },
    },
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export { prisma }

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message)
    this.name = 'DatabaseError'
  }
}