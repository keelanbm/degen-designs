import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export default async function UserManagementPage() {
  const users = await getUsers()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>
            View and manage user accounts in the system.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Premium</th>
                    <th className="text-left p-3 font-medium">Images Viewed</th>
                    <th className="text-left p-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-medium">{user.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.clerkId}
                        </div>
                      </td>
                      <td className="p-3">
                        {user.isPremium ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" /> Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            <X className="h-3 w-3 mr-1" /> Free
                          </span>
                        )}
                      </td>
                      <td className="p-3">{user.viewedImages}</td>
                      <td className="p-3 whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No users found in the system.
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-8 text-sm text-muted-foreground">
        <p>
          Note: User accounts are created automatically when users sign in via Clerk.
          Premium status is updated when users subscribe via Stripe.
        </p>
      </div>
    </div>
  )
} 