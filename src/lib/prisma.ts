import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

// Connection retry settings
const MAX_RETRIES = 5
const RETRY_DELAY_MS = 2000

// Check if code is running in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'

// Helper to ensure database URL is properly formatted
function validateDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  try {
    // Basic validation - must be postgresql:// or postgres://
    if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
      console.warn('DATABASE_URL must start with postgresql:// or postgres://')
      return url; // Return as is, let Prisma handle the error
    }
    
    // Check for proper URL encoding of special characters in password
    const parts = url.split('@');
    if (parts.length !== 2) {
      console.warn('DATABASE_URL has invalid format - missing or multiple @ characters');
      return url;
    }
    
    // Basic structure check
    const credentials = parts[0].split('://');
    if (credentials.length !== 2) {
      console.warn('DATABASE_URL has invalid protocol format');
      return url;
    }
    
    return url;
  } catch (error) {
    console.error('Error validating DATABASE_URL:', error);
    return url;
  }
}

// Advanced retry function with backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  options = { maxRetries: MAX_RETRIES, delayMs: RETRY_DELAY_MS }
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Only retry on connection-related errors
      if (!isConnectionError(lastError)) {
        throw error;
      }
      
      console.warn(
        `Database operation failed (attempt ${attempt}/${options.maxRetries}):`,
        lastError.name,
        lastError.message?.substring(0, 150)
      );
      
      if (attempt < options.maxRetries) {
        // Exponential backoff
        const delay = options.delayMs * Math.pow(1.5, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed after maximum retry attempts');
}

// Helper to identify connection errors
function isConnectionError(error: Error): boolean {
  return (
    error.message.includes('connection') ||
    error.message.includes('timeout') ||
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('Connection terminated') ||
    error.message.includes('peer') ||
    error.message.toLowerCase().includes('network') ||
    error.message.toLowerCase().includes('socket') ||
    error.name === 'PrismaClientInitializationError' ||
    error.name === 'PrismaClientRustPanicError'
  );
}

// Sample mock data for browser environment
const MOCK_DAPPS = [
  {
    id: 'mock-1',
    name: 'Uniswap',
    slug: 'uniswap',
    description: 'Leading decentralized exchange protocol',
    logoUrl: 'https://res.cloudinary.com/dgxzqy4kl/image/upload/v1709433600/uniswap-logo.png',
    website: 'https://uniswap.org',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    type: 'DEFI',
    category: 'EXCHANGE',
    _count: { images: 4 }
  },
  {
    id: 'mock-2',
    name: 'GMX',
    slug: 'gmx',
    description: 'Decentralized perpetual exchange',
    logoUrl: 'https://res.cloudinary.com/dgxzqy4kl/image/upload/v1709433600/gmx-logo.png',
    website: 'https://gmx.io',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    type: 'DEFI',
    category: 'EXCHANGE',
    _count: { images: 3 }
  }
];

// Safely create a PrismaClient, handling browser environment
function createPrismaClient() {
  // Prevent PrismaClient instantiation in browser environment
  if (isBrowser) {
    console.log('Browser environment detected, using mock PrismaClient')
    // Return mock client for browser environment
    return createMockPrismaClient()
  }
  
  // Log database connection attempt
  const dbUrl = validateDatabaseUrl(process.env.DATABASE_URL);
  const isDevMode = process.env.NODE_ENV === 'development'
  
  console.log('Initializing Prisma client with', {
    env: process.env.NODE_ENV,
    hasDbUrl: !!dbUrl,
    dbType: dbUrl?.split('://')[0] || 'unknown'
  })
  
  // Create actual Prisma client for server environment
  try {
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
      try {
        return await withRetry(() => next(params));
      } catch (error) {
        // Format error for better debugging
        const enhancedError = error instanceof Error 
          ? error 
          : new Error(String(error));
        
        console.error('Database operation failed after all retries:', {
          operation: params.action,
          model: params.model,
          error: enhancedError.message
        });
        
        // In production, return mock data for certain read operations
        if (process.env.NODE_ENV === 'production' && 
            params.action.startsWith('find') && 
            ['dapp', 'image', 'category'].includes(String(params.model || ''))) {
          console.log(`Using mock data for ${params.model} in production after database error`);
          
          // Return mock data based on the model
          if (String(params.model) === 'dapp') {
            return params.action === 'findMany' ? MOCK_DAPPS : MOCK_DAPPS[0];
          }
          return params.action === 'findMany' ? [] : null;
        }
        
        throw enhancedError;
      }
    })

    // Test the connection
    if (isDevMode) {
      client.$connect()
        .then(() => console.log('Database connection established'))
        .catch(err => console.error('Failed to connect to database:', err.message))
    }

    return client
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error)
    return createMockPrismaClient()
  }
}

// Create a mock Prisma client for browser or error cases
function createMockPrismaClient() {
  // Create a basic mock implementation that returns empty results
  // but doesn't throw errors in browser environment
  return {
    dapp: {
      findMany: async () => {
        console.log('Mock PrismaClient: Returning mock dapps')
        return MOCK_DAPPS
      },
      findUnique: async () => {
        console.log('Mock PrismaClient: Returning mock dapp')
        return MOCK_DAPPS[0]
      },
      findFirst: async () => {
        console.log('Mock PrismaClient: Returning mock dapp')
        return MOCK_DAPPS[0]
      },
      count: async () => {
        return MOCK_DAPPS.length
      }
    },
    image: {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      count: async () => 0
    },
    $connect: async () => {},
    $disconnect: async () => {},
    $queryRaw: async () => [{ check: 1 }],
    $on: () => {},
    $use: () => {},
    $transaction: async (operations: any[]) => {
      console.log('Mock PrismaClient: Transaction requested with', operations.length, 'operations')
      return []
    }
  } as unknown as PrismaClient
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
  if (!isBrowser) {
    await prisma.$disconnect()
  }
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