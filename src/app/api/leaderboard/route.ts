import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redisClient } from '@/lib/redis';

// Cache keys and TTL constants
const LEADERBOARD_KEYS = {
  DAILY: 'leaderboard:daily',
  WEEKLY: 'leaderboard:weekly',
  MONTHLY: 'leaderboard:monthly',
  YEARLY: 'leaderboard:yearly',
  ALL: 'leaderboard:all'
};

const CACHE_TTL = {
  DAILY: 300, // 5 minutes
  WEEKLY: 900, // 15 minutes
  MONTHLY: 1800, // 30 minutes
  YEARLY: 3600, // 1 hour
  ALL: 3600 // 1 hour
};

// Score calculation with decay formula
// score = (log1p(votes) + 0.6 * log1p(follows) + 0.4 * log1p(clicks)) * e^(-ageHours/36)
function calculateScore(votes: number, follows: number, clicks: number, createdAt: Date): number {
  const now = new Date();
  const ageHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  const baseScore = Math.log1p(votes) + 0.6 * Math.log1p(follows) + 0.4 * Math.log1p(clicks);
  const decay = Math.exp(-ageHours / 36);
  
  return baseScore * decay;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const window = searchParams.get('window') || 'all';
    const take = parseInt(searchParams.get('take') || '50');
    
    // Validate window parameter
    if (!['daily', 'weekly', 'all'].includes(window)) {
      return NextResponse.json(
        { error: 'Invalid window parameter. Use: daily, weekly, or all' },
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
    }

    // Build where clause
    const whereClause: any = {};
    if (startDate) {
      whereClause.createdAt = {
        gte: startDate
      };
    }

    // Fetch products with votes count and user info
    const products = await prisma.product.findMany({
      where: whereClause,
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
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
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
    });

    // Calculate scores and add rank
    const productsWithScores = products.map(product => {
      // For now, we'll use votes as follows and comments as clicks
      // In a real app, you'd have separate follows and clicks tracking
      const follows = product._count.comments; // Placeholder
      const clicks = Math.floor(Math.random() * 100); // Placeholder - replace with real tracking
      
      const score = calculateScore(
        product._count.votes,
        follows,
        clicks,
        product.createdAt
      );

      return {
        id: product.id,
        title: product.title,
        description: product.description,
        tagline: product.tagline,
        thumbnail: product.thumbnail ?? product.image ?? null,
        url: product.url,
        platforms: product.platforms,
        // countries may not exist on schema; omit to avoid P2022
        status: product.status,
        createdAt: product.createdAt,
        user: product.user,
        votes: product._count.votes,
        comments: product._count.comments,
        follows,
        clicks,
        score: parseFloat(score.toFixed(4))
      };
    });

    // Sort by score (descending) and add rank
    const sortedProducts = productsWithScores
      .sort((a, b) => b.score - a.score)
      .map((product, index) => ({
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
