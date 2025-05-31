import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from './db'

export async function getCurrentUser() {
  const user = await currentUser()
  
  if (!user) return null

  // Check if user exists in our database
  let dbUser = await db.user.findUnique({
    where: { clerkId: user.id }
  })

  // Create user if doesn't exist
  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
      }
    })
  }

  return dbUser
}

export async function checkUserAccess(imageId: string) {
  const user = await getCurrentUser()
  
  if (!user) return false

  const image = await db.image.findUnique({
    where: { id: imageId }
  })

  if (!image) return false

  // If image is not premium, allow access
  if (!image.isPremium) return true

  // If user is premium, allow access
  if (user.isPremium) return true

  // If user has viewed less than 3 images, allow access and increment
  if (user.viewedImages < 3) {
    await db.user.update({
      where: { id: user.id },
      data: { viewedImages: user.viewedImages + 1 }
    })
    return true
  }

  return false
}

export async function getAuth() {
  return auth()
}