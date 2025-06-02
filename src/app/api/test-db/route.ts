import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const dappCount = await prisma.dapp.count()
    const imageCount = await prisma.image.count()
    
    const dapps = await prisma.dapp.findMany({
      take: 3,
      include: {
        _count: {
          select: { images: true }
        }
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      dappCount, 
      imageCount,
      sampleDapps: dapps 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}