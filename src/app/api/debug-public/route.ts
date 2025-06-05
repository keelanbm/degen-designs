import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Make this endpoint publicly accessible without authentication
// Don't use edge runtime as it doesn't support Prisma
// export const runtime = 'edge'

// Handler to safely run database operations
async function runDatabaseCheck() {
  try {
    // Use a timeout to prevent long-hanging connections
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout after 5 seconds')), 5000);
    });

    // Try to connect to the database with a timeout
    const queryPromise = prisma.$queryRaw`SELECT 1 as check`;
    const result = await Promise.race([queryPromise, timeoutPromise]);
    
    console.log('Database query succeeded:', result)
    
    // Try to get version info for additional validation
    const versionPromise = prisma.$queryRaw`SELECT version() as version`;
    const versionResult = await Promise.race([versionPromise, timeoutPromise]);
    console.log('Database version check succeeded')
    
    // Try to count tables as a more thorough check
    const countPromise = prisma.$queryRaw`
      SELECT count(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const { count } = await Promise.race([countPromise, timeoutPromise]) as { count: BigInt };

    return {
      connected: true,
      tables: Number(count),
      error: null
    }
  } catch (dbError) {
    console.error('Database connection error:', dbError)
    return {
      connected: false,
      tables: 0,
      error: dbError instanceof Error ? dbError.message : 'Unknown database error'
    }
  }
}

export async function GET() {
  try {
    // Log environment variables (masked)
    console.log('Debug public endpoint called')
    console.log('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.split('://')[0] : 'missing',
      dbHostMasked: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'unknown format' : 'missing',
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      vercelEnv: process.env.VERCEL_ENV || 'local',
      vercelRegion: process.env.VERCEL_REGION || 'unknown'
    })

    // Validate database URL format
    const dbUrl = process.env.DATABASE_URL || ''
    let dbUrlValidation = 'Format check: '
    
    if (!dbUrl) {
      dbUrlValidation += 'MISSING'
    } else if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      dbUrlValidation += 'INVALID PROTOCOL (should start with postgresql:// or postgres://)'
    } else if (!dbUrl.includes('@')) {
      dbUrlValidation += 'INVALID FORMAT (missing @ separator)'
    } else if (!dbUrl.includes('/')) {
      dbUrlValidation += 'INVALID FORMAT (missing database name)'
    } else {
      const parts = dbUrl.split('@')
      if (parts.length !== 2) {
        dbUrlValidation += 'INVALID FORMAT (multiple @ characters)'
      } else {
        const credentials = parts[0].split('://')
        if (credentials.length !== 2 || !credentials[1].includes(':')) {
          dbUrlValidation += 'INVALID CREDENTIALS FORMAT (should be username:password)'
        } else {
          const hostParts = parts[1].split('/')
          if (hostParts.length < 2) {
            dbUrlValidation += 'INVALID HOST/DB FORMAT (should be host:port/database)'
          } else if (!hostParts[0].includes(':')) {
            dbUrlValidation += 'MISSING PORT (should be host:port)'
          } else {
            dbUrlValidation += 'VALID'
          }
        }
      }
    }

    // Skip actual database check if URL is clearly invalid
    if (dbUrlValidation !== 'Format check: VALID' && process.env.NODE_ENV === 'production') {
      console.log('Skipping database check due to invalid URL format in production')
      return NextResponse.json({
        status: 'database_config_error',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          urlValidation: dbUrlValidation,
          format: {
            protocol: dbUrl.split('://')[0] || 'missing',
            hostPort: dbUrl.split('@')[1]?.split('/')[0] || 'unknown',
            database: dbUrl.split('/').pop() || 'unknown'
          }
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasDbUrl: !!process.env.DATABASE_URL,
          vercelEnv: process.env.VERCEL_ENV || 'local',
          vercelRegion: process.env.VERCEL_REGION || 'unknown'
        },
        message: "Using fallback data mode due to database configuration issues",
        fallbackEnabled: true
      }, { status: 200 }) // Return 200 in production with fallback enabled
    }

    // Run database check in a way that's safe for browser environments
    const dbResult = await runDatabaseCheck()
    
    if (dbResult.connected) {
      return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          tables: dbResult.tables,
          urlValidation: dbUrlValidation,
          format: {
            protocol: dbUrl.split('://')[0] || 'missing',
            hostPort: dbUrl.split('@')[1]?.split('/')[0] || 'unknown',
            database: dbUrl.split('/').pop() || 'unknown'
          }
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasDbUrl: !!process.env.DATABASE_URL,
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          vercelEnv: process.env.VERCEL_ENV || 'local',
          vercelRegion: process.env.VERCEL_REGION || 'unknown'
        },
        fallbackEnabled: false
      })
    } else {
      // In production, return 200 with fallback enabled message to avoid disrupting the app
      const statusCode = process.env.NODE_ENV === 'production' ? 200 : 500;
      
      return NextResponse.json({
        status: 'database_error',
        error: dbResult.error,
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          urlValidation: dbUrlValidation,
          format: {
            protocol: dbUrl.split('://')[0] || 'missing',
            hostPort: dbUrl.split('@')[1]?.split('/')[0] || 'unknown',
            database: dbUrl.split('/').pop() || 'unknown'
          }
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasDbUrl: !!process.env.DATABASE_URL,
          vercelEnv: process.env.VERCEL_ENV || 'local',
          vercelRegion: process.env.VERCEL_REGION || 'unknown'
        },
        message: process.env.NODE_ENV === 'production' 
          ? "Using fallback data mode due to database connection issues" 
          : "Database connection failed",
        fallbackEnabled: process.env.NODE_ENV === 'production',
        troubleshooting: {
          passwordEncoded: dbUrl.includes('%'),
          tips: [
            "Ensure your database password is URL-encoded (e.g., @ becomes %40)",
            "Check that your database server accepts connections from Vercel",
            "Verify the database server is running and accessible",
            "If using Supabase, use the connection pooling URL"
          ]
        }
      }, { status: statusCode })
    }
  } catch (error) {
    console.error('Debug endpoint error:', error)
    
    // In production, return 200 with fallback enabled message to avoid disrupting the app
    const statusCode = process.env.NODE_ENV === 'production' ? 200 : 500;
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      message: process.env.NODE_ENV === 'production' 
        ? "Using fallback data mode due to server error" 
        : "Server error occurred",
      fallbackEnabled: process.env.NODE_ENV === 'production'
    }, { status: statusCode })
  }
} 