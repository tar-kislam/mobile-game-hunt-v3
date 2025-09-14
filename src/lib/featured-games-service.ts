/**
 * Featured Games Service
 * 
 * This service integrates the featured games algorithm with the database
 * and provides easy-to-use functions for the frontend.
 */

import { prisma } from './prisma';
import { getFeaturedGames, FeaturedGame } from './featured-algorithm';

/**
 * Fetch games from database and apply featured algorithm
 */
export async function getFeaturedGamesFromDB(limit: number = 6) {
  try {
    // Fetch all published games with required fields
    const games = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED', // Only published games
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
        editorial_boost: true,
        editorial_override: true,
        releaseAt: true,
        createdAt: true,
        // We'll need to add rating calculation if not already available
        // For now, we'll use a placeholder or calculate from existing data
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform database results to FeaturedGame format
    const featuredGames: FeaturedGame[] = games.map(game => ({
      id: game.id,
      title: game.title,
      upvotes: game._count.votes,
      comments: game._count.comments,
      rating: null, // TODO: Implement rating calculation from existing data
      releaseDate: game.releaseAt || game.createdAt,
      editorial_boost: game.editorial_boost,
      editorial_override: game.editorial_override,
      createdAt: game.createdAt,
    }));

    // Apply featured algorithm
    return getFeaturedGames(featuredGames, limit);
  } catch (error) {
    console.error('Error fetching featured games from database:', error);
    throw new Error('Failed to fetch featured games');
  }
}

/**
 * Get featured games for landing page
 */
export async function getLandingPageFeaturedGames(limit: number = 6) {
  return getFeaturedGamesFromDB(limit);
}

/**
 * Get featured games for discover page (with different limit)
 */
export async function getDiscoverFeaturedGames(limit: number = 12) {
  return getFeaturedGamesFromDB(limit);
}

/**
 * Get featured games with additional metadata for admin dashboard
 */
export async function getFeaturedGamesWithMetadata(limit: number = 6) {
  try {
    const featuredGames = await getFeaturedGamesFromDB(limit);
    
    // Add additional metadata for admin use
    const gamesWithMetadata = await Promise.all(
      featuredGames.map(async (game) => {
        // Fetch additional game data if needed
        const gameData = await prisma.product.findUnique({
          where: { id: game.id },
          select: {
            thumbnail: true,
            gallery: true,
            platforms: true,
            tagline: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        });

        return {
          ...game,
          ...gameData,
        };
      })
    );

    return gamesWithMetadata;
  } catch (error) {
    console.error('Error fetching featured games with metadata:', error);
    throw new Error('Failed to fetch featured games with metadata');
  }
}

/**
 * Update editorial settings for a game (used by admin dashboard)
 */
export async function updateGameEditorialSettings(
  gameId: string,
  settings: {
    editorial_boost?: boolean;
    editorial_override?: boolean;
  }
) {
  try {
    const updatedGame = await prisma.product.update({
      where: { id: gameId },
      data: {
        editorial_boost: settings.editorial_boost,
        editorial_override: settings.editorial_override,
      },
      select: {
        id: true,
        title: true,
        editorial_boost: true,
        editorial_override: true,
      },
    });

    return updatedGame;
  } catch (error) {
    console.error('Error updating game editorial settings:', error);
    throw new Error('Failed to update game editorial settings');
  }
}

/**
 * Get all games with editorial settings for admin dashboard
 */
export async function getAllGamesWithEditorialSettings() {
  try {
    const games = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
        editorial_boost: true,
        editorial_override: true,
        releaseAt: true,
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return games.map(game => ({
      id: game.id,
      title: game.title,
      upvotes: game._count.votes,
      comments: game._count.comments,
      rating: null, // TODO: Add rating calculation
      releaseDate: game.releaseAt || game.createdAt,
      editorial_boost: game.editorial_boost,
      editorial_override: game.editorial_override,
      status: game.status,
      createdAt: game.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching games with editorial settings:', error);
    throw new Error('Failed to fetch games with editorial settings');
  }
}
