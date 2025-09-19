/**
 * Leaderboard Configuration
 * 
 * This file contains configurable settings for the leaderboard scoring system.
 * Modify these values to adjust the scoring algorithm without changing the core logic.
 */

export interface ScoringWeights {
  VOTES: number;
  COMMENTS: number;
  FOLLOWS: number;
  VIEWS: number;
}

export interface LeaderboardConfig {
  scoringWeights: ScoringWeights;
  maxResults: number;
  cacheTTL: {
    DAILY: number;
    WEEKLY: number;
    MONTHLY: number;
  };
}

/**
 * Default scoring weights
 * These weights determine how much each metric contributes to the final score:
 * - Votes: 40% (most important for engagement)
 * - Comments: 30% (indicates discussion and interest)
 * - Follows: 20% (shows long-term interest)
 * - Views: 10% (basic visibility metric)
 */
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  VOTES: 0.4,
  COMMENTS: 0.3,
  FOLLOWS: 0.2,
  VIEWS: 0.1
};

/**
 * Default leaderboard configuration
 */
export const DEFAULT_LEADERBOARD_CONFIG: LeaderboardConfig = {
  scoringWeights: DEFAULT_SCORING_WEIGHTS,
  maxResults: 20,
  cacheTTL: {
    DAILY: 300,    // 5 minutes
    WEEKLY: 900,   // 15 minutes
    MONTHLY: 1800  // 30 minutes
  }
};

/**
 * Calculate final score using weighted metrics
 * @param votes Number of votes
 * @param comments Number of comments
 * @param follows Number of follows
 * @param views Number of views
 * @param weights Optional custom weights (uses default if not provided)
 * @returns Final score rounded to 2 decimal places
 */
export function calculateFinalScore(
  votes: number,
  comments: number,
  follows: number,
  views: number,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): number {
  const finalScore = (votes * weights.VOTES) + 
                    (comments * weights.COMMENTS) + 
                    (follows * weights.FOLLOWS) + 
                    (views * weights.VIEWS);
  
  return Math.round(finalScore * 100) / 100; // Round to 2 decimal places
}

/**
 * Validate that scoring weights sum to 1.0
 * @param weights Scoring weights to validate
 * @returns True if weights are valid
 */
export function validateScoringWeights(weights: ScoringWeights): boolean {
  const sum = weights.VOTES + weights.COMMENTS + weights.FOLLOWS + weights.VIEWS;
  return Math.abs(sum - 1.0) < 0.001; // Allow for small floating point errors
}

/**
 * Get scoring weights from environment variables or use defaults
 * This allows for runtime configuration via environment variables
 */
export function getScoringWeights(): ScoringWeights {
  // Check for environment variable overrides
  const envWeights = {
    VOTES: parseFloat(process.env.LEADERBOARD_VOTES_WEIGHT || '0.4'),
    COMMENTS: parseFloat(process.env.LEADERBOARD_COMMENTS_WEIGHT || '0.3'),
    FOLLOWS: parseFloat(process.env.LEADERBOARD_FOLLOWS_WEIGHT || '0.2'),
    VIEWS: parseFloat(process.env.LEADERBOARD_VIEWS_WEIGHT || '0.1')
  };

  // Validate the weights
  if (validateScoringWeights(envWeights)) {
    return envWeights;
  }

  // Fall back to defaults if environment weights are invalid
  console.warn('Invalid scoring weights from environment variables, using defaults');
  return DEFAULT_SCORING_WEIGHTS;
}
