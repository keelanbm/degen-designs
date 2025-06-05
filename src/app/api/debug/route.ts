import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Log environment variables (masked)
    console.log('Debug endpoint called')
    console.log('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) + '...' : 'missing',
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })

    // Try to connect to the database
    try {
      const result = await prisma.$queryRaw`SELECT 1 as check`
      console.log('Database query succeeded:', result)
      
      // Try to count dapps
      const dappCount = await prisma.dapp.count()
      console.log('Dapp count:', dappCount)
      
      // Try to get first dapp
      const firstDapp = await prisma.dapp.findFirst({
        select: {
          id: true,
          name: true,
          slug: true
        }
      })

      return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          dappCount,
          sampleDapp: firstDapp
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
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasDbUrl: !!process.env.DATABASE_URL,
          dbUrlStart: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + '...' : 'missing'
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