import { z } from 'zod'

export const productMainInfoSchema = z.object({
  title: z.string().min(1, 'Game title is required').max(40, 'Game title must be 40 characters or less'),
  tagline: z.string().min(1, 'Tagline is required').max(60, 'Tagline must be 60 characters or less'),
  description: z.string().min(260, 'Description must be at least 260 characters').max(500, 'Description must be 500 characters or less'),
  iosUrl: z.string().url('Please enter a valid App Store URL').refine(
    (url) => {
      if (!url) return true
      const appStorePattern = /^https?:\/\/(apps\.apple\.com|itunes\.apple\.com)\/.*/i
      return appStorePattern.test(url)
    },
    'Please enter a valid App Store URL'
  ).optional().or(z.literal('')),
  androidUrl: z.string().url('Please enter a valid Google Play URL').refine(
    (url) => {
      if (!url) return true
      const playStorePattern = /^https?:\/\/(play\.google\.com|market\.android\.com)\/.*/i
      return playStorePattern.test(url)
    },
    'Please enter a valid Google Play URL'
  ).optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  discordUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  tiktokUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  redditUrl: z.string().url().optional().or(z.literal('')),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  isOpenSource: z.boolean().default(false),
  categories: z.array(z.string()).min(1, 'At least one category is required').max(3, 'Maximum 3 categories allowed'),
  platforms: z.array(z.string()).min(1, 'At least one platform is required').max(5, 'Maximum 5 platforms allowed'),
  targetCountries: z.array(z.string()).optional().default([]),
  languages: z.array(z.object({
    name: z.string(),
    interface: z.boolean().default(false),
    audio: z.boolean().default(false),
    subtitles: z.boolean().default(false)
  })).optional().default([]),
}).refine(
  (data) => {
    // At least one of iosUrl or androidUrl must be provided
    return (data.iosUrl && data.iosUrl.trim() !== '') || (data.androidUrl && data.androidUrl.trim() !== '')
  },
  {
    message: 'At least one app store URL (iOS or Android) is required',
    path: ['iosUrl'] // This will show the error on the iosUrl field
  }
)

export const productMediaSchema = z.object({
  image: z.string().url().optional().or(z.literal('')),
  images: z.array(z.string().url()).optional().default([]),
  video: z.string().url().optional().or(z.literal('')),
  thumbnail: z.string().url('Please enter a valid thumbnail URL').optional().or(z.literal('')),
  gallery: z.array(z.string().url('Please enter valid gallery image URLs')).min(1, 'At least one gallery image is required').max(10, 'Maximum 10 gallery images allowed').optional().default([]),
  youtubeUrl: z.string().url('Please enter a valid YouTube URL').optional().or(z.literal('')).refine(
    (url) => {
      if (!url) return true
      const youtubePattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i
      return youtubePattern.test(url)
    },
    'Please enter a valid YouTube URL'
  ),
  gameplayGifUrl: z.string().url('Please enter a valid GIF URL').optional().or(z.literal('')),
  demoUrl: z.string().url('Please enter a valid demo URL').optional().or(z.literal('')),
})

export const productMakersSchema = z.object({
  makers: z.array(z.object({ 
    userId: z.string().optional(), 
    email: z.string().email().optional(),
    role: z.enum(['MAKER', 'DESIGNER', 'DEVELOPER', 'PUBLISHER', 'HUNTER']).default('MAKER'),
    isCreator: z.boolean().default(false)
  })).min(1, 'At least one maker is required').max(5, 'Maximum 5 makers allowed'),
  studioName: z.string().max(80, 'Studio name must be 80 characters or less').optional().or(z.literal('')),
  inviteEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  inviteRole: z.enum(['MAKER', 'DESIGNER', 'DEVELOPER', 'PUBLISHER', 'HUNTER']).default('MAKER')
})

export const productExtrasSchema = z.object({
  iosUrl: z.string().url().optional().or(z.literal('')),
  androidUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  platforms: z.array(z.string()).min(1),
  releaseAt: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).max(10).optional().default([]),
  categories: z.array(z.string()).min(1).max(3) // Category IDs, max 3 categories
})

export const productChecklistSchema = z.object({
  termsAccepted: z.boolean().refine(v => v, 'You must accept the terms'),
  confirmImagesOwned: z.boolean().refine(v => v, 'Confirm image rights')
})

export const productLaunchDetailsSchema = z.object({
  launchType: z.enum(['SOFT_LAUNCH', 'GLOBAL_LAUNCH']).optional(),
  launchDate: z.string().optional(),
  softLaunchCountries: z.array(z.string()).optional(),
  monetization: z.enum(['FREE', 'PAID', 'FREEMIUM', 'ADS_SUPPORTED', 'SUBSCRIPTION']).optional(),
  engine: z.enum(['UNITY', 'UNREAL', 'GODOT', 'CUSTOM']).optional(),
  pressKit: z.object({
    headline: z.string().min(1, 'Headline is required').max(100, 'Headline must be 100 characters or less'),
    about: z.string().min(10, 'About must be at least 10 characters').max(500, 'About must be 500 characters or less'),
    features: z.array(z.string().min(1, 'Feature cannot be empty')).min(1, 'At least one feature is required').max(10, 'Maximum 10 features allowed'),
    media: z.array(z.string()).optional()
  }).optional()
})

export const productCommunityExtrasSchema = z.object({
  promoOffer: z.string().optional(),
  promoCode: z.string().optional(),
  promoExpiry: z.string().optional(),
  playtestQuota: z.number().min(1, 'Quota must be at least 1').max(1000, 'Quota cannot exceed 1000').optional(),
  playtestExpiry: z.string().optional(),
  sponsorRequest: z.boolean().default(false),
  sponsorNote: z.string().max(500, 'Sponsor note must be 500 characters or less').optional(),
  crowdfundingPledge: z.boolean().default(false),
  gamificationTags: z.array(z.string()).min(1, 'At least 1 gamification tag is required').max(5, 'Maximum 5 gamification tags allowed')
})

export const productFullSchema = productMainInfoSchema
  .and(productMediaSchema)
  .and(productMakersSchema)
  .and(productExtrasSchema)
  .and(productLaunchDetailsSchema)
  .and(productCommunityExtrasSchema)
  .and(productChecklistSchema)

export type ProductMainInfoInput = z.infer<typeof productMainInfoSchema>
export type ProductMediaInput = z.infer<typeof productMediaSchema>
export type ProductMakersInput = z.infer<typeof productMakersSchema>
export type ProductExtrasInput = z.infer<typeof productExtrasSchema>
export type ProductChecklistInput = z.infer<typeof productChecklistSchema>
export type ProductLaunchDetailsInput = z.infer<typeof productLaunchDetailsSchema>
export type ProductCommunityExtrasInput = z.infer<typeof productCommunityExtrasSchema>
export type ProductFullInput = z.infer<typeof productFullSchema>
