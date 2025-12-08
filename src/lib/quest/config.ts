/**
 * Quest Recommendation Configuration
 * 
 * Centralized configuration for Quest recommendation scoring and matching.
 * This makes it easy to tune the recommendation algorithm.
 * 
 * ALL quiz answers must be mapped here - no unmapped answers should be silently ignored.
 */

export const QUEST_CONFIG = {
  /**
   * Scoring weights - determines how much each factor influences the final score
   * Higher weights = more important for ranking
   */
  weights: {
    platform: 5.0,      // Platform matching (CRITICAL - hard filter + score boost)
    genre: 4.0,          // Genre/category matching (most important after platform)
    tags: 3.0,           // Tag matching (very important)
    sessionLength: 2.0,  // Session duration matching
    monetization: 1.5,   // Monetization preference matching
    complexity: 1.5,     // Complexity matching (if available in data)
    artStyle: 1.0,       // Art style matching (if available in data)
    popularity: 1.0,     // Likes/upvotes (small influence)
    randomness: 0.3,     // Small random jitter for variety
  },

  /**
   * Answer to signals mapping
   * Maps ALL quiz answer keys to internal tags/genres/preferences
   * Format: questionId-optionId
   */
  answerToSignals: {
    // Session duration answers
    'session-duration-quick': {
      tags: ['short-sessions', 'quick-runs'],
      sessionLength: 'short' as const,
    },
    'session-duration-medium': {
      tags: ['medium-sessions'],
      sessionLength: 'medium' as const,
    },
    'session-duration-long': {
      tags: ['long-sessions'],
      sessionLength: 'long' as const,
    },

    // Genre/type answers
    'genre-action': {
      genres: ['Action', 'Arcade', 'Auto Battler', 'Battle Royale', 'Fighting', 'Gacha', 'Platformer', 'Shooter', 'Shooter FPS', 'Shooter TPS', 'Rhythm', 'Music', 'MOBA', 'Social MMO'],
      tags: ['fast-paced', 'realtime', 'action-packed'],
    },
    'genre-rpg': {
      genres: ['RPG', 'Adventure', 'Open World', 'Metroidvania', 'MMORPG', 'Strategy RPG', 'Simulation RPG'],
      tags: ['story-rich', 'character-progression', 'exploration'],
    },
    'genre-strategy': {
      genres: ['Strategy', 'Puzzle', 'Tower Defense', 'Tycoon', 'Sandbox', 'Sports Manager', 'Educational'],
      tags: ['tactics', 'turn-based', 'thinking'],
    },
    'genre-casual': {
      genres: ['Casual', 'Idle', 'Idle RPG', 'Creative Builder', 'Simulation', 'Survivor-like'],
      tags: ['cozy', 'relaxing', 'easy-to-learn'],
    },
    'genre-sports': {
      genres: ['Sports', 'Racing', 'Sports Manager'],
      tags: ['competitive', 'sports-themed'],
    },
    'genre-card': {
      // Roguelike/deckbuilder combo - CRITICAL for user feedback case
      genres: ['Card', 'Deckbuilder', 'Battle Card', 'Roguelike', 'Roguelite'],
      tags: ['run-based', 'procedural', 'permadeath', 'card-battler', 'synergy'],
    },

    // Platform answers
    'platform-mobile': {
      platforms: ['ios', 'android'],
    },
    'platform-ios': {
      platforms: ['ios'],
    },
    'platform-android': {
      platforms: ['android'],
    },
    'platform-web': {
      platforms: ['web'],
    },
    'platform-any': {
      platforms: [], // Empty = no platform filter
    },

    // Monetization answers
    'monetization-free': {
      tags: ['free-to-play', 'ads-ok'],
      monetization: ['FREE', 'FREEMIUM', 'ADS_SUPPORTED'],
    },
    'monetization-premium': {
      tags: ['premium', 'no-ads'],
      monetization: ['PAID'],
    },
    'monetization-subscription': {
      tags: ['subscription'],
      monetization: ['SUBSCRIPTION'],
    },

    // Favorite games (if added to quiz in future)
    'favorite-minecraft': {
      tags: ['sandbox', 'survival', 'crafting', 'building', 'open-world', 'exploration'],
      favoriteGameTags: ['Sandbox', 'Survival', 'Creative Builder', 'Open World', 'Exploration', 'Building'],
    },
    'favorite-slay-the-spire': {
      tags: ['deckbuilder', 'card-battler', 'roguelike', 'run-based', 'synergy'],
      favoriteGameTags: ['Roguelike', 'Deckbuilder', 'Card', 'Battle Card', 'Strategy'],
    },
    'favorite-stardew-valley': {
      tags: ['simulation', 'sandbox', 'rpg', 'creative-builder'],
      favoriteGameTags: ['Simulation', 'Sandbox', 'RPG', 'Creative Builder'],
    },
    'favorite-terraria': {
      tags: ['sandbox', 'adventure', 'survival', 'creative-builder', 'exploration'],
      favoriteGameTags: ['Sandbox', 'Adventure', 'Survival', 'Creative Builder', 'Exploration'],
    },
    'favorite-hades': {
      tags: ['roguelike', 'roguelite', 'action', 'adventure'],
      favoriteGameTags: ['Roguelike', 'Roguelite', 'Action', 'Adventure'],
    },
    'favorite-dead-cells': {
      tags: ['roguelike', 'roguelite', 'action', 'platformer', 'metroidvania'],
      favoriteGameTags: ['Roguelike', 'Roguelite', 'Action', 'Platformer', 'Metroidvania'],
    },
  },
} as const

/**
 * Platform label mapping for display
 */
export const PLATFORM_LABELS: Record<string, string> = {
  'ios': 'iOS',
  'android': 'Android',
  'web': 'Web',
  'windows': 'Windows',
  'mac': 'macOS',
  'switch': 'Nintendo Switch',
  'ps5': 'PlayStation 5',
  'xbox': 'Xbox',
  'tablet': 'Tablet',
}

/**
 * User Quest Profile
 * Normalized profile built from quiz answers
 */
export interface UserQuestProfile {
  platforms: string[]
  preferredGenres: string[]
  preferredTags: string[]
  sessionPreference?: 'short' | 'medium' | 'long'
  favoriteGameTags: string[]
  monetizationTags: string[]
  requiredMonetization?: string[]
}

/**
 * Match reason types for building explanations
 */
export interface QuestMatchReason {
  platforms: string[]
  genresMatched: string[]
  tagsMatched: string[]
  sessionMatch?: 'short' | 'medium' | 'long' | 'none'
  favoriteSimilarity?: boolean
  monetizationMatch?: string
}

/**
 * Build UserQuestProfile from raw quiz answers
 */
export function buildUserQuestProfile(
  rawAnswers: Array<{ questionId: string; optionId: string }>
): UserQuestProfile {
  const profile: UserQuestProfile = {
    platforms: [],
    preferredGenres: [],
    preferredTags: [],
    sessionPreference: undefined,
    favoriteGameTags: [],
    monetizationTags: [],
    requiredMonetization: undefined,
  }

  for (const answer of rawAnswers) {
    const answerKey = `${answer.questionId}-${answer.optionId}`
    const signals = QUEST_CONFIG.answerToSignals[answerKey as keyof typeof QUEST_CONFIG.answerToSignals]

    if (!signals) {
      // Log unmapped answer for debugging
      console.warn(`[QUEST] Unmapped answer: ${answerKey}`)
      continue
    }

    // Extract platforms
    if (signals.platforms) {
      profile.platforms.push(...signals.platforms)
    }

    // Extract genres
    if (signals.genres) {
      profile.preferredGenres.push(...signals.genres)
    }

    // Extract tags
    if (signals.tags) {
      profile.preferredTags.push(...signals.tags)
    }

    // Extract session length
    if (signals.sessionLength) {
      profile.sessionPreference = signals.sessionLength
    }

    // Extract favorite game tags (special handling)
    if (signals.favoriteGameTags) {
      profile.favoriteGameTags.push(...signals.favoriteGameTags)
    }

    // Extract monetization
    if (signals.monetization) {
      if (Array.isArray(signals.monetization)) {
        profile.requiredMonetization = signals.monetization
      } else {
        profile.requiredMonetization = [signals.monetization]
      }
    }

    // Extract monetization tags
    if (signals.tags) {
      const monetizationRelatedTags = signals.tags.filter(t => 
        t.includes('free') || t.includes('premium') || t.includes('subscription') || t.includes('ads')
      )
      if (monetizationRelatedTags.length > 0) {
        profile.monetizationTags.push(...monetizationRelatedTags)
      }
    }
  }

  // Deduplicate arrays
  profile.platforms = [...new Set(profile.platforms)]
  profile.preferredGenres = [...new Set(profile.preferredGenres)]
  profile.preferredTags = [...new Set(profile.preferredTags)]
  profile.favoriteGameTags = [...new Set(profile.favoriteGameTags)]
  profile.monetizationTags = [...new Set(profile.monetizationTags)]

  return profile
}
