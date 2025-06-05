'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageWithDapp } from '@/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Lock } from 'lucide-react'
import { Paywall } from './Paywall'

interface ImageGridProps {
  images: ImageWithDapp[]
  userCanAccess: boolean
  userPremium: boolean
}

export function ImageGrid({ images, userCanAccess, userPremium }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<ImageWithDapp | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)

  const handleImageClick = (image: ImageWithDapp) => {
    if (image.isPremium && !userPremium && !userCanAccess) {
      setShowPaywall(true)
      return
    }
    setSelectedImage(image)
  }

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative cursor-pointer overflow-hidden rounded-lg border bg-card"
            onClick={() => handleImageClick(image)}
          >
            <div className="aspect-[3/4] relative">
              <Image
                src={image.url}
                alt={image.title || 'Dapp UI Screenshot'}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              
              {image.isPremium && !userPremium && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-white" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-medium text-sm mb-1">
                    {image.title || image.category || 'Untitled'}
                  </h3>
                  {image.description && (
                    <p className="text-white/80 text-xs line-clamp-2">
                      {image.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Detail Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {selectedImage && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedImage.title || selectedImage.category || 'Untitled'}
                  </h2>
                  {selectedImage.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedImage.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadImage(
                    selectedImage.url, 
                    `${selectedImage.dapp?.name || 'image'}-${selectedImage.title || selectedImage.id}.jpg`
                  )}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <div className="flex-1 relative">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.title || 'Dapp UI Screenshot'}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Paywall Modal */}
      <Paywall open={showPaywall} onOpenChange={setShowPaywall} />
    </>
  )
}