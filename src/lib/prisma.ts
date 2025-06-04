import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

// Connection retry settings
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

// Singleton function for creating Prisma client with retry mechanism
function createPrismaClient() {
  // Log database connection attempt
  const dbUrl = process.env.DATABASE_URL
  const isDevMode = process.env.NODE_ENV === 'development'
  
  console.log('Initializing Prisma client with', {
    env: process.env.NODE_ENV,
    hasDbUrl: !!dbUrl,
    dbType: dbUrl?.split('://')[0] || 'unknown'
  })
  
  const client = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl
      }
    },
    log: isDevMode ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })

  // Add middleware for connection error handling
  client.$use(async (params, next) => {
    let retries = 0
    
    while (retries < MAX_RETRIES) {
      try {
        return await next(params)
      } catch (error) {
        // Only retry on connection errors
        if (error instanceof Error && 
           (error.message.includes('connection') || 
            error.message.includes('timeout') ||
            error.name === 'PrismaClientInitializationError')) {
          
          retries++
          console.warn(`Database operation failed (attempt ${retries}/${MAX_RETRIES}):`, 
            error.name, error.message?.substring(0, 150))
          
          if (retries < MAX_RETRIES) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * retries))
            continue
          }
        }
        
        // Not a connection error or max retries reached
        throw error
      }
    }
  })

  // Test the connection
  if (isDevMode) {
    client.$connect()
      .then(() => console.log('Database connection established'))
      .catch(err => console.error('Failed to connect to database:', err.message))
  }

  return client
}

// Use global variable in development to prevent multiple instances
export const prisma = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// Function to get a fresh client for API routes that need it
export function getPrismaClient() {
  return prisma
}

// Graceful shutdown
async function disconnect() {
  await prisma.$disconnect()
}

process.on('beforeExit', disconnect)
process.on('SIGINT', disconnect)
process.on('SIGTERM', disconnect)

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message)
    this.name = 'DatabaseError'
  }
}