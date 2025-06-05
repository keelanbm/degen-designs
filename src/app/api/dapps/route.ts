import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Set this to your admin email
const ADMIN_EMAIL = 'keelan.miskell@gmail.com'

// Validation schema for dapp data
const dappSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  featured: z.boolean().optional(),
  type: z.enum(['DEFI', 'NFT', 'SOCIAL', 'GAMING', 'TOOLS', 'OTHER']).optional().nullable(),
  category: z.enum(['LENDING', 'EXCHANGE', 'MARKETPLACE', 'WALLET', 'ANALYTICS', 'GOVERNANCE', 'LAUNCHPAD', 'BRIDGE', 'OTHER']).optional().nullable(),
})

// GET /api/dapps - List all dapps
export async function GET(req: NextRequest) {
  try {
    const dapps = await prisma.dapp.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            images: true,
          },
        },
      },
    })
    
    return NextResponse.json(dapps)
  } catch (error) {
    console.error('Error fetching dapps:', error)
    return NextResponse.json({ error: 'Failed to fetch dapps' }, { status: 500 })
  }
}

// POST /api/dapps - Create a new dapp
export async function POST(req: NextRequest) {
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
    
    // Parse and validate request data
    const data = await req.json()
    
    try {
      const validatedData = dappSchema.parse(data)
      
      // Check if slug already exists
      const existingDapp = await prisma.dapp.findUnique({
        where: { slug: validatedData.slug },
      })
      
      if (existingDapp) {
        return NextResponse.json(
          { error: 'A dapp with this slug already exists' },
          { status: 400 }
        )
      }
      
      // Create the dapp
      const dapp = await prisma.dapp.create({
        data: {
          name: validatedData.name,
          slug: validatedData.slug,
          description: validatedData.description,
          website: validatedData.website,
          logoUrl: validatedData.logoUrl,
          featured: validatedData.featured || false,
          type: validatedData.type,
          category: validatedData.category,
        },
      })
      
      return NextResponse.json({
        success: true,
        message: 'Dapp created successfully',
        dapp,
      })
    } catch (validationError: unknown) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json({
          error: 'Validation failed',
          details: validationError.errors,
        }, { status: 400 })
      }
      throw validationError
    }
  } catch (error) {
    console.error('Error creating dapp:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
} 