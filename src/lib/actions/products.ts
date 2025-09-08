"use server"

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProductFullInput } from '@/lib/schemas/product'

export async function createProductAction(data: ProductFullInput) {
  try {
    console.log('Starting product creation...')

    const session = await getServerSession(authOptions)
    console.log('Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email,
      email: session?.user?.email
    })

    if (!session) {
      console.error('No session found')
      return { ok: false, error: 'You must be logged in to submit a game. Please sign in and try again.' }
    }

    if (!session.user?.email) {
      console.error('No email in session')
      return { ok: false, error: 'Your session is invalid. Please sign in again.' }
    }

    console.log('Looking for user with email:', session.user.email)

    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.warn('User not found in DB. Creating user from session:', session.user.email)
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || 'User',
          image: (session.user as any).image || null,
          role: 'USER'
        }
      })
    }

    console.log('User found:', { id: user.id, email: user.email })

    console.log('Creating product with data:', {
      title: data.title,
      userId: user.id,
      categoriesCount: data.categories?.length || 0,
      makersCount: data.makers?.length || 0,
      tagsCount: data.tags?.length || 0
    })

    const product = await prisma.product.create({
      data: {
        title: data.title,
        tagline: data.tagline,
        description: data.description,
        url: data.iosUrl || data.androidUrl || '', // Use one of the URLs as the primary URL
        iosUrl: data.iosUrl,
        androidUrl: data.androidUrl,
        thumbnail: data.thumbnail,
        gallery: data.gallery,
        youtubeUrl: data.youtubeUrl,
        gameplayGifUrl: data.gameplayGifUrl,
        demoUrl: data.demoUrl,
        socialLinks: data.website || data.discordUrl || data.twitterUrl || data.tiktokUrl || data.youtubeUrl
          ? {
              website: data.website || undefined,
              discord: data.discordUrl || undefined,
              twitter: data.twitterUrl || undefined,
              tiktok: data.tiktokUrl || undefined,
              youtube: data.youtubeUrl || undefined,
            }
          : undefined,
        platforms: data.platforms,
        countries: data.targetCountries,
        languages: data.languages,
        releaseAt: data.releaseAt ? new Date(data.releaseAt) : null,
        studioName: data.studioName,
        launchType: data.launchType,
        launchDate: data.launchDate ? new Date(data.launchDate) : null,
        monetization: data.monetization,
        engine: data.engine,
        userId: user.id,
        status: 'PUBLISHED',
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
            userId: maker.userId || null,
            email: maker.email || null,
            role: maker.role,
            isCreator: index === 0 // First maker is the creator
          })) || []
        }
      }
    })

    console.log('Product created successfully:', product.id)
    revalidatePath('/')
    return { ok: true, productId: product.id }
  } catch (error: any) {
    console.error('Error creating product:', error)

    // Handle specific error types
    if (error?.code === 'P2002') {
      return { ok: false, error: 'A product with this title already exists' }
    }

    if (error?.code === 'P2003') {
      return { ok: false, error: 'Invalid data provided. Please check your input.' }
    }

    if (error?.message?.includes('categories')) {
      return { ok: false, error: 'Invalid category selected. Please try again.' }
    }

    if (error?.message?.includes('tags')) {
      return { ok: false, error: 'Invalid tag provided. Please try again.' }
    }

    if (error?.message?.includes('makers')) {
      return { ok: false, error: 'Invalid maker information. Please try again.' }
    }

    // Generic error message
    return { ok: false, error: 'Failed to create product. Please check your connection and try again.' }
  }
}

export async function saveDraftAction(data: ProductFullInput) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { ok: false, error: 'Unauthorized' }
    }

    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || 'User',
          image: (session.user as any).image || null,
          role: 'USER'
        }
      })
    }

    const product = await prisma.product.create({
      data: {
        title: data.title,
        tagline: data.tagline,
        description: data.description,
        url: data.iosUrl || data.androidUrl || '', // Use one of the URLs as the primary URL
        iosUrl: data.iosUrl,
        androidUrl: data.androidUrl,
        thumbnail: data.thumbnail,
        gallery: data.gallery,
        youtubeUrl: data.youtubeUrl,
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
        languages: data.languages,
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

    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || 'User',
          image: (session.user as any).image || null,
          role: 'USER'
        }
      })
    }

    const product = await prisma.product.create({
      data: {
        title: data.title,
        tagline: data.tagline,
        description: data.description,
        url: data.iosUrl || data.androidUrl || '', // Use one of the URLs as the primary URL
        iosUrl: data.iosUrl,
        androidUrl: data.androidUrl,
        thumbnail: data.thumbnail,
        gallery: data.gallery,
        youtubeUrl: data.youtubeUrl,
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
        languages: data.languages,
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

    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || 'User',
          image: (session.user as any).image || null,
          role: 'USER'
        }
      })
    }

    const product = await prisma.product.create({
      data: {
        title: data.title,
        tagline: data.tagline,
        description: data.description,
        url: data.iosUrl || data.androidUrl || '', // Use one of the URLs as the primary URL
        iosUrl: data.iosUrl,
        androidUrl: data.androidUrl,
        thumbnail: data.thumbnail,
        gallery: data.gallery,
        youtubeUrl: data.youtubeUrl,
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
        languages: data.languages,
        releaseAt: data.releaseAt ? new Date(data.releaseAt) : null,
        studioName: data.studioName,
        launchType: data.launchType,
        launchDate: data.launchDate ? new Date(data.launchDate) : null,
        monetization: data.monetization,
        engine: data.engine,
        userId: user.id,
        status: 'PUBLISHED',
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

export async function getDeveloperProductsAction() {
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

    // Get all products for the developer with analytics summary
    const products = await prisma.product.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        title: true,
        status: true,
        releaseAt: true,
        createdAt: true,
        clicks: true,
        follows: true,
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate analytics summary
    const analyticsSummary = {
      totalProducts: products.length,
      totalViews: products.reduce((sum, product) => sum + (product.clicks || 0), 0),
      totalVotes: products.reduce((sum, product) => sum + product._count.votes, 0),
      totalFollows: products.reduce((sum, product) => sum + (product.follows || 0), 0),
      totalClicks: products.reduce((sum, product) => sum + (product.clicks || 0), 0)
    }

    return {
      ok: true,
      products: products.map(product => ({
        id: product.id,
        name: product.title,
        status: product.status,
        releaseDate: product.releaseAt,
        createdAt: product.createdAt,
        totalViews: product.clicks || 0,
        totalVotes: product._count.votes,
        totalFollows: product.follows || 0,
        totalClicks: product.clicks || 0
      })),
      analyticsSummary
    }
  } catch (error) {
    console.error('Error fetching developer products:', error)
    return { ok: false, error: 'Failed to fetch products' }
  }
}

export async function getDashboardAnalyticsAction() {
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

    // Get all product IDs for the developer
    const userProducts = await prisma.product.findMany({
      where: { userId: user.id },
      select: { id: true }
    })

    const productIds = userProducts.map(p => p.id)

    if (productIds.length === 0) {
      return {
        ok: true,
        data: {
          clicksByPlatform: [],
          clicksOverTime: [],
          votesVsFollows: []
        }
      }
    }

    // 1. Internal Clicks (type = INTERNAL)
    const internalClicks = await prisma.metric.groupBy({
      by: ['type'],
      where: {
        gameId: { in: productIds },
        type: 'INTERNAL'
      },
      _count: {
        type: true
      }
    })

    // 2. External Clicks (type = STORE, PRE_REGISTER, DISCORD, WEBSITE, TIKTOK, STEAM)
    const externalClicks = await prisma.metric.groupBy({
      by: ['type'],
      where: {
        gameId: { in: productIds },
        type: {
          in: ['STORE', 'PRE_REGISTER', 'DISCORD', 'WEBSITE', 'TIKTOK', 'STEAM']
        }
      },
      _count: {
        type: true
      }
    })

    // 3. Clicks by Platform (IOS, ANDROID, STEAM, WEB, DISCORD, TIKTOK)
    const clicksByPlatform = await prisma.metric.groupBy({
      by: ['type'],
      where: {
        gameId: { in: productIds },
        type: {
          in: ['IOS', 'ANDROID', 'STEAM', 'WEB', 'DISCORD', 'TIKTOK']
        }
      },
      _count: {
        type: true
      }
    })

    // 4. Clicks Over Time by Category (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const clicksOverTimeByCategory = await prisma.metric.groupBy({
      by: ['timestamp', 'type'],
      where: {
        gameId: { in: productIds },
        timestamp: {
          gte: thirtyDaysAgo
        },
        type: {
          in: ['INTERNAL', 'STORE', 'PRE_REGISTER', 'DISCORD', 'WEBSITE', 'TIKTOK', 'STEAM', 'IOS', 'ANDROID']
        }
      },
      _count: {
        timestamp: true
      }
    })

    // 3. Votes vs Follows by Game
    const votesByGame = await prisma.vote.groupBy({
      by: ['productId'],
      where: {
        productId: { in: productIds }
      },
      _count: {
        productId: true
      }
    })

    const followsByGame = await prisma.follow.groupBy({
      by: ['gameId'],
      where: {
        gameId: { in: productIds }
      },
      _count: {
        gameId: true
      }
    })

    // Get product names for votes vs follows
    const productNames = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true }
    })

    const productNameMap = new Map(productNames.map(p => [p.id, p.title]))

    // Process internal clicks
    const processedInternalClicks = internalClicks.map(item => ({
      name: 'Internal',
      value: item._count.type,
      color: '#8B5CF6' // Purple for internal
    }))

    // Process external clicks
    const processedExternalClicks = externalClicks.map(item => ({
      name: item.type,
      value: item._count.type,
      color: getExternalClickColor(item.type)
    }))

    // Process clicks by platform
    const processedClicksByPlatform = clicksByPlatform.map(item => ({
      name: item.type,
      value: item._count.type,
      color: getPlatformColor(item.type)
    }))

    // Process clicks over time by category
    const clicksByDateAndCategory = new Map()
    
    // Initialize all dates in the last 30 days with 0 clicks for both categories
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      clicksByDateAndCategory.set(dateStr, {
        date: dateStr,
        internal: 0,
        external: 0
      })
    }

    // Add actual click data by category
    clicksOverTimeByCategory.forEach(item => {
      const dateStr = item.timestamp.toISOString().split('T')[0]
      const existing = clicksByDateAndCategory.get(dateStr)
      
      if (existing) {
        if (item.type === 'INTERNAL') {
          existing.internal += item._count.timestamp
        } else {
          existing.external += item._count.timestamp
        }
      }
    })

    // Convert to array and sort by date
    const processedClicksOverTime = Array.from(clicksByDateAndCategory.values())
      .sort((a, b) => a.date.localeCompare(b.date))

    // Process votes vs follows
    const votesVsFollowsMap = new Map()
    
    // Initialize with all products
    productIds.forEach(productId => {
      votesVsFollowsMap.set(productId, {
        name: productNameMap.get(productId) || 'Unknown',
        votes: 0,
        follows: 0
      })
    })

    // Add votes data
    votesByGame.forEach(item => {
      const existing = votesVsFollowsMap.get(item.productId)
      if (existing) {
        existing.votes = item._count.productId
      }
    })

    // Add follows data
    followsByGame.forEach(item => {
      const existing = votesVsFollowsMap.get(item.gameId)
      if (existing) {
        existing.follows = item._count.gameId
      }
    })

    const processedVotesVsFollows = Array.from(votesVsFollowsMap.values())

    return {
      ok: true,
      data: {
        internalClicks: processedInternalClicks,
        externalClicks: processedExternalClicks,
        clicksByPlatform: processedClicksByPlatform,
        clicksOverTime: processedClicksOverTime,
        votesVsFollows: processedVotesVsFollows
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    return { ok: false, error: 'Failed to fetch analytics' }
  }
}

function getPlatformColor(platform: string): string {
  const colors: { [key: string]: string } = {
    'IOS': '#10B981',        // Green for iOS
    'ANDROID': '#3B82F6',    // Blue for Android
    'WEB': '#8B5CF6',        // Purple for Web
    'STEAM': '#F59E0B',      // Orange for Steam
    'APPLE': '#10B981',      // Green for Apple (legacy)
    'GOOGLE': '#3B82F6',     // Blue for Google (legacy)
    'MICROSOFT': '#8B5CF6',  // Purple for Microsoft
    'NINTENDO': '#EF4444',   // Red for Nintendo
    'PLAYSTATION': '#6366F1', // Indigo for PlayStation
    'XBOX': '#10B981'        // Green for Xbox
  }
  return colors[platform.toUpperCase()] || '#6B7280'
}

function getExternalClickColor(type: string): string {
  const colors: { [key: string]: string } = {
    'STORE': '#10B981',      // Green for store
    'PRE_REGISTER': '#3B82F6', // Blue for pre-register
    'DISCORD': '#8B5CF6',     // Purple for Discord
    'WEBSITE': '#F59E0B',     // Orange for website
    'TIKTOK': '#EF4444',      // Red for TikTok
    'STEAM': '#6366F1',       // Indigo for Steam
    'IOS': '#10B981',         // Green for iOS
    'ANDROID': '#3B82F6'      // Blue for Android
  }
  return colors[type.toUpperCase()] || '#6B7280'
}
