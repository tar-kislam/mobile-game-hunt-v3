"use server"

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProductFullInput } from '@/lib/schemas/product'

export async function createProductAction(data: ProductFullInput) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { ok: false, error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return { ok: false, error: 'User not found' }
    }

    const product = await prisma.product.create({
      data: {
        title: data.title,
        tagline: data.tagline,
        description: data.description,
        url: data.url,
        thumbnail: data.thumbnail,
        gallery: data.gallery,
        videoUrl: data.videoUrl,
        gameplayGifUrl: data.gameplayGifUrl,
        demoUrl: data.demoUrl,
        socialLinks: {
          website: data.website,
          discordUrl: data.discordUrl,
          twitterUrl: data.twitterUrl,
          tiktokUrl: data.tiktokUrl,
          youtubeUrl: data.youtubeUrl,
        },
        platforms: data.platforms,
        countries: data.targetCountries,
        releaseAt: data.releaseAt ? new Date(data.releaseAt) : null,
        studioName: data.studioName,
        launchType: data.launchType,
        launchDate: data.launchDate ? new Date(data.launchDate) : null,
        monetization: data.monetization,
        engine: data.engine,
        userId: user.id,
        // Community & Extras fields
        pricing: data.pricing,
        promoOffer: data.promoOffer,
        promoCode: data.promoCode,
        promoExpiry: data.promoExpiry ? new Date(data.promoExpiry) : null,
        playtestQuota: data.playtestQuota,
        playtestExpiry: data.playtestExpiry ? new Date(data.playtestExpiry) : null,
        sponsorRequest: data.sponsorRequest,
        sponsorNote: data.sponsorNote,
        crowdfundingPledge: data.crowdfundingPledge,
        gamificationTags: data.gamificationTags,
        categories: {
          create: data.categories?.map(categoryId => ({ categoryId: categoryId })) || []
        },
        tags: {
          create: data.tags?.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
                create: {
                  slug: tagName.toLowerCase().replace(/\s+/g, '-'),
                  name: tagName
                }
              }
            }
          })) || []
        },
        makers: {
          create: data.makers?.map((maker, index) => ({
            userId: maker.userId,
            email: maker.email,
            role: maker.role,
            isCreator: index === 0 // First maker is the creator
          })) || []
        }
      }
    })

    revalidatePath('/')
    return { ok: true, productId: product.id }
  } catch (error) {
    console.error('Error creating product:', error)
    return { ok: false, error: 'Failed to create product' }
  }
}

export async function saveDraftAction(data: ProductFullInput) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { ok: false, error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return { ok: false, error: 'User not found' }
    }

    const product = await prisma.product.create({
      data: {
        title: data.title,
        tagline: data.tagline,
        description: data.description,
        url: data.url,
        thumbnail: data.thumbnail,
        gallery: data.gallery,
        videoUrl: data.videoUrl,
        gameplayGifUrl: data.gameplayGifUrl,
        demoUrl: data.demoUrl,
        socialLinks: {
          website: data.website,
          discordUrl: data.discordUrl,
          twitterUrl: data.twitterUrl,
          tiktokUrl: data.tiktokUrl,
          youtubeUrl: data.youtubeUrl,
        },
        platforms: data.platforms,
        countries: data.targetCountries,
        releaseAt: data.releaseAt ? new Date(data.releaseAt) : null,
        studioName: data.studioName,
        launchType: data.launchType,
        launchDate: data.launchDate ? new Date(data.launchDate) : null,
        monetization: data.monetization,
        engine: data.engine,
        userId: user.id,
        status: 'DRAFT',
        // Community & Extras fields
        pricing: data.pricing,
        promoOffer: data.promoOffer,
        promoCode: data.promoCode,
        promoExpiry: data.promoExpiry ? new Date(data.promoExpiry) : null,
        playtestQuota: data.playtestQuota,
        playtestExpiry: data.playtestExpiry ? new Date(data.playtestExpiry) : null,
        sponsorRequest: data.sponsorRequest,
        sponsorNote: data.sponsorNote,
        crowdfundingPledge: data.crowdfundingPledge,
        gamificationTags: data.gamificationTags,
        categories: {
          create: data.categories?.map(categoryId => ({ categoryId: categoryId })) || []
        },
        tags: {
          create: data.tags?.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
                create: {
                  slug: tagName.toLowerCase().replace(/\s+/g, '-'),
                  name: tagName
                }
              }
            }
          })) || []
        },
        makers: {
          create: data.makers?.map((maker, index) => ({
            userId: maker.userId,
            email: maker.email,
            role: maker.role,
            isCreator: index === 0 // First maker is the creator
          })) || []
        }
      }
    })

    revalidatePath('/')
    return { ok: true, productId: product.id }
  } catch (error) {
    console.error('Error saving draft:', error)
    return { ok: false, error: 'Failed to save draft' }
  }
}

export async function scheduleLaunchAction(data: ProductFullInput, launchDate: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { ok: false, error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return { ok: false, error: 'User not found' }
    }

    const product = await prisma.product.create({
      data: {
        title: data.title,
        tagline: data.tagline,
        description: data.description,
        url: data.url,
        thumbnail: data.thumbnail,
        gallery: data.gallery,
        videoUrl: data.videoUrl,
        gameplayGifUrl: data.gameplayGifUrl,
        demoUrl: data.demoUrl,
        socialLinks: {
          website: data.website,
          discordUrl: data.discordUrl,
          twitterUrl: data.twitterUrl,
          tiktokUrl: data.tiktokUrl,
          youtubeUrl: data.youtubeUrl,
        },
        platforms: data.platforms,
        countries: data.targetCountries,
        releaseAt: data.releaseAt ? new Date(data.releaseAt) : null,
        studioName: data.studioName,
        launchType: data.launchType,
        launchDate: new Date(launchDate),
        monetization: data.monetization,
        engine: data.engine,
        userId: user.id,
        status: 'PENDING',
        // Community & Extras fields
        pricing: data.pricing,
        promoOffer: data.promoOffer,
        promoCode: data.promoCode,
        promoExpiry: data.promoExpiry ? new Date(data.promoExpiry) : null,
        playtestQuota: data.playtestQuota,
        playtestExpiry: data.playtestExpiry ? new Date(data.playtestExpiry) : null,
        sponsorRequest: data.sponsorRequest,
        sponsorNote: data.sponsorNote,
        crowdfundingPledge: data.crowdfundingPledge,
        gamificationTags: data.gamificationTags,
        categories: {
          create: data.categories?.map(categoryId => ({ categoryId: categoryId })) || []
        },
        tags: {
          create: data.tags?.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
                create: {
                  slug: tagName.toLowerCase().replace(/\s+/g, '-'),
                  name: tagName
                }
              }
            }
          })) || []
        },
        makers: {
          create: data.makers?.map((maker, index) => ({
            userId: maker.userId,
            email: maker.email,
            role: maker.role,
            isCreator: index === 0 // First maker is the creator
          })) || []
        }
      }
    })

    revalidatePath('/')
    return { ok: true, productId: product.id }
  } catch (error) {
    console.error('Error scheduling launch:', error)
    return { ok: false, error: 'Failed to schedule launch' }
  }
}

export async function submitApprovalAction(data: ProductFullInput) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { ok: false, error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return { ok: false, error: 'User not found' }
    }

    const product = await prisma.product.create({
      data: {
        title: data.title,
        tagline: data.tagline,
        description: data.description,
        url: data.url,
        thumbnail: data.thumbnail,
        gallery: data.gallery,
        videoUrl: data.videoUrl,
        gameplayGifUrl: data.gameplayGifUrl,
        demoUrl: data.demoUrl,
        socialLinks: {
          website: data.website,
          discordUrl: data.discordUrl,
          twitterUrl: data.twitterUrl,
          tiktokUrl: data.tiktokUrl,
          youtubeUrl: data.youtubeUrl,
        },
        platforms: data.platforms,
        countries: data.targetCountries,
        releaseAt: data.releaseAt ? new Date(data.releaseAt) : null,
        studioName: data.studioName,
        launchType: data.launchType,
        launchDate: data.launchDate ? new Date(data.launchDate) : null,
        monetization: data.monetization,
        engine: data.engine,
        userId: user.id,
        status: 'PENDING',
        // Community & Extras fields
        pricing: data.pricing,
        promoOffer: data.promoOffer,
        promoCode: data.promoCode,
        promoExpiry: data.promoExpiry ? new Date(data.promoExpiry) : null,
        playtestQuota: data.playtestQuota,
        playtestExpiry: data.playtestExpiry ? new Date(data.playtestExpiry) : null,
        sponsorRequest: data.sponsorRequest,
        sponsorNote: data.sponsorNote,
        crowdfundingPledge: data.crowdfundingPledge,
        gamificationTags: data.gamificationTags,
        categories: {
          create: data.categories?.map(categoryId => ({ categoryId: categoryId })) || []
        },
        tags: {
          create: data.tags?.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
                create: {
                  slug: tagName.toLowerCase().replace(/\s+/g, '-'),
                  name: tagName
                }
              }
            }
          })) || []
        },
        makers: {
          create: data.makers?.map((maker, index) => ({
            userId: maker.userId,
            email: maker.email,
            role: maker.role,
            isCreator: index === 0 // First maker is the creator
          })) || []
        }
      }
    })

    revalidatePath('/')
    return { ok: true, productId: product.id }
  } catch (error) {
    console.error('Error submitting for approval:', error)
    return { ok: false, error: 'Failed to submit for approval' }
  }
}
