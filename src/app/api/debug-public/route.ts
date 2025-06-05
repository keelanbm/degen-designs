import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Make this endpoint publicly accessible without authentication
// Don't use edge runtime as it doesn't support Prisma
// export const runtime = 'edge'

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
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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

    // Try to connect to the database
    try {
      const result = await prisma.$queryRaw`SELECT 1 as check`
      console.log('Database query succeeded:', result)
      
      // Try to get version info for additional validation
      const versionResult = await prisma.$queryRaw`SELECT version() as version`
      console.log('Database version check succeeded')
      
      // Try to count tables as a more thorough check
      const { count } = await prisma.$queryRaw`
        SELECT count(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      ` as { count: BigInt }
      
      return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          tables: Number(count),
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
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      })
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      
      return NextResponse.json({
        status: 'database_error',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
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
          hasDbUrl: !!process.env.DATABASE_URL
        },
        troubleshooting: {
          passwordEncoded: dbUrl.includes('%'),
          tips: [
            "Ensure your database password is URL-encoded (e.g., @ becomes %40)",
            "Check that your database server accepts connections from Vercel",
            "Verify the database server is running and accessible",
            "If using Supabase, use the connection pooling URL"
          ]
        }
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Debug endpoint error:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 