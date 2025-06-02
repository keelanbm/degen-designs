import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { ExternalLink, Globe } from 'lucide-react'

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface DappPageProps {
  params: Promise<{
    slug: string
  }>
}

interface ImageData {
  id: string
  url: string
  title: string | null
  category: string | null
  version: string | null
}

interface DappData {
  id: string
  name: string
  slug: string
  description: string | null
  category: string | null
  website: string | null
  images: ImageData[]
}

export default async function DappPage({ params }: DappPageProps) {
  const { slug } = await params
  let dapp: DappData | null = null
  
  try {
    dapp = await prisma.dapp.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
        }
      }
    })
  } catch (error) {
    console.error('Database error:', error)
    // Don't call notFound() immediately, let it fall through
  }

  if (!dapp) {
    notFound()
  }

  // Group images by category
  const imagesByCategory = dapp.images.reduce((acc, image) => {
    const category = image.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(image)
    return acc
  }, {} as Record<string, ImageData[]>)

  const categories = Object.keys(imagesByCategory)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dapp Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold">{dapp.name}</h1>
          {dapp.category && (
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              {dapp.category}
            </span>
          )}
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
      <div className="space-y-8">
        {categories.length > 1 ? (
          // Multiple categories - show sections
          categories.map((category) => (
            <section key={category}>
              <h2 className="text-2xl font-semibold mb-4">
                {category} ({imagesByCategory[category].length})
              </h2>
              <SimpleImageGrid images={imagesByCategory[category]} />
            </section>
          ))
        ) : (
          // Single category - show all images
          <SimpleImageGrid images={dapp.images} />
        )}
      </div>
    </div>
  )
}

function SimpleImageGrid({ images }: { images: ImageData[] }) {
  if (images.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No images available.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image) => (
        <div
          key={image.id}
          className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-md transition-shadow"
        >
          <div className="aspect-[3/4] relative">
            <Image
              src={image.url}
              alt={image.title || 'Dapp Screenshot'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            {/* Overlay with image info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-medium text-sm mb-1">
                  {image.title || 'Untitled'}
                </h3>
                <p className="text-xs opacity-80">
                  {image.category || 'General'}
                </p>
                {image.version && (
                  <p className="text-xs opacity-80 mt-1">
                    {image.version}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Disable static generation for metadata too
export async function generateMetadata({ params }: DappPageProps) {
  return {
    title: 'DappArchive'
  }
}