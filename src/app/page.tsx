import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Prisma } from '@prisma/client'

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

async function getDapps() {
  try {
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Database connection check:', {
      hasUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    })

    const dapps = await prisma.dapp.findMany({
      include: {
        _count: {
          select: { images: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 12
    })

    console.log('Fetched dapps:', {
      count: dapps.length,
      names: dapps.map(d => d.name)
    })

    return dapps
  } catch (error) {
    console.error('Failed to fetch dapps:', error)
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    }
    throw new Error('Failed to fetch dapps. Please try again later.')
  }
}

export default async function HomePage() {
  let dapps: DappWithCount[] = []
  let error: Error | null = null
  
  try {
    dapps = await getDapps()
  } catch (e) {
    console.error('Error in HomePage:', e)
    error = e instanceof Error ? e : new Error('An unexpected error occurred')
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Error: {error.message}</p>
          <p className="text-sm text-muted-foreground">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    )
  }

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

      {/* Dapps Section */}
      <section className="py-16 border-t">
        <h2 className="text-3xl font-bold mb-8">Recent Dapps ({dapps.length})</h2>
        
        {dapps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dapps.map((dapp) => (
              <Link
                key={dapp.id}
                href={`/${dapp.slug}`}
                className="group overflow-hidden rounded-lg border bg-card hover:shadow-md transition-shadow p-6"
              >
                <h3 className="font-semibold mb-2">{dapp.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {dapp.description || 'Explore this dapp\'s design'}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{dapp._count.images} screens</span>
                  {dapp.category && (
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                      {dapp.category}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No dapps uploaded yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Run the upload script to add some dapp designs!
            </p>
          </div>
        )}
      </section>
    </div>
  )
}