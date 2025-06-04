import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    const envCheck = {
      nodeEnv: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    }

    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      environment: envCheck
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({ 
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
      }
    }, { status: 500 })
  }
} 