export type QuizAnswerEffect = {
  addTags?: string[]
  requireTags?: string[]
  categoryNames?: string[]  // Category names to match
  platforms?: string[]  // Platform values to match
  filters?: { [key: string]: any }
  weightBoost?: number
}

export interface QuizOption {
  id: string
  label: string
  description?: string  // Optional description/subtitle for options
  effects: QuizAnswerEffect[]
}

export interface QuizQuestion {
  id: string
  title: string
  helperText?: string
  options: QuizOption[]
}

// Category to pace/session mapping - automatically determines pace based on category
export const categoryToAttributesMap: Record<string, { 
  pace: 'chill' | 'fast' | 'strategy'
  sessionLength: 'quick' | 'medium' | 'long'
  complexity: 'simple' | 'medium' | 'complex'
}> = {
  'Action': { pace: 'fast', sessionLength: 'medium', complexity: 'medium' },
  'Adventure': { pace: 'medium', sessionLength: 'long', complexity: 'medium' },
  'RPG': { pace: 'strategy', sessionLength: 'long', complexity: 'complex' },
  'Strategy': { pace: 'strategy', sessionLength: 'long', complexity: 'complex' },
  'Puzzle': { pace: 'strategy', sessionLength: 'medium', complexity: 'medium' },
  'Shooter': { pace: 'fast', sessionLength: 'medium', complexity: 'complex' },
  'Simulation': { pace: 'chill', sessionLength: 'long', complexity: 'complex' },
  'Sports': { pace: 'fast', sessionLength: 'medium', complexity: 'medium' },
  'Racing': { pace: 'fast', sessionLength: 'quick', complexity: 'simple' },
  'Casual': { pace: 'chill', sessionLength: 'quick', complexity: 'simple' },
  'Arcade': { pace: 'fast', sessionLength: 'quick', complexity: 'simple' },
  'Fighting': { pace: 'fast', sessionLength: 'quick', complexity: 'complex' },
  'Card': { pace: 'strategy', sessionLength: 'medium', complexity: 'medium' },
  'MOBA': { pace: 'fast', sessionLength: 'long', complexity: 'complex' },
  'Idle': { pace: 'chill', sessionLength: 'quick', complexity: 'simple' },
  'Music': { pace: 'fast', sessionLength: 'medium', complexity: 'medium' },
  'Educational': { pace: 'strategy', sessionLength: 'medium', complexity: 'medium' },
  'Platformer': { pace: 'fast', sessionLength: 'medium', complexity: 'medium' },
  'Roguelike': { pace: 'fast', sessionLength: 'long', complexity: 'complex' },
  'Sandbox': { pace: 'chill', sessionLength: 'long', complexity: 'complex' },
  'Battle Royale': { pace: 'fast', sessionLength: 'long', complexity: 'complex' },
  'Survivor-like': { pace: 'fast', sessionLength: 'medium', complexity: 'simple' },
  'Auto Battler': { pace: 'strategy', sessionLength: 'long', complexity: 'medium' },
  'Deckbuilder': { pace: 'strategy', sessionLength: 'long', complexity: 'medium' },
  'Metroidvania': { pace: 'fast', sessionLength: 'long', complexity: 'complex' },
  'Tower Defense': { pace: 'strategy', sessionLength: 'medium', complexity: 'medium' },
  'Idle RPG': { pace: 'chill', sessionLength: 'quick', complexity: 'simple' },
  'Tycoon': { pace: 'chill', sessionLength: 'long', complexity: 'complex' },
  'MMORPG': { pace: 'strategy', sessionLength: 'long', complexity: 'complex' },
  'Open World': { pace: 'chill', sessionLength: 'long', complexity: 'complex' },
  'Strategy RPG': { pace: 'strategy', sessionLength: 'long', complexity: 'complex' },
  'Rhythm': { pace: 'fast', sessionLength: 'medium', complexity: 'medium' },
  'Gacha': { pace: 'chill', sessionLength: 'quick', complexity: 'simple' },
  'Battle Card': { pace: 'strategy', sessionLength: 'medium', complexity: 'medium' },
  'Roguelite': { pace: 'fast', sessionLength: 'long', complexity: 'medium' },
  'Social MMO': { pace: 'chill', sessionLength: 'long', complexity: 'simple' },
  'Shooter FPS': { pace: 'fast', sessionLength: 'medium', complexity: 'complex' },
  'Shooter TPS': { pace: 'fast', sessionLength: 'medium', complexity: 'complex' },
  'Sports Manager': { pace: 'strategy', sessionLength: 'long', complexity: 'complex' },
  'Creative Builder': { pace: 'chill', sessionLength: 'long', complexity: 'complex' },
  'Simulation RPG': { pace: 'strategy', sessionLength: 'long', complexity: 'complex' }
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'session-duration',
    title: 'How much time do you usually play in one session?',
    helperText: 'This helps us understand your play style (optional)',
    options: [
      {
        id: 'quick',
        label: '1–5 minutes (quick sessions)',
        effects: [
          {
            // Very low weight - just informational
            weightBoost: 1.0
          }
        ]
      },
      {
        id: 'medium',
        label: '10–20 minutes',
        effects: [
          {
            weightBoost: 1.0
          }
        ]
      },
      {
        id: 'long',
        label: 'Long sessions (30+ minutes)',
        effects: [
          {
            weightBoost: 1.0
          }
        ]
      }
    ]
  },
  {
    id: 'genre',
    title: 'Which genre do you feel like playing today?',
    helperText: 'Choose your preferred game style',
    options: [
      {
        id: 'action',
        label: 'Action',
        effects: [
          {
            addTags: [
              'Action',
              'Arcade',
              'Auto Battler',
              'Battle Royale',
              'Fighting',
              'Gacha',
              'Platformer',
              'Shooter',
              'Shooter FPS',
              'Shooter TPS',
              'Rhythm',
              'Music',
              'MOBA',
              'Social MMO'
            ],
            weightBoost: 2.5
          }
        ]
      },
      {
        id: 'rpg',
        label: 'RPG / Adventure',
        effects: [
          {
            addTags: [
              'RPG',
              'Adventure',
              'Open World',
              'Metroidvania',
              'MMORPG',
              'Strategy RPG',
              'Simulation RPG'
            ],
            weightBoost: 2.5
          }
        ]
      },
      {
        id: 'strategy',
        label: 'Strategy / Puzzle',
        effects: [
          {
            addTags: [
              'Strategy',
              'Puzzle',
              'Tower Defense',
              'Tycoon',
              'Sandbox',
              'Sports Manager',
              'Educational'
            ],
            weightBoost: 2.5
          }
        ]
      },
      {
        id: 'casual',
        label: 'Casual / Hyper-casual',
        effects: [
          {
            addTags: [
              'Casual',
              'Idle',
              'Idle RPG',
              'Creative Builder',
              'Simulation',
              'Survivor-like'
            ],
            weightBoost: 2.5
          }
        ]
      },
      {
        id: 'sports',
        label: 'Sports / Racing',
        effects: [
          {
            addTags: [
              'Sports',
              'Racing',
              'Sports Manager'
            ],
            weightBoost: 2.5
          }
        ]
      },
      {
        id: 'card',
        label: 'Card / Roguelike',
        effects: [
          {
            addTags: [
              'Card',
              'Deckbuilder',
              'Battle Card',
              'Roguelike',
              'Roguelite'
            ],
            weightBoost: 2.5
          }
        ]
      }
    ]
  },
  {
    id: 'platform',
    title: 'Which platform do you want to play on?',
    helperText: 'Select the platform(s) you prefer (matches games based on platforms field from submissions)',
    options: [
      {
        id: 'mobile',
        label: 'Mobile (iOS / Android)',
        effects: [
          {
            platforms: ['ios', 'android'],
            weightBoost: 2.0
          }
        ]
      },
      {
        id: 'ios',
        label: 'iOS',
        effects: [
          {
            platforms: ['ios'],
            weightBoost: 2.0
          }
        ]
      },
      {
        id: 'android',
        label: 'Android',
        effects: [
          {
            platforms: ['android'],
            weightBoost: 2.0
          }
        ]
      },
      {
        id: 'web',
        label: 'Web Browser',
        effects: [
          {
            platforms: ['web'],
            weightBoost: 2.0
          }
        ]
      },
      {
        id: 'any',
        label: 'Any platform is fine',
        effects: []
      }
    ]
  },
  {
    id: 'monetization',
    title: 'What\'s your wallet saying? 💰',
    helperText: 'Choose how you like to spend (or not spend) your coins',
    options: [
      {
        id: 'free',
        label: 'Free',
        description: 'Completely free to play, freemium, or ad-supported games',
        effects: [
          {
            // Match FREE, FREEMIUM, or ADS_SUPPORTED monetization
            // We'll handle this in the recommendation logic
            filters: { monetization: ['FREE', 'FREEMIUM', 'ADS_SUPPORTED'] },
            weightBoost: 1.5
          }
        ]
      },
      {
        id: 'premium',
        label: 'Paid',
        description: 'One-time purchase required',
        effects: [
          {
            filters: { monetization: 'PAID' },
            weightBoost: 1.3
          }
        ]
      },
      {
        id: 'subscription',
        label: 'Subscription',
        description: 'Monthly or yearly subscription model',
        effects: [
          {
            filters: { monetization: 'SUBSCRIPTION' },
            weightBoost: 1.2
          }
        ]
      }
    ]
  }
]

// Helper function to aggregate effects from selected answers
export function aggregateQuizEffects(selectedAnswers: { questionId: string; optionId: string }[]): {
  desiredTags: string[]
  desiredCategoryNames: string[]
  desiredPlatforms: string[]
  requiredFilters: { [key: string]: any }
  weightBoosts: number[]
} {
  const desiredTags: string[] = []
  const desiredCategoryNames: string[] = []
  const desiredPlatforms: string[] = []
  const requiredFilters: { [key: string]: any } = {}
  const weightBoosts: number[] = []

  // List of valid category names from the system
  const validCategoryNames = new Set([
    'Action', 'Adventure', 'Arcade', 'Auto Battler', 'Battle Card', 'Battle Royale', 'Card',
    'Casual', 'Creative Builder', 'Deckbuilder', 'Educational', 'Fighting', 'Gacha', 'Idle',
    'Idle RPG', 'Metroidvania', 'MMORPG', 'MOBA', 'Music', 'Open World', 'Platformer', 'Puzzle',
    'Racing', 'Rhythm', 'Roguelike', 'Roguelite', 'RPG', 'Sandbox', 'Shooter', 'Shooter FPS',
    'Shooter TPS', 'Simulation', 'Simulation RPG', 'Social MMO', 'Sports', 'Sports Manager',
    'Strategy', 'Strategy RPG', 'Survivor-like', 'Tower Defense', 'Tycoon'
  ])

  selectedAnswers.forEach(({ questionId, optionId }) => {
    const question = quizQuestions.find(q => q.id === questionId)
    if (!question) return

    const option = question.options.find(o => o.id === optionId)
    if (!option) return

    option.effects.forEach(effect => {
      if (effect.addTags) {
        // Add all tags to desiredTags
        desiredTags.push(...effect.addTags)
        
        // Also extract category names from addTags for category matching
        // If a tag matches a valid category name, add it to desiredCategoryNames
        effect.addTags.forEach(tag => {
          if (validCategoryNames.has(tag)) {
            desiredCategoryNames.push(tag)
          }
        })
      }
      if (effect.requireTags) {
        desiredTags.push(...effect.requireTags)
        effect.requireTags.forEach(tag => {
          if (validCategoryNames.has(tag)) {
            desiredCategoryNames.push(tag)
          }
        })
      }
      // Keep categoryNames for backward compatibility
      if (effect.categoryNames) {
        desiredCategoryNames.push(...effect.categoryNames)
      }
      if (effect.platforms) {
        desiredPlatforms.push(...effect.platforms)
      }
      if (effect.filters) {
        Object.assign(requiredFilters, effect.filters)
      }
      if (effect.weightBoost) {
        weightBoosts.push(effect.weightBoost)
      }
    })
  })

  // Remove duplicates
  const uniqueTags = Array.from(new Set(desiredTags.map(t => t.toLowerCase())))
  const uniqueCategories = Array.from(new Set(desiredCategoryNames))
  const uniquePlatforms = Array.from(new Set(desiredPlatforms))

  return {
    desiredTags: uniqueTags,
    desiredCategoryNames: uniqueCategories,
    desiredPlatforms: uniquePlatforms,
    requiredFilters,
    weightBoosts
  }
}
