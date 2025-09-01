import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

import { z } from "zod"

// Use the global Prisma instance
import { prisma } from '@/lib/prisma'

// Validation schema for product submission
const createProductSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  tagline: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  url: z.string().url("Please enter a valid URL"),
  image: z.string().url("Please enter a valid image URL").optional(),
  images: z.array(z.string().url("Please enter valid image URLs")).optional(),
  video: z.string().url("Please enter a valid video URL").optional(),
  appStoreUrl: z.string().url("Please enter a valid App Store URL").optional(),
  playStoreUrl: z.string().url("Please enter a valid Play Store URL").optional(),
  socialLinks: z.object({
    twitter: z.string().url("Please enter a valid Twitter URL").optional()
  }).optional(),
  platforms: z.array(z.string()).min(1, "At least one platform is required").refine(
    (platforms) => platforms.every(platform => 
      ['ios', 'android', 'web', 'windows', 'mac', 'switch', 'ps5', 'xbox', 'tablet'].includes(platform.toLowerCase())
    ),
    "Invalid platform selected"
  ),
  releaseAt: z.string().optional(),
})

// GET /api/products - Fetch all products or user-specific products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : undefined

    const where = userId ? { userId } : {}

    const products = await prisma.product.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        pressKit: {
          select: {
            id: true,
            headline: true,
            updatedAt: true,
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create a new product (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = createProductSchema.parse(body)

    // Create the product
    const product = await prisma.product.create({
      data: {
        title: validatedData.title,
        tagline: validatedData.tagline,
        description: validatedData.description,
        url: validatedData.url,
        image: validatedData.image,
        images: validatedData.images || [],
        video: validatedData.video,
        platforms: validatedData.platforms,
        appStoreUrl: validatedData.appStoreUrl,
        playStoreUrl: validatedData.playStoreUrl,
        socialLinks: validatedData.socialLinks,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          }
        }
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors || [] },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
