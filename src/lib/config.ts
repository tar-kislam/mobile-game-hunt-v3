/**
 * Feature flags and configuration
 * Centralized configuration for enabling/disabling features
 */

export const config = {
  // Blog feature flag
  BLOG_ENABLED: process.env.BLOG_ENABLED === 'true',
  
  // Other feature flags can be added here
  // EXAMPLE_FEATURE: process.env.EXAMPLE_FEATURE === 'true',
} as const

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof config): boolean {
  return config[feature] as boolean
}

/**
 * Get all feature flags (useful for debugging)
 */
export function getAllFeatureFlags() {
  return config
}
