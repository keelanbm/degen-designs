import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Prisma } from '@prisma/client'
import { Suspense } from 'react'
import ErrorRetry from '@/components/ErrorRetry'
import HomePageClient from '@/components/dapp/home-page-client'

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

type DappWithCount = Prisma.DappGetPayload<{
  include: {
    _count: {
      select: { images: true }
    }
  }
}>

interface HomePageProps {
  searchParams: {
    types?: string
    categories?: string
  }
}

async function getDapps(typeFilters?: string[], categoryFilters?: string[]) {
  try {
    // Log environment info for debugging
    console.log('Database connection check:', {
      hasUrl: !!process.env.DATABASE_URL,
      env: process.env.NODE_ENV
    })

    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('Database connection successful')

    // First, try to fetch dapps without filtering on type/category
    // to avoid errors if these columns don't exist yet
    try {
      const dapps = await prisma.dapp.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logoUrl: true,
          website: true,
          featured: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { images: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
      
      console.log('Fetched dapps count (basic query):', dapps.length)
      
      // We need to return dapps with empty type/category fields since columns might not exist
      return dapps.map(dapp => ({
        ...dapp,
        type: null,
        category: null
      }))
    } catch (error) {
      console.error('Basic query failed, falling back:', error)
      throw error;
    }
  } catch (error: unknown) {
    console.error('Database error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw new Error('Failed to fetch dapps. Database connection error.')
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  try {
    // Parse filter params but don't use them for now until schema is updated
    const typeFilters = searchParams.types?.split(',').filter(Boolean)
    const categoryFilters = searchParams.categories?.split(',').filter(Boolean)
    
    // Count active filters
    const filtersCount = (typeFilters?.length || 0) + (categoryFilters?.length || 0)
    
    // Fetch dapps without filters for now
    const dapps = await getDapps()

    // Serialize dates for client components
    const serializedDapps = dapps.map(dapp => ({
      ...dapp,
      createdAt: dapp.createdAt.toISOString(),
      updatedAt: dapp.updatedAt.toISOString(),
    }))

    return (
      <HomePageClient 
        dapps={serializedDapps} 
        filtersCount={filtersCount} 
      />
    )
  } catch (error) {
    return <ErrorRetry message="We're having trouble connecting to our database. Please try again in a few moments." />
  }
}