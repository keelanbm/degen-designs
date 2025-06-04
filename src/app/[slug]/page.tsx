import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ErrorDisplay } from './error-display'
import { cache } from 'react'
import DappDetailClient from '@/components/dapp/dapp-detail-client'

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

    // Serialize dates for client component
    const serializedDapp = {
      ...dapp,
      createdAt: dapp.createdAt.toISOString(),
      updatedAt: dapp.updatedAt.toISOString(),
      images: normalizedImages.map(img => ({
        ...img,
        createdAt: img.createdAt.toISOString()
      }))
    }

    return <DappDetailClient dapp={serializedDapp} />
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