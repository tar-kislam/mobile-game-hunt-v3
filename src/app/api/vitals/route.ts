import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for web vitals data
const vitalsSchema = z.object({
  name: z.enum(['CLS', 'FID', 'FCP', 'LCP', 'TTFB', 'INP']),
  value: z.number(),
  delta: z.number(),
  id: z.string(),
  navigationType: z.string().optional(),
  rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
});

const vitalsRequestSchema = z.object({
  vitals: z.array(vitalsSchema),
  url: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = vitalsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid vitals data', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { vitals, url, userAgent, timestamp } = parsed.data;

    // Log vitals data for monitoring
    console.log('📊 Web Vitals Report:', {
      timestamp: timestamp || Date.now(),
      url: url || 'unknown',
      userAgent: userAgent || 'unknown',
      vitals: vitals.map(v => ({
        name: v.name,
        value: v.value,
        delta: v.delta,
        rating: v.rating,
      })),
    });

    // Check performance thresholds
    const performanceIssues = [];
    
    vitals.forEach(vital => {
      switch (vital.name) {
        case 'LCP':
          if (vital.value > 2500) {
            performanceIssues.push(`LCP too slow: ${vital.value}ms (threshold: 2500ms)`);
          }
          break;
        case 'FID':
        case 'INP':
          if (vital.value > 200) {
            performanceIssues.push(`${vital.name} too slow: ${vital.value}ms (threshold: 200ms)`);
          }
          break;
        case 'CLS':
          if (vital.value > 0.1) {
            performanceIssues.push(`CLS too high: ${vital.value} (threshold: 0.1)`);
          }
          break;
        case 'FCP':
          if (vital.value > 1800) {
            performanceIssues.push(`FCP too slow: ${vital.value}ms (threshold: 1800ms)`);
          }
          break;
        case 'TTFB':
          if (vital.value > 800) {
            performanceIssues.push(`TTFB too slow: ${vital.value}ms (threshold: 800ms)`);
          }
          break;
      }
    });

    // Return response with performance analysis
    return NextResponse.json({
      success: true,
      message: 'Vitals data received',
      performanceIssues,
      summary: {
        totalVitals: vitals.length,
        issuesCount: performanceIssues.length,
        timestamp: timestamp || Date.now(),
      },
    });

  } catch (error) {
    console.error('Error processing vitals data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Web Vitals API is running',
    timestamp: Date.now(),
  });
}
