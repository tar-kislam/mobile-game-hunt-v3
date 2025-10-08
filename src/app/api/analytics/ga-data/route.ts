import { NextRequest, NextResponse } from 'next/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

// Google Analytics 4 Property ID - bu değeri kendi GA4 property ID'nizle değiştirin
const GA4_PROPERTY_ID = 'WDPGB7PHH5' // GA_TRACKING_ID'den G- kısmını çıkarıyoruz

// Service Account credentials (production'da environment variable kullanın)
const credentials = {
  type: "service_account",
  project_id: "your-project-id", // Google Cloud Console'dan alın
  private_key_id: "your-private-key-id",
  private_key: "-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n",
  client_email: "your-service-account@your-project.iam.gserviceaccount.com",
  client_id: "your-client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com"
}

export async function GET(request: NextRequest) {
  try {
    // URL'den gameId parametresini al
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')
    
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 })
    }

    console.log('GA API called with gameId:', gameId)

    // Google Analytics Data API client'ını başlat
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: credentials
    })

    // Son 30 günlük verileri çek
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'country' },
        { name: 'language' },
        { name: 'deviceCategory' },
        { name: 'sessionSource' },
        { name: 'sessionMedium' }
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'users' },
        { name: 'screenPageViews' }
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'CONTAINS',
            value: `/games/${gameId}` // Oyun sayfasına gelen trafiği filtrele
          }
        }
      },
      limit: 1000
    })

    // Verileri işle
    const rows = response.rows || []
    
    // Ülke verilerini işle
    const countryCounts = new Map<string, number>()
    const languageCounts = new Map<string, number>()
    const deviceCounts = new Map<string, number>()
    const sourceCounts = new Map<string, number>()

    rows.forEach(row => {
      const dimensions = row.dimensionValues || []
      const metrics = row.metricValues || []
      
      const country = dimensions[0]?.value || 'Unknown'
      const language = dimensions[1]?.value || 'Unknown'
      const device = dimensions[2]?.value || 'Unknown'
      const source = dimensions[3]?.value || 'Unknown'
      const sessions = parseInt(metrics[0]?.value || '0')
      const users = parseInt(metrics[1]?.value || '0')

      // Ülke sayıları
      countryCounts.set(country, (countryCounts.get(country) || 0) + sessions)
      
      // Dil sayıları
      languageCounts.set(language, (languageCounts.get(language) || 0) + sessions)
      
      // Device sayıları
      deviceCounts.set(device, (deviceCounts.get(device) || 0) + sessions)
      
      // Traffic source sayıları
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + sessions)
    })

    // Sonuçları formatla
    const geoStats = Array.from(countryCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const languagePreferences = Array.from(languageCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    const deviceStats = Array.from(deviceCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const trafficSources = Array.from(sourceCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      gameId,
      data: {
        geoStats,
        languagePreferences,
        deviceStats,
        trafficSources,
        totalSessions: rows.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0'), 0),
        totalUsers: rows.reduce((sum, row) => sum + parseInt(row.metricValues?.[1]?.value || '0'), 0),
        totalPageViews: rows.reduce((sum, row) => sum + parseInt(row.metricValues?.[2]?.value || '0'), 0)
      },
      debug: {
        totalRows: rows.length,
        sampleRow: rows[0] ? {
          dimensions: rows[0].dimensionValues?.map(d => d.value),
          metrics: rows[0].metricValues?.map(m => m.value)
        } : null
      }
    })

  } catch (error) {
    console.error('Google Analytics API Error:', error)
    
    // Development için fallback data döndür
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: false,
        error: 'GA API not configured (development mode)',
        fallback: {
          geoStats: [
            { country: 'United States', count: 45 },
            { country: 'Turkey', count: 32 },
            { country: 'Germany', count: 28 },
            { country: 'United Kingdom', count: 22 },
            { country: 'France', count: 18 }
          ],
          languagePreferences: [
            { name: 'en', value: 85 },
            { name: 'tr', value: 42 },
            { name: 'de', value: 28 },
            { name: 'fr', value: 22 },
            { name: 'es', value: 18 }
          ],
          deviceStats: [
            { name: 'mobile', value: 120 },
            { name: 'desktop', value: 45 },
            { name: 'tablet', value: 12 }
          ],
          trafficSources: [
            { name: 'google', value: 65 },
            { name: 'direct', value: 32 },
            { name: 'facebook', value: 18 },
            { name: 'twitter', value: 12 },
            { name: 'reddit', value: 8 }
          ],
          totalSessions: 177,
          totalUsers: 143,
          totalPageViews: 234
        }
      })
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch Google Analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
