import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { ExternalLink, Globe } from 'lucide-react'
import { ErrorDisplay } from './error-display'
import { EnhancedImageGrid } from '@/components/dapp/enhanced-image-grid'
import { cache } from 'react'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface DappPageProps {
  params: {
    slug: string
  }
}

interface ImageData {
  id: string
  url: string
  title: string | null
  description: string | null
  category: string | null
  version: string | null
  flow: string | null
  uiElement: string | null
  tags: string[]
  createdAt: Date
  isPremium: boolean
}

interface DappData {
  id: string
  name: string
  slug: string
  description: string | null
  category: string | null
  type: string | null
  website: string | null
  images: ImageData[]
}

// Cache the getDappBySlug function to prevent duplicate fetches
const getDappBySlug = cache(async (slug: string) => {
  try {
    console.log('Fetching dapp with slug:', slug)
    
    // First try a simpler query without the type/category fields
    // to avoid errors if these columns don't exist yet
    try {
      const dapp = await prisma.dapp.findUnique({
        where: { slug },
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
          images: {
            select: {
              id: true,
              url: true,
              title: true,
              description: true,
              version: true,
              isPremium: true,
              order: true,
              createdAt: true
            },
            orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
          }
        }
      })
      
      if (!dapp) return null;
      
      // Add empty type/category fields
      return {
        ...dapp,
        type: null,
        category: null,
        images: dapp.images.map(img => ({
          ...img,
          category: null,
          flow: null,
          uiElement: null,
          tags: []
        }))
      };
    } catch (error) {
      console.error('Basic dapp query failed:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to fetch dapp:', error)
    throw new Error('Failed to load dapp data. Please try again later.')
  }
})

export default async function DappPage({ params }: DappPageProps) {
  let error: Error | null = null
  
  try {
    const dapp = await getDappBySlug(params.slug)
    
    if (!dapp) {
      notFound()
    }

    // Ensure images have the required fields even if null
    const normalizedImages = dapp.images.map(image => ({
      ...image,
      tags: image.tags || [],
      flow: image.flow || null,
      uiElement: image.uiElement || null,
      category: image.category || 'General'
    }))

    // Group images by category
    const imagesByCategory: Record<string, any[]> = {}
    
    normalizedImages.forEach(image => {
      const category = image.category || 'General'
      if (!imagesByCategory[category]) {
        imagesByCategory[category] = []
      }
      imagesByCategory[category].push(image)
    })
    
    const categories = Object.keys(imagesByCategory)

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Dapp Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">{dapp.name}</h1>
            
            <div className="flex gap-2">
              {dapp.type && (
                <Badge variant="secondary">
                  {dapp.type}
                </Badge>
              )}
              
              {dapp.category && (
                <Badge variant="outline">
                  {dapp.category}
                </Badge>
              )}
            </div>
          </div>
          
          {dapp.description && (
            <p className="text-lg text-muted-foreground mb-4">{dapp.description}</p>
          )}
          
          <div className="flex items-center gap-4">
            {dapp.website && (
              <Button variant="outline" size="sm" asChild>
                <Link href={dapp.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            )}
            
            <div className="text-sm text-muted-foreground">
              {dapp.images.length} screens
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-12">
          {categories.length > 1 ? (
            // Multiple categories - show sections
            categories.map((category) => (
              <section key={category} className="space-y-4">
                <h2 className="text-2xl font-semibold">
                  {category} ({imagesByCategory[category].length})
                </h2>
                <EnhancedImageGrid images={imagesByCategory[category]} />
              </section>
            ))
          ) : (
            // Single category - show all images with filter
            <EnhancedImageGrid images={normalizedImages} />
          )}
        </div>
      </div>
    )
  } catch (e) {
    console.error('Error in DappPage:', e)
    error = e instanceof Error ? e : new Error('An unexpected error occurred')
    return <ErrorDisplay error={error} />
  }
}

export async function generateMetadata({ params }: DappPageProps) {
  try {
    const dapp = await getDappBySlug(params.slug)
    
    if (!dapp) {
      return {
        title: 'Not Found | DappArchive',
        description: 'The requested dapp could not be found.'
      }
    }

    return {
      title: `${dapp.name} | DappArchive`,
      description: dapp.description || `Explore ${dapp.name} on DappArchive`,
      openGraph: {
        title: `${dapp.name} | DappArchive`,
        description: dapp.description || `Explore ${dapp.name} on DappArchive`,
        images: dapp.images[0]?.url ? [{ url: dapp.images[0].url }] : []
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'DappArchive',
      description: 'Explore decentralized applications'
    }
  }
}