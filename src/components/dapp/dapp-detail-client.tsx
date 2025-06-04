'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EnhancedImageGrid } from '@/components/dapp/enhanced-image-grid'

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
  createdAt: string
  isPremium: boolean
  order: number
}

interface DappData {
  id: string
  name: string
  slug: string
  description: string | null
  category: string | null
  type: string | null
  website: string | null
  createdAt: string
  updatedAt: string
  featured: boolean
  logoUrl: string | null
  images: ImageData[]
}

interface DappDetailClientProps {
  dapp: DappData
}

export default function DappDetailClient({ dapp }: DappDetailClientProps) {
  // Group images by category
  const imagesByCategory: Record<string, ImageData[]> = {}
    
  dapp.images.forEach(image => {
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
          <EnhancedImageGrid images={dapp.images} />
        )}
      </div>
    </div>
  )
} 