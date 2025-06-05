import { NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

export async function GET() {
  const prisma = getPrismaClient()
  
  try {
    // Test multiple database operations
    const results = {
      // Count total dapps
      totalDapps: await prisma.dapp.count(),
      
      // Get first dapp with its images
      firstDapp: await prisma.dapp.findFirst({
      include: {
          images: {
            select: {
              url: true,
              title: true
            }
        }
      }
      }),
      
      // Get all unique categories
      categories: await prisma.dapp.groupBy({
        by: ['category'],
        where: {
          category: {
            not: null
          }
        }
      }),
      
      // Get featured dapps count
      featuredCount: await prisma.dapp.count({
        where: {
          featured: true
        }
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      connection: 'ok',
      environment: process.env.NODE_ENV,
      data: results
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ 
      success: false,
      environment: process.env.NODE_ENV,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}