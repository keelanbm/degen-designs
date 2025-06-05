'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink, Trash2, Loader2, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'

interface Dapp {
  id: string
  name: string
  slug: string
}

interface Image {
  id: string
  url: string
  title: string | null
  description: string | null
  isPremium: boolean
  createdAt: string // Changed from Date to string
  category: string | null
  dapp: Dapp
}

export default function ImageManagementClient({ 
  images: initialImages, 
  dapps 
}: { 
  images: Image[], 
  dapps: Dapp[] 
}) {
  const router = useRouter()
  const [images, setImages] = useState<Image[]>(initialImages)
  const [filteredImages, setFilteredImages] = useState<Image[]>(initialImages)
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedDapp, setSelectedDapp] = useState<string>('all')
  
  const imageToDelete = images.find(img => img.id === deleteImageId)
  
  const handleDeleteClick = (id: string) => {
    setDeleteImageId(id)
  }
  
  const handleDeleteConfirm = async () => {
    if (!deleteImageId) return
    
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/images/${deleteImageId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete image')
      }
      
      // Remove the deleted image from state
      const updatedImages = images.filter(img => img.id !== deleteImageId)
      setImages(updatedImages)
      
      // Update filtered images
      if (selectedDapp === 'all') {
        setFilteredImages(updatedImages)
      } else {
        setFilteredImages(updatedImages.filter(img => img.dapp.id === selectedDapp))
      }
      
      toast.success('Image deleted successfully')
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsDeleting(false)
      setDeleteImageId(null)
    }
  }
  
  const handleDappFilter = (dappId: string) => {
    setSelectedDapp(dappId)
    
    if (dappId === 'all') {
      setFilteredImages(images)
    } else {
      setFilteredImages(images.filter(img => img.dapp.id === dappId))
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
        <h1 className="text-3xl font-bold">Manage Images</h1>
        
        <Link href="/admin/upload">
          <Button>
            Upload New Images
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Image Gallery</CardTitle>
              <CardDescription>
                View and manage images in the archive. Showing most recent 50 images.
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedDapp}
                onValueChange={handleDappFilter}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by dapp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dapps</SelectItem>
                  {dapps.map((dapp) => (
                    <SelectItem key={dapp.id} value={dapp.id}>
                      {dapp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((image) => (
                <div key={image.id} className="border rounded-lg overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={image.url}
                      alt={image.title || 'Dapp image'}
                      fill
                      className="object-cover"
                    />
                    {image.isPremium && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">Premium</Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-1">
                      <Badge variant="outline" className="mr-1">
                        {image.dapp.name}
                      </Badge>
                      {image.category && (
                        <Badge variant="secondary" className="mr-1">
                          {image.category}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-medium truncate">
                      {image.title || 'Untitled'}
                    </h3>
                    
                    {image.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {image.description}
                      </p>
                    )}
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      Uploaded {formatDate(image.createdAt)}
                    </div>
                    
                    <div className="flex justify-between mt-4">
                      <Button size="sm" variant="outline" asChild>
                        <a href={image.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" /> View
                        </a>
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClick(image.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {images.length > 0 
                ? 'No images match the selected filter.'
                : 'No images found. Upload some images to get started.'
              }
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteImageId} onOpenChange={() => !isDeleting && setDeleteImageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image?
              {imageToDelete?.title && ` "${imageToDelete.title}"`}
              <br /><br />
              This action cannot be undone. The image will be permanently removed
              from both the database and storage.
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