'use client'

import Image from 'next/image'

interface ImageData {
  id: string
  url: string
  title: string | null
  category: string | null
  version: string | null
}

export function SimpleImageGrid({ images }: { images: ImageData[] }) {
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
          <div className="aspect-[3/4] relative bg-muted">
            <Image
              src={image.url}
              alt={image.title || 'Dapp Screenshot'}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={false}
              loading="lazy"
            />
            {/* Overlay with image info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-medium text-sm mb-1 line-clamp-2">
                  {image.title || 'Untitled'}
                </h3>
                <p className="text-xs opacity-80 line-clamp-1">
                  {image.category || 'General'}
                </p>
                {image.version && (
                  <p className="text-xs opacity-80 mt-1">
                    v{image.version}
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