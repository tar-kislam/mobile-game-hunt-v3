/**
 * Featured Games Integration Example
 * 
 * This file shows how to integrate the new featured games algorithm
 * with existing components like EpicFeaturedGames.
 */

import { getFeaturedGamesFromDB } from './featured-games-service';

/**
 * Example: How to use the featured games service in a React component
 */
export async function getFeaturedGamesForLandingPage() {
  try {
    // Get 6 featured games for the landing page
    const featuredGames = await getFeaturedGamesFromDB(6);
    
    // Transform to the format expected by EpicFeaturedGames component
    const transformedGames = featuredGames.map(game => ({
      id: game.id,
      title: game.title,
      tagline: '', // Add tagline if available in your database
      description: '', // Add description if available
      thumbnail: '', // Add thumbnail URL if available
      gallery: [], // Add gallery images if available
      platforms: [], // Add platforms if available
      releaseAt: game.releaseDate,
      upvotes: game.upvotes,
      comments: game.comments,
      rating: game.rating,
      editorial_boost: game.editorial_boost,
      editorial_override: game.editorial_override,
      featured_score: game.featured_score,
      // Add any other fields needed by your components
    }));

    return transformedGames;
  } catch (error) {
    console.error('Error fetching featured games for landing page:', error);
    return [];
  }
}

/**
 * Example: How to use in a server component or API route
 */
export async function getFeaturedGamesForDiscoverPage() {
  try {
    // Get more games for the discover page
    const featuredGames = await getFeaturedGamesFromDB(12);
    return featuredGames;
  } catch (error) {
    console.error('Error fetching featured games for discover page:', error);
    return [];
  }
}

/**
 * Example: How to use in a client component with SWR
 */
export function useFeaturedGames(limit: number = 6) {
  // This would be used with SWR or React Query in a client component
  const { data, error, isLoading } = {
    data: null,
    error: null,
    isLoading: false,
  }; // This is just a placeholder - implement with actual SWR/React Query

  return {
    featuredGames: data || [],
    isLoading,
    error,
  };
}

/**
 * Example: How to refresh featured games when editorial settings change
 */
export async function refreshFeaturedGamesAfterEditorialUpdate(gameId: string) {
  try {
    // After updating editorial settings in the admin dashboard,
    // you might want to refresh the featured games cache
    // This could be used with SWR's mutate function or similar
    
    console.log(`Featured games should be refreshed after updating game: ${gameId}`);
    
    // Example with SWR:
    // mutate('/api/featured-games');
    
    return true;
  } catch (error) {
    console.error('Error refreshing featured games:', error);
    return false;
  }
}
