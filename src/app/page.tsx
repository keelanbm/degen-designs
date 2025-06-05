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

// Fallback data in case database connection fails
const FALLBACK_DAPPS = [
  {
    id: 'fallback-1',
    name: 'Uniswap',
    slug: 'uniswap',
    description: 'Leading decentralized exchange protocol for swapping tokens',
    logoUrl: 'https://res.cloudinary.com/dgxzqy4kl/image/upload/v1709433600/uniswap-logo.png',
    website: 'https://uniswap.org',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    type: 'DEFI',
    category: 'EXCHANGE',
    _count: { images: 4 }
  },
  {
    id: 'fallback-2',
    name: 'GMX V2',
    slug: 'gmx-v2',
    description: 'The largest Perp DEX on Arbitrum, trade with up to 100x leverage',
    logoUrl: 'https://res.cloudinary.com/dgxzqy4kl/image/upload/v1709433600/gmx-logo.png',
    website: 'https://gmx.io',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    type: 'DEFI',
    category: 'EXCHANGE',
    _count: { images: 3 }
  },
  {
    id: 'fallback-3',
    name: 'Jupiter',
    slug: 'jupiter',
    description: 'Leading decentralized exchange on Solana',
    logoUrl: 'https://res.cloudinary.com/dgxzqy4kl/image/upload/v1709433600/jupiter-logo.png',
    website: 'https://jup.ag',
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    type: 'DEFI',
    category: 'EXCHANGE',
    _count: { images: 4 }
  }
];

async function getDapps(typeFilters?: string[], categoryFilters?: string[]) {
  try {
    // Log environment info for debugging
    console.log('Database connection check:', {
      hasUrl: !!process.env.DATABASE_URL,
      env: process.env.NODE_ENV,
      endpoint: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown'
    })

    // Test database connection with detailed error handling
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('Database connection successful')
    } catch (connectionError) {
      console.error('Database connection test failed:', 
        connectionError instanceof Error ? connectionError.message : 'Unknown error')
      
      // Return fallback data in production to avoid showing error page
      if (process.env.NODE_ENV === 'production') {
        console.log('Using fallback data in production')
        return FALLBACK_DAPPS;
      }
      
      throw new Error('Database connection failed. Please check your database URL and credentials.')
    }

    // First, try to fetch dapps without filtering on type/category
    // to avoid errors if these columns don't exist yet
    try {
      console.log('Attempting to fetch dapps')
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
    } catch (queryError) {
      console.error('Basic dapp query failed:', 
        queryError instanceof Error ? {
          name: queryError.name,
          message: queryError.message.substring(0, 200),
          stack: queryError.stack?.substring(0, 200)
        } : 'Unknown error')
      
      // If first query approach fails, try a more minimal query
      console.log('Trying minimal fallback query')
      
      try {
        const simpleDapps = await prisma.dapp.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            updatedAt: true
          },
          take: 20
        })
        
        console.log('Fallback query returned:', simpleDapps.length, 'dapps')
        
        return simpleDapps.map(dapp => ({
          ...dapp,
          type: null,
          category: null,
          logoUrl: null,
          website: null,
          featured: false,
          _count: { images: 0 }
        }))
      } catch (fallbackError) {
        // Return fallback data in production to avoid showing error page
        if (process.env.NODE_ENV === 'production') {
          console.log('Using fallback data in production after query failures')
          return FALLBACK_DAPPS;
        }
        
        throw fallbackError;
      }
    }
  } catch (error: unknown) {
    console.error('Database error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.substring(0, 300) : undefined
    })
    
    // Return fallback data in production to avoid showing error page
    if (process.env.NODE_ENV === 'production') {
      console.log('Using fallback data in production after error')
      return FALLBACK_DAPPS;
    }
    
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

    // Handle empty dapps state
    if (!dapps || dapps.length === 0) {
      console.log('No dapps found, showing empty state')
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">No dapps found</h2>
          <p className="text-muted-foreground mb-6">
            The database may be empty or experiencing connectivity issues.
          </p>
          <Button asChild>
            <Link href="/api/debug-public">Check Database Status</Link>
          </Button>
        </div>
      )
    }

    // Serialize dates for client components
    const serializedDapps = dapps.map(dapp => ({
      ...dapp,
      createdAt: dapp.createdAt instanceof Date ? dapp.createdAt.toISOString() : dapp.createdAt,
      updatedAt: dapp.updatedAt instanceof Date ? dapp.updatedAt.toISOString() : dapp.updatedAt,
    }))

    return (
      <HomePageClient 
        dapps={serializedDapps} 
        filtersCount={filtersCount} 
      />
    )
  } catch (error) {
    console.error('Homepage error:', error instanceof Error ? error.message : String(error))
    return <ErrorRetry message="We're having trouble connecting to our database. Please try again in a few moments." />
  }
}