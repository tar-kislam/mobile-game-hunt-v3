// Simple country detection from IP address
// For production, consider using a service like ipapi.co, ipgeolocation.io, or MaxMind

export interface GeoInfo {
  country: string
  countryCode: string
  language: string
}

// Simple country detection based on IP ranges (basic implementation)
export function detectCountryFromIP(ipAddress: string): GeoInfo {
  // Remove IPv6 prefix if present
  const cleanIP = ipAddress.replace(/^::ffff:/, '')
  
  // Basic country detection (you can expand this)
  const ipRanges: Record<string, { country: string; countryCode: string; language: string }> = {
    '192.168.': { country: 'United States', countryCode: 'US', language: 'en' },
    '10.0.': { country: 'United States', countryCode: 'US', language: 'en' },
    '172.16.': { country: 'United States', countryCode: 'US', language: 'en' },
    // Add more ranges as needed
  }
  
  // Check if IP matches any known ranges
  for (const [range, info] of Object.entries(ipRanges)) {
    if (cleanIP.startsWith(range)) {
      return info
    }
  }
  
  // Default fallback
  return {
    country: 'Unknown',
    countryCode: 'XX',
    language: 'en'
  }
}

// Detect language from user agent
export function detectLanguageFromUserAgent(userAgent: string): string {
  if (!userAgent) return 'en'
  
  const ua = userAgent.toLowerCase()
  
  // Common language patterns in user agents
  if (ua.includes('tr-tr') || ua.includes('tr_tr')) return 'tr'
  if (ua.includes('de-de') || ua.includes('de_de')) return 'de'
  if (ua.includes('fr-fr') || ua.includes('fr_fr')) return 'fr'
  if (ua.includes('es-es') || ua.includes('es_es')) return 'es'
  if (ua.includes('it-it') || ua.includes('it_it')) return 'it'
  if (ua.includes('pt-br') || ua.includes('pt_br')) return 'pt'
  if (ua.includes('ru-ru') || ua.includes('ru_ru')) return 'ru'
  if (ua.includes('ja-jp') || ua.includes('ja_jp')) return 'ja'
  if (ua.includes('ko-kr') || ua.includes('ko_kr')) return 'ko'
  if (ua.includes('zh-cn') || ua.includes('zh_cn')) return 'zh'
  
  return 'en' // Default to English
}

// Combined detection function
export function detectGeoInfo(ipAddress: string, userAgent: string): GeoInfo {
  const ipInfo = detectCountryFromIP(ipAddress)
  const language = detectLanguageFromUserAgent(userAgent)
  
  return {
    country: ipInfo.country,
    countryCode: ipInfo.countryCode,
    language
  }
}
