import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Prisma } from '@prisma/client'
import { Suspense } from 'react'
import ErrorRetry from '@/components/ErrorRetry'
import { Badge } from '@/components/ui/badge'
import { FilterSidebar } from '@/components/dapp/filter-sidebar'
import { MobileFilterDrawer } from '@/components/dapp/mobile-filter-drawer'
import { ActiveFilters } from '@/components/dapp/active-filters'
import { DappType, DappCategory } from '@prisma/client'

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

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Web3 Design
            <span className="text-primary"> Archive</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover the best UI/UX designs from leading Web3 dapps. Browse curated flows, 
            download high-quality screens, and get inspired for your next project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Browse Designs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              View Flows
            </Button>
          </div>
        </section>

        {/* Dapps Section with Filters */}
        <section className="py-16 border-t">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">
              Dapps {dapps.length > 0 && `(${dapps.length})`}
            </h2>
            
            {/* Mobile Filter Drawer */}
            <MobileFilterDrawer filtersCount={filtersCount} />
          </div>
          
          {/* Active Filters Display */}
          <ActiveFilters className="mb-6" />
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters (Desktop) */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <FilterSidebar />
            </div>
            
            {/* Dapps Grid */}
            <div className="flex-1">
              {dapps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dapps.map((dapp) => (
                    <Link
                      key={dapp.id}
                      href={`/${dapp.slug}`}
                      className="group overflow-hidden rounded-lg border bg-card hover:shadow-md transition-shadow p-6"
                    >
                      <h3 className="font-semibold mb-2">{dapp.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {dapp.description || "Explore this dapp's design"}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{dapp._count.images} screens</span>
                        <div className="flex gap-2">
                          {dapp.type && (
                            <Badge variant="secondary" className="text-xs">
                              {dapp.type}
                            </Badge>
                          )}
                          {dapp.category && (
                            <Badge variant="outline" className="text-xs">
                              {dapp.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-card p-8">
                  <p className="text-muted-foreground mb-2">No dapps match your filters.</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try adjusting your filter criteria or clearing all filters.
                  </p>
                  <Link href="/">
                    <Button variant="outline">Clear All Filters</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    )
  } catch (error) {
    return <ErrorRetry message="We're having trouble connecting to our database. Please try again in a few moments." />
  }
}