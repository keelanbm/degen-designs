'use client'

import Link from 'next/link'
// import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function Navbar() {
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
                Browse
              </Link>
              <Link 
                href="/flows" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Flows
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search dapps..." 
                className="border-0 bg-transparent text-sm focus:outline-none"
              />
            </div>
            
            {/* Temporarily disabled Clerk components */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button size="sm">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}