'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

// Set this to your admin email
const ADMIN_EMAIL = 'keelan.miskell@gmail.com'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  
  useEffect(() => {
    // Wait until user data is loaded
    if (!isLoaded) return
    
    // If not logged in or not admin, redirect to home
    if (!user || user.primaryEmailAddress?.emailAddress !== ADMIN_EMAIL) {
      console.log('Not authorized, redirecting to home')
      router.push('/')
    }
  }, [user, isLoaded, router])
  
  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse">Loading authentication...</div>
      </div>
    )
  }
  
  // If not admin, show unauthorized message (will redirect in useEffect)
  if (!user || user.primaryEmailAddress?.emailAddress !== ADMIN_EMAIL) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-red-500">Access Denied</h2>
            <p className="mt-2">You don&apos;t have permission to access this area.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Admin UI
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="bg-background border-b p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Logged in as {user.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}

// Add this line to force dynamic rendering for all admin pages
export const dynamic = 'force-dynamic' 