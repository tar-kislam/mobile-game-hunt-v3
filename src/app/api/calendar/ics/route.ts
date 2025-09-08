import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generate ICS content for a product
function generateEventICS(product: any): string {
  const eventId = `game-release-${product.id}`;
  const startDate = new Date(product.releaseAt);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
  
  // Format dates for ICS (YYYYMMDDTHHMMSSZ)
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const start = formatDate(startDate);
  const end = formatDate(endDate);
  const created = formatDate(new Date(product.createdAt));
  const lastModified = formatDate(new Date(product.updatedAt));

  // Escape special characters in text fields
  const escapeText = (text: string) => {
    return text
      .replace(/[\\;,]/g, '\\$&')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  };

  const title = escapeText(product.title);
  const description = escapeText(product.description);
  const url = escapeText(product.url);
  const platforms = product.platforms?.join(', ') || 'Unknown';
  const countries = product.countries?.join(', ') || 'Global';

  return [
    `BEGIN:VEVENT`,
    `UID:${eventId}`,
    `DTSTAMP:${created}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title} Release`,
    `DESCRIPTION:${description}\\n\\nPlatforms: ${platforms}\\nCountries: ${countries}\\n\\nMore info: ${url}`,
    `URL:${url}`,
    `LOCATION:${countries}`,
    `CATEGORIES:Game Release,Mobile Game`,
    `STATUS:CONFIRMED`,
    `SEQUENCE:0`,
    `CREATED:${created}`,
    `LAST-MODIFIED:${lastModified}`,
    `END:VEVENT`
  ].join('\r\n');
}

// Generate full ICS calendar
function generateICS(products: any[]): string {
  const now = new Date();
  const calendarId = `mobile-game-hunt-${now.getFullYear()}`;
  const created = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const header = [
    `BEGIN:VCALENDAR`,
    `VERSION:2.0`,
    `PRODID:-//Mobile Game Hunt//Game Release Calendar//EN`,
    `CALSCALE:GREGORIAN`,
    `METHOD:PUBLISH`,
    `X-WR-CALNAME:Mobile Game Hunt - Release Calendar`,
    `X-WR-CALDESC:Global mobile game and app release dates`,
    `X-WR-TIMEZONE:UTC`,
    `CREATED:${created}`,
    `LAST-MODIFIED:${created}`
  ].join('\r\n');

  const events = products
    .filter(product => product.releaseAt && product.status === 'PUBLISHED')
    .map(generateEventICS)
    .join('\r\n');

  const footer = `END:VCALENDAR`;

  return `${header}\r\n${events}\r\n${footer}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const country = searchParams.get('country');
    const categoryId = searchParams.get('categoryId');
    const year = searchParams.get('year');

    // Build where clause
    const whereClause: any = {
      releaseAt: { not: null },
      status: 'PUBLISHED'
    };

    if (platform && platform !== 'all') {
      whereClause.platforms = { has: platform.toLowerCase() };
    }

    if (country && country !== 'all') {
      whereClause.countries = { has: country.toUpperCase() };
    }

    if (categoryId && categoryId !== 'all') {
      whereClause.categories = {
        some: {
          categoryId: categoryId
        }
      };
    }

    if (year) {
      const yearInt = parseInt(year);
      if (!isNaN(yearInt)) {
        whereClause.releaseAt = {
          gte: new Date(yearInt, 0, 1),
          lt: new Date(yearInt + 1, 0, 1)
        };
      }
    }

    // Fetch products with release dates
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        releaseAt: 'asc'
      }
    });

    // Generate ICS content
    const icsContent = generateICS(products);

    // Set response headers
    const headers = new Headers();
    headers.set('Content-Type', 'text/calendar; charset=utf-8');
    headers.set('Content-Disposition', 'attachment; filename="mobile-game-hunt-calendar.ics"');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return new NextResponse(icsContent, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('ICS Calendar API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate calendar' },
      { status: 500 }
    );
  }
}
