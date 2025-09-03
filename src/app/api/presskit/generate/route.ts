import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import JSZip from 'jszip'
import { writeFile } from 'fs/promises'
import path from 'path'

// POST /api/presskit/generate - Generate press kit zip file
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { gameId, headline, about, features, media } = await request.json()

    if (!gameId || !headline || !about || !features || !Array.isArray(features)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if product exists and user owns it
    const product = await prisma.product.findFirst({
      where: {
        id: gameId,
        userId: session.user.id
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    // Create press kit record
    const pressKit = await prisma.pressKit.upsert({
      where: { gameId },
      update: {
        headline,
        about,
        features,
        media: media || []
      },
      create: {
        gameId,
        headline,
        about,
        features,
        media: media || []
      }
    })

    // Generate zip file content
    const zip = new JSZip()
    
    // Add press kit text file
    const pressKitContent = `PRESS KIT

${headline}

ABOUT
${about}

FEATURES
${features.map((feature: string, index: number) => `${index + 1}. ${feature}`).join('\n')}

GAME INFORMATION
Title: ${product.title}
Description: ${product.description}
${product.tagline ? `Tagline: ${product.tagline}\n` : ''}
${product.studioName ? `Studio: ${product.studioName}\n` : ''}
${product.releaseAt ? `Release Date: ${new Date(product.releaseAt).toLocaleDateString()}\n` : ''}

CONTACT
For press inquiries, please contact the development team.

Generated on: ${new Date().toLocaleDateString()}
`
    
    zip.file('press-kit.txt', pressKitContent)
    
    // Add media files if provided
    if (media && Array.isArray(media) && media.length > 0) {
      const mediaFolder = zip.folder('media')
      media.forEach((url: string, index: number) => {
        mediaFolder?.file(`media-${index + 1}.txt`, `Media file ${index + 1}: ${url}`)
      })
    }

    // Generate zip file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    
    // Save zip file to public directory
    const fileName = `press-kit-${gameId}-${Date.now()}.zip`
    const filePath = path.join(process.cwd(), 'public', 'press-kits', fileName)
    
    // Ensure directory exists
    const dir = path.dirname(filePath)
    await writeFile(dir + '/.gitkeep', '')
    
    await writeFile(filePath, zipBuffer)
    
    // Update press kit with zip URL
    await prisma.pressKit.update({
      where: { id: pressKit.id },
      data: { zipUrl: `/press-kits/${fileName}` }
    })

    return NextResponse.json({
      success: true,
      pressKit: {
        ...pressKit,
        zipUrl: `/press-kits/${fileName}`
      }
    })
  } catch (error) {
    console.error('Error generating press kit:', error)
    return NextResponse.json(
      { error: 'Failed to generate press kit' },
      { status: 500 }
    )
  }
}
