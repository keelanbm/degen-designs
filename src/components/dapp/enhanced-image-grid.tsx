'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { ImageFilter } from './image-filter'
import { Button } from '@/components/ui/button'
import { ExternalLink, Filter } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ImageData {
  id: string
  url: string
  title: string | null
  description: string | null
  category: string | null
  flow: string | null
  uiElement: string | null
  version: string | null
  tags: string[]
  createdAt: string
  isPremium: boolean
}

interface EnhancedImageGridProps {
  images: ImageData[]
}

export function EnhancedImageGrid({ images }: EnhancedImageGridProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [filteredImages, setFilteredImages] = useState<ImageData[]>(images)
  
  const handleImageError = (imageId: string, url: string) => {
    console.error(`Failed to load image: ${url}`)
    setFailedImages(prev => new Set(prev).add(imageId))
  }
  
  const handleFilterChange = (newFilteredImages: ImageData[]) => {
    setFilteredImages(newFilteredImages)
  }
  
  // Map enum values to readable labels
  const getFlowLabel = (flow: string | null) => {
    if (!flow) return null
    
    const flowMap: Record<string, string> = {
      'ONBOARDING': 'Onboarding',
      'TRADING': 'Trading',
      'MINTING': 'Minting',
      'PROFILE': 'Profile',
      'SETTINGS': 'Settings',
      'SWAP': 'Swap',
      'SEND': 'Send',
      'RECEIVE': 'Receive',
      'OTHER': 'Other'
    }
    
    return flowMap[flow] || flow
  }
  
  const getElementLabel = (element: string | null) => {
    if (!element) return null
    
    const elementMap: Record<string, string> = {
      'TABLE': 'Table',
      'DIALOG': 'Dialog',
      'CARD': 'Card',
      'FORM': 'Form',
      'CHART': 'Chart',
      'MODAL': 'Modal',
      'NAVIGATION': 'Navigation',
      'BUTTON': 'Button',
      'INPUT': 'Input',
      'OTHER': 'Other'
    }
    
    return elementMap[element] || element
  }
  
  const getCategoryLabel = (category: string | null) => {
    if (!category) return null
    
    const categoryMap: Record<string, string> = {
      'LENDING': 'Lending',
      'EXCHANGE': 'Exchange',
      'MARKETPLACE': 'Marketplace',
      'WALLET': 'Wallet',
      'ANALYTICS': 'Analytics',
      'GOVERNANCE': 'Governance',
      'LAUNCHPAD': 'Launchpad',
      'BRIDGE': 'Bridge',
      'OTHER': 'Other'
    }
    
    return categoryMap[category] || category
  }
  
  if (images.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No images available.</p>
      </div>
    )
  }
  
  return (
    <div>
      <ImageFilter images={images} onFilter={handleFilterChange} />
      
      {filteredImages.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">No images match the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group overflow-hidden rounded-lg border bg-card hover:shadow-md transition-shadow"
            >
              {!failedImages.has(image.id) ? (
                <div className="aspect-[3/4] relative bg-muted">
                  <Image
                    src={image.url}
                    alt={image.title || 'Dapp Screenshot'}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                    loading="lazy"
                    onError={() => handleImageError(image.id, image.url)}
                    unoptimized={image.url.startsWith('/')}
                  />
                  
                  {image.isPremium && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">Premium</Badge>
                    </div>
                  )}
                  
                  {/* Metadata overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">
                        {image.title || 'Untitled'}
                      </h3>
                      
                      {image.description && (
                        <p className="text-xs opacity-80 line-clamp-2 mb-2">
                          {image.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {image.flow && (
                          <Badge variant="secondary" className="text-xs">
                            {getFlowLabel(image.flow)}
                          </Badge>
                        )}
                        
                        {image.uiElement && (
                          <Badge variant="outline" className="text-xs text-white border-white/50">
                            {getElementLabel(image.uiElement)}
                          </Badge>
                        )}
                      </div>
                      
                      {image.version && (
                        <p className="text-xs opacity-80 mt-1">
                          v{image.version}
                        </p>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 h-7 text-xs border-white/50 text-white hover:bg-white/20 hover:text-white"
                        asChild
                      >
                        <a href={image.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" /> View Full Size
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full aspect-[3/4] flex items-center justify-center text-gray-400 bg-muted">
                  <div className="text-center p-4">
                    <p className="text-sm mb-1">Image unavailable</p>
                    <p className="text-xs opacity-60 break-all">{image.url}</p>
                  </div>
                </div>
              )}
              
              {/* Image metadata below the image */}
              <div className="p-4">
                <h3 className="font-medium line-clamp-1 mb-1">{image.title || 'Untitled'}</h3>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {image.category && (
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(image.category)}
                    </Badge>
                  )}
                  
                  {image.flow && (
                    <Badge variant="outline" className="text-xs">
                      {getFlowLabel(image.flow)}
                    </Badge>
                  )}
                </div>
                
                {image.tags && image.tags.length > 0 && (
                  <div className="mt-2">
                    {image.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="mr-1 mb-1 text-xs bg-muted hover:bg-muted">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mt-2">
                  {formatDate(image.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 