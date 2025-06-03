import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'
export const runtime = 'edge'
export const preferredRegion = 'auto'

type DappWithImages = Prisma.DappGetPayload<{
  include: {
    images: {
      select: {
        id: true,
        url: true,
        title: true
      }
    }
    _count: {
      select: { images: true }
    }
  }
}>

export async function GET() {
  try {
    // Test database connection with a simple query
    const connectionTest = await prisma.$queryRaw`SELECT 1 as connected`
    console.log('Database connection test:', connectionTest)

    // Get counts with separate queries to isolate issues
    let dappCount = 0
    let imageCount = 0
    let dapps: DappWithImages[] = []

    try {
      dappCount = await prisma.dapp.count()
      console.log('Dapp count:', dappCount)
    } catch (error) {
      console.error('Error counting dapps:', error)
    }

    try {
      imageCount = await prisma.image.count()
      console.log('Image count:', imageCount)
    } catch (error) {
      console.error('Error counting images:', error)
    }

    try {
      dapps = await prisma.dapp.findMany({
        take: 3,
        include: {
          images: {
            select: {
              id: true,
              url: true,
              title: true
            }
          },
          _count: {
            select: { images: true }
          }
        }
      })
      console.log('Found dapps:', dapps.length)
    } catch (error) {
      console.error('Error fetching dapps:', error)
    }
    
    return NextResponse.json({ 
      success: true,
      connection: 'ok',
      environment: process.env.NODE_ENV,
      counts: {
        dapps: dappCount,
        images: imageCount
      },
      sampleDapps: dapps.map(d => ({
        name: d.name,
        imageCount: d._count.images,
        imageUrls: d.images.map(img => img.url)
      }))
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ 
      success: false,
      environment: process.env.NODE_ENV,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}