'use client'

import Link from 'next/link'
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Search, ShieldAlert } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

// Set this to your admin email
const ADMIN_EMAIL = 'keelan.miskell@gmail.com'

export function Navbar() {
  const { user } = useUser()
  const isAdmin = user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              DappArchive
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Home
              </Link>
              
              <Link 
                href="/explore" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Explore
              </Link>
              
              <Link 
                href="/popular" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Popular
              </Link>
              
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="text-sm font-medium text-amber-500 transition-colors hover:text-amber-600 flex items-center"
                >
                  <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-accent/50 px-3 py-1.5 hover:bg-accent transition-colors">
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-2" />
                <span className="text-sm text-muted-foreground">Search</span>
              </div>
            </div>
            
            <SignedOut>
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                
                <SignUpButton mode="modal">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            </SignedOut>
            
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  )
}