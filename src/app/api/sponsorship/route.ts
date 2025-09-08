import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const sponsorshipSchema = z.object({
  title: z.string().min(1, 'Game title is required').max(100, 'Title must be less than 100 characters'),
  gameUrl: z.string().url('Please enter a valid URL'),
  developer: z.string().min(1, 'Developer name is required').max(100, 'Developer name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  slot: z.string().min(1, 'Please select an advertising slot'),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = sponsorshipSchema.parse(body);

    // Create sponsorship request
    const sponsorshipRequest = await prisma.sponsorshipRequest.create({
      data: {
        title: validatedData.title,
        gameUrl: validatedData.gameUrl,
        developer: validatedData.developer,
        email: validatedData.email,
        slot: validatedData.slot,
        notes: validatedData.notes || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Sponsorship request submitted successfully',
        id: sponsorshipRequest.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating sponsorship request:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to submit sponsorship request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');

    const where: any = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      where.status = status;
    }

    const take = limit ? parseInt(limit, 10) : 50;
    const skip = page ? (parseInt(page, 10) - 1) * take : 0;

    const requests = await prisma.sponsorshipRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take,
      skip,
    });

    const total = await prisma.sponsorshipRequest.count({ where });

    return NextResponse.json({
      requests,
      total,
      page: page ? parseInt(page, 10) : 1,
      limit: take,
    });
  } catch (error) {
    console.error('Error fetching sponsorship requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sponsorship requests' },
      { status: 500 }
    );
  }
}
