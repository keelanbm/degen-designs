import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const dbUrl = process.env.NODE_ENV === 'production'
    ? process.env.DATABASE_URL
    : process.env.DIRECT_URL

  if (!dbUrl) {
    throw new Error('Database URL is not configured. Please check your environment variables.')
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl
      }
    },
    log: ['error', 'warn'],
    errorFormat: 'pretty',
  }).$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        try {
          let attempts = 0
          const maxAttempts = 3
          
          while (attempts < maxAttempts) {
            try {
              return await query(args)
            } catch (error) {
              attempts++
              if (attempts === maxAttempts || !isRetryableError(error)) {
                throw error
              }
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100))
            }
          }
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

function isRetryableError(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return message.includes('connection') ||
           message.includes('timeout') ||
           message.includes('prepared statement') ||
           message.includes('pool') ||
           message.includes('deadlock')
  }
  return false
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