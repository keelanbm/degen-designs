import { redirect } from 'next/navigation'
import { currentUser, auth } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Set this to your admin email
const ADMIN_EMAIL = 'keelan.miskell@gmail.com'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  try {
    // Use auth() instead of destructuring directly
    const session = auth()
    const user = await currentUser()
    
    // If not logged in, redirect to home page
    if (!session?.userId) {
      redirect('/')
    }
    
    // We'll check the user's email on the client side in the layout
    // This is just a fallback security measure
    if (user && user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
      redirect('/')
    }
  } catch (error) {
    // If Clerk throws an error (e.g., not configured), redirect to home
    console.error("Auth error:", error)
    redirect('/')
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-3">Image Management</h2>
          <p className="text-muted-foreground mb-4">
            Upload, edit, and manage images for dapps in the archive.
          </p>
          <div className="flex flex-col space-y-2">
            <Link href="/admin/upload">
              <Button className="w-full">
                Upload Images
              </Button>
            </Link>
            <Link href="/admin/images">
              <Button variant="outline" className="w-full">
                View All Images
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-3">Dapp Management</h2>
          <p className="text-muted-foreground mb-4">
            Add, edit, and manage dapps in the archive.
          </p>
          <Link href="/admin/dapps">
            <Button>
              Manage Dapps
            </Button>
          </Link>
        </div>
        
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-3">User Management</h2>
          <p className="text-muted-foreground mb-4">
            View and manage user accounts.
          </p>
          <Link href="/admin/users">
            <Button>
              Manage Users
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 