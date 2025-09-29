import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redisClient } from '@/lib/redis';
import { getScoringWeights, calculateFinalScore, DEFAULT_LEADERBOARD_CONFIG } from '@/lib/leaderboardConfig';

// Cache keys and TTL constants
const LEADERBOARD_KEYS = {
  DAILY: 'leaderboard:daily',
  WEEKLY: 'leaderboard:weekly',
  MONTHLY: 'leaderboard:monthly',
  YEARLY: 'leaderboard:yearly',
  ALL: 'leaderboard:all'
};

const CACHE_TTL = DEFAULT_LEADERBOARD_CONFIG.cacheTTL;

// Get scoring weights (configurable via environment variables)
const scoringWeights = getScoringWeights();

// Ranking function with tiebreakers
function compareProducts(a: any, b: any): number {
  // Primary sort: by final score (descending)
  if (b.finalScore !== a.finalScore) {
    return b.finalScore - a.finalScore;
  }
  
  // Tiebreaker 1: votes (descending)
  if (b.votes !== a.votes) {
    return b.votes - a.votes;
  }
  
  // Tiebreaker 2: comments (descending)
  if (b.comments !== a.comments) {
    return b.comments - a.comments;
  }
  
  // Tiebreaker 3: follows (descending)
  if (b.follows !== a.follows) {
    return b.follows - a.follows;
  }
  
  // Tiebreaker 4: views (descending)
  return b.views - a.views;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const window = searchParams.get('window') || 'all';
    const take = parseInt(searchParams.get('take') || '50');
    
    // Validate window parameter
    if (!['daily', 'weekly', 'monthly'].includes(window)) {
      return NextResponse.json(
        { error: 'Invalid window parameter. Use: daily, weekly, or monthly' },
        { status: 400 }
      );
    }

    // Try to get from cache first
    const cacheKey = LEADERBOARD_KEYS[window.toUpperCase() as keyof typeof LEADERBOARD_KEYS];
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      return NextResponse.json({
        ...parsed,
        products: parsed.products.slice(0, take),
        cached: true
      });
    }

    // Calculate date filters
    const now = new Date();
    let startDate: Date | undefined;
    
    if (window === 'daily') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (window === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (window === 'monthly') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Guard against missing Product model
    if (!(prisma as any).product) {
      return NextResponse.json({ products: [], cached: false })
    }

    // Build base where clause for products
    const productWhereClause: any = {
      status: 'PUBLISHED' // Only show published products
    };

    // Build date filters for interactions
    const interactionWhereClause: any = {};
    if (startDate) {
      interactionWhereClause.createdAt = {
        gte: startDate
      };
    }

    // Fetch products with their interaction counts filtered by timeframe
    const products = await (prisma as any).product.findMany({
      where: productWhereClause,
      select: {
        id: true,
        title: true,
        description: true,
        tagline: true,
        url: true,
        thumbnail: true,
        image: true,
        platforms: true,
        status: true,
        createdAt: true,
        clicks: true, // This is the views metric
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        votes: {
          where: interactionWhereClause,
          select: {
            id: true
          }
        },
        comments: {
          where: interactionWhereClause,
          select: {
            id: true
          }
        },
        followUsers: {
          where: interactionWhereClause,
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate scores and add rank
    const productsWithScores = products.map((product: any) => {
      // Extract counts from the filtered interactions
      const votes = product.votes.length;
      const comments = product.comments.length;
      const follows = product.followUsers.length;
      const views = product.clicks || 0; // Use the clicks field as views
      
      // Calculate final score using weighted metrics
      const finalScore = calculateFinalScore(votes, comments, follows, views, scoringWeights);

      return {
        id: product.id,
        title: product.title,
        description: product.description,
        tagline: product.tagline,
        thumbnail: product.thumbnail ?? product.image ?? null,
        url: product.url,
        platforms: product.platforms,
        status: product.status,
        createdAt: product.createdAt,
        user: product.user,
        votes,
        comments,
        follows,
        views,
        finalScore
      };
    });

    // Sort by final score with tiebreakers and add rank
    const sortedProducts = productsWithScores
      .sort(compareProducts)
      .map((product: any, index: number) => ({
        ...product,
        rank: index + 1
      }));

    const responseData = {
      window,
      take,
      total: products.length,
      products: sortedProducts
    };

    // Cache the full result
    const ttl = CACHE_TTL[window.toUpperCase() as keyof typeof CACHE_TTL];
    await redisClient.setEx(cacheKey, ttl, JSON.stringify(responseData));

    return NextResponse.json({
      ...responseData,
      products: sortedProducts.slice(0, take)
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
