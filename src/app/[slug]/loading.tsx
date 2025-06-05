import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      {/* Images grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] relative">
            <Skeleton className="absolute inset-0 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
} 