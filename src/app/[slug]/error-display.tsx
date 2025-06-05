'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ErrorDisplayProps {
  error: Error
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Error: {error.message}</p>
        <div className="flex justify-center gap-4 mt-6">
          <Button onClick={() => window.location.reload()}>
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 