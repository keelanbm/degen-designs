'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Plus, Trash, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Dapp {
  id: string
  name: string
  slug: string
  description: string | null
  website: string | null
  featured: boolean
  createdAt: Date
  _count: {
    images: number
  }
}

function DappManagementClient({ dapps: initialDapps }: { dapps: Dapp[] }) {
  const router = useRouter()
  const [dapps, setDapps] = useState<Dapp[]>(initialDapps)
  const [deleteDappId, setDeleteDappId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const dappToDelete = dapps.find(dapp => dapp.id === deleteDappId)
  
  const handleDeleteClick = (id: string) => {
    setDeleteDappId(id)
  }
  
  const handleDeleteConfirm = async () => {
    if (!deleteDappId) return
    
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/dapps/${deleteDappId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete dapp')
      }
      
      // Remove the deleted dapp from state
      setDapps(dapps.filter(dapp => dapp.id !== deleteDappId))
      
      toast.success('Dapp deleted successfully')
    } catch (error) {
      console.error('Error deleting dapp:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsDeleting(false)
      setDeleteDappId(null)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Dapps</h1>
        
        <Link href="/admin/dapps/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add New Dapp
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dapp Directory</CardTitle>
          <CardDescription>
            Manage existing dapps or add new ones to the archive.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {dapps.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Slug</th>
                    <th className="text-left p-3 font-medium">Images</th>
                    <th className="text-left p-3 font-medium">Featured</th>
                    <th className="text-left p-3 font-medium">Created</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dapps.map((dapp) => (
                    <tr key={dapp.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-medium">{dapp.name}</div>
                        {dapp.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {dapp.description}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <Link 
                          href={`/${dapp.slug}`} 
                          className="text-blue-600 hover:underline"
                          target="_blank"
                        >
                          {dapp.slug}
                        </Link>
                      </td>
                      <td className="p-3">{dapp._count.images}</td>
                      <td className="p-3">
                        {dapp.featured ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                            Featured
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {formatDate(dapp.createdAt)}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Link href={`/admin/dapps/${dapp.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(dapp.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No dapps found. Create your first dapp to get started.
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-8 text-sm text-muted-foreground">
        <p>
          Note: To add a new dapp with images, first create the dapp here, then
          upload images using the Image Management tool.
        </p>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDappId} onOpenChange={() => !isDeleting && setDeleteDappId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dapp</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{dappToDelete?.name}</strong>?
              <br /><br />
              This action cannot be undone. This will permanently delete the dapp
              and all its associated images ({dappToDelete?._count.images || 0}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Server component
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDapps() {
  const { prisma } = await import('@/lib/prisma')
  
  try {
    const dapps = await prisma.dapp.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        website: true,
        featured: true,
        createdAt: true,
        _count: {
          select: {
            images: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return dapps
  } catch (error) {
    console.error('Error fetching dapps:', error)
    return []
  }
}

export default async function DappManagementPage() {
  const dapps = await getDapps()
  return <DappManagementClient dapps={dapps} />
} 