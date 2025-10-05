// Google Analytics utility functions

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
  }
}

export const GA_TRACKING_ID = 'G-WDPGB7PHH5'

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Common event tracking functions
export const trackGameVote = (gameId: string, gameTitle: string) => {
  event({
    action: 'vote',
    category: 'game_interaction',
    label: gameTitle,
  })
}

export const trackGameView = (gameId: string, gameTitle: string) => {
  event({
    action: 'view',
    category: 'game_interaction',
    label: gameTitle,
  })
}

export const trackGameFollow = (gameId: string, gameTitle: string) => {
  event({
    action: 'follow',
    category: 'game_interaction',
    label: gameTitle,
  })
}

export const trackGameComment = (gameId: string, gameTitle: string) => {
  event({
    action: 'comment',
    category: 'game_interaction',
    label: gameTitle,
  })
}

export const trackGameSubmission = (gameTitle: string) => {
  event({
    action: 'submit',
    category: 'game_submission',
    label: gameTitle,
  })
}

export const trackUserRegistration = () => {
  event({
    action: 'register',
    category: 'user_engagement',
  })
}

export const trackUserLogin = () => {
  event({
    action: 'login',
    category: 'user_engagement',
  })
}