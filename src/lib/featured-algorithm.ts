/**
 * Featured Games Algorithm with Weight System and Editorial Override
 * 
 * This module implements a sophisticated scoring system for determining
 * which games should be featured prominently on the platform.
 */

// Configuration for featured games scoring weights
export const FEATURED_WEIGHTS = {
  upvotes: 0.30,
  comments: 0.20,
  rating: 0.25,
  recency: 0.15,
  editorial_boost: 0.10,
} as const;

// Game interface for the featured algorithm
export interface FeaturedGame {
  id: string;
  title: string;
  upvotes: number;
  comments: number;
  rating: number | null;
  releaseDate: Date | string | null;
  editorial_boost: boolean;
  editorial_override: boolean;
  // Optional fields for additional metadata
  createdAt?: Date | string;
  [key: string]: any;
}

// Extended game interface with calculated scores
export interface ScoredGame extends FeaturedGame {
  featured_score: number;
  normalized_scores: {
    upvotes: number;
    comments: number;
    rating: number;
    recency: number;
    editorial_boost: number;
  };
}

/**
 * Normalizes a value between 0 and 1 using min-max normalization
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0; // Avoid division by zero
  return (value - min) / (max - min);
}

/**
 * Calculates recency score based on release date
 * More recent games get higher scores
 */
function calculateRecencyScore(releaseDate: Date | string | null, allDates: (Date | string | null)[]): number {
  if (!releaseDate) return 0;
  
  const release = new Date(releaseDate);
  const now = new Date();
  const maxAge = Math.max(...allDates
    .filter(date => date !== null)
    .map(date => now.getTime() - new Date(date!).getTime())
  );
  
  const age = now.getTime() - release.getTime();
  return Math.max(0, 1 - (age / maxAge));
}

/**
 * Calculates normalized scores for all games
 */
function calculateNormalizedScores(games: FeaturedGame[]): ScoredGame[] {
  // Extract all values for normalization
  const upvotes = games.map(g => g.upvotes);
  const comments = games.map(g => g.comments);
  const ratings = games.map(g => g.rating || 0).filter(r => r > 0);
  const releaseDates = games.map(g => g.releaseDate);
  
  // Calculate min/max values
  const upvotesMin = Math.min(...upvotes);
  const upvotesMax = Math.max(...upvotes);
  const commentsMin = Math.min(...comments);
  const commentsMax = Math.max(...comments);
  const ratingMin = ratings.length > 0 ? Math.min(...ratings) : 0;
  const ratingMax = ratings.length > 0 ? Math.max(...ratings) : 5;
  
  // Calculate scored games
  return games.map(game => {
    const normalized_scores = {
      upvotes: normalize(game.upvotes, upvotesMin, upvotesMax),
      comments: normalize(game.comments, commentsMin, commentsMax),
      rating: game.rating ? normalize(game.rating, ratingMin, ratingMax) : 0,
      recency: calculateRecencyScore(game.releaseDate, releaseDates),
      editorial_boost: game.editorial_boost ? 1 : 0,
    };
    
    // Calculate featured score using weighted formula
    const featured_score = 
      (normalized_scores.upvotes * FEATURED_WEIGHTS.upvotes) +
      (normalized_scores.comments * FEATURED_WEIGHTS.comments) +
      (normalized_scores.rating * FEATURED_WEIGHTS.rating) +
      (normalized_scores.recency * FEATURED_WEIGHTS.recency) +
      (normalized_scores.editorial_boost * FEATURED_WEIGHTS.editorial_boost);
    
    return {
      ...game,
      featured_score,
      normalized_scores,
    };
  });
}

/**
 * Main function to get featured games with editorial override support
 */
export function getFeaturedGames(games: FeaturedGame[], limit: number = 6): ScoredGame[] {
  // Validation
  if (!games || games.length === 0) {
    return [];
  }
  
  if (limit <= 0) {
    return [];
  }
  
  // Calculate normalized scores for all games
  const scoredGames = calculateNormalizedScores(games);
  
  // Separate games with editorial override
  const overrideGames = scoredGames.filter(game => game.editorial_override);
  const regularGames = scoredGames.filter(game => !game.editorial_override);
  
  // Sort regular games by featured score (descending)
  const sortedRegularGames = regularGames.sort((a, b) => b.featured_score - a.featured_score);
  
  // Combine override games (at top) with sorted regular games
  const allGames = [...overrideGames, ...sortedRegularGames];
  
  // Return top N games
  return allGames.slice(0, limit);
}

/**
 * Get detailed analysis of the scoring system for debugging
 */
export function getFeaturedGamesAnalysis(games: FeaturedGame[], limit: number = 6) {
  const scoredGames = calculateNormalizedScores(games);
  const featuredGames = getFeaturedGames(games, limit);
  
  return {
    totalGames: games.length,
    requestedLimit: limit,
    returnedCount: featuredGames.length,
    overrideGames: featuredGames.filter(g => g.editorial_override).length,
    regularGames: featuredGames.filter(g => !g.editorial_override).length,
    scoreRange: {
      min: Math.min(...scoredGames.map(g => g.featured_score)),
      max: Math.max(...scoredGames.map(g => g.featured_score)),
      avg: scoredGames.reduce((sum, g) => sum + g.featured_score, 0) / scoredGames.length,
    },
    weights: FEATURED_WEIGHTS,
    featuredGames: featuredGames.map(game => ({
      id: game.id,
      title: game.title,
      featured_score: game.featured_score,
      editorial_override: game.editorial_override,
      editorial_boost: game.editorial_boost,
      normalized_scores: game.normalized_scores,
    })),
  };
}

/**
 * Update weights configuration (for future extensibility)
 */
export function updateFeaturedWeights(newWeights: Partial<typeof FEATURED_WEIGHTS>) {
  Object.assign(FEATURED_WEIGHTS, newWeights);
}

/**
 * Get current weights configuration
 */
export function getFeaturedWeights() {
  return { ...FEATURED_WEIGHTS };
}
