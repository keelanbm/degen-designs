import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('Database connection successful')

    // Get counts
    const dappCount = await prisma.dapp.count()
    const imageCount = await prisma.image.count()
    
    // Get sample data
    const dapps = await prisma.dapp.findMany({
      take: 3,
      include: {
        images: true,
        _count: {
          select: { images: true }
        }
      }
    })
    
    return NextResponse.json({ 
      success: true,
      connection: 'ok',
      counts: {
        dapps: dappCount,
        images: imageCount
      },
      sampleDapps: dapps.map(d => ({
        name: d.name,
        imageCount: d._count.images,
        imageUrls: d.images.map(i => i.url)
      }))
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}