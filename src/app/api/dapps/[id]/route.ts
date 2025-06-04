import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { STORAGE_BUCKETS } from '@/lib/supabase'

// Set this to your admin email
const ADMIN_EMAIL = 'keelan.miskell@gmail.com'

// DELETE /api/dapps/[id] - Delete a dapp
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const clerkUser = await fetch('https://api.clerk.dev/v1/users/' + userId, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    }).then(res => res.json())
    
    if (!clerkUser || !clerkUser.email_addresses || 
        !clerkUser.email_addresses.find((email: any) => 
          email.email_address === ADMIN_EMAIL && email.verification.status === 'verified'
        )) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }
    
    const { id } = params
    
    // First get the dapp to check if it exists
    const dapp = await prisma.dapp.findUnique({
      where: { id },
      include: {
        images: true,
      },
    })
    
    if (!dapp) {
      return NextResponse.json({ error: 'Dapp not found' }, { status: 404 })
    }
    
    // If the dapp has images, delete them from storage
    if (dapp.images.length > 0) {
      try {
        // Group paths by dapp ID prefix for batch deletion
        const filePaths = dapp.images.map(image => {
          // Extract the path from the URL
          // URL format is like: https://xxx.supabase.co/storage/v1/object/public/images/dappId/filename.jpg
          const urlParts = image.url.split('/images/')
          if (urlParts.length < 2) {
            console.error('Invalid image URL format:', image.url)
            return null
          }
          return `${dapp.id}/${urlParts[1].split('/').pop()}`
        }).filter(Boolean) as string[]
        
        // Delete from Supabase storage in batches of 100 (API limit)
        if (filePaths.length > 0) {
          for (let i = 0; i < filePaths.length; i += 100) {
            const batch = filePaths.slice(i, i + 100)
            const { error } = await supabase.storage
              .from(STORAGE_BUCKETS.IMAGES)
              .remove(batch)
            
            if (error) {
              console.error('Error deleting files from Supabase:', error)
              // Continue with deletion even if storage deletion partially fails
            }
          }
        }
      } catch (storageError) {
        console.error('Error during Supabase storage deletion:', storageError)
        // Continue with DB deletion even if storage deletion fails
      }
    }
    
    // Delete the dapp (cascade will delete related images)
    await prisma.dapp.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true, message: 'Dapp deleted successfully' })
  } catch (error) {
    console.error('Error deleting dapp:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 