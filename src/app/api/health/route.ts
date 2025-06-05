import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Health check called')
    
    // Test database connection
    const dbCheck = await prisma.$queryRaw`SELECT 1 as check`
    const isDbConnected = !!dbCheck
    
    // Check environment variables (mask sensitive values)
    const envStatus = {
      database: !!process.env.DATABASE_URL,
      dbConnectionString: process.env.DATABASE_URL ? 
        `${process.env.DATABASE_URL.split('://')[0]}://${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'xxxxx'}` : 
        'missing',
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
    }

    // Check database data
    let dappCount = 0
    let imageCount = 0
    
    try {
      dappCount = await prisma.dapp.count()
      imageCount = await prisma.image.count()
    } catch (dataError) {
      console.error('Error counting data:', dataError)
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envStatus,
      database: {
        connected: isDbConnected,
        counts: {
          dapps: dappCount,
          images: imageCount
        }
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({ 
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        dbProvider: process.env.DATABASE_URL?.split('://')[0] || 'unknown',
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
      }
    }, { status: 500 })
  }
} 