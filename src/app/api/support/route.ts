import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSupportMessageEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, message } = body;

    // Validate required fields
    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Store the support message in the database
    const supportMessage = await prisma.supportMessage.create({
      data: {
        email: email.trim().toLowerCase(),
        message: message.trim(),
      },
    });

    // Send email notification to info@mobilegamehunt.com
    const emailResult = await sendSupportMessageEmail(email.trim(), message.trim());
    
    if (!emailResult.success) {
      console.error(`Failed to send support email notification: ${emailResult.error}`);
      // Continue even if email fails - message is still saved to database
    }

    // Log the support message for monitoring
    console.log(`New support message received from ${email}:`, {
      id: supportMessage.id,
      timestamp: supportMessage.createdAt,
      messageLength: message.length,
      emailSent: emailResult.success,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Support message sent successfully',
        id: supportMessage.id,
        emailSent: emailResult.success
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Support form submission error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve support messages (admin only)
export async function GET(request: NextRequest) {
  try {
    // In a real application, you'd want to add authentication here
    // For now, we'll just return a simple response
    const searchParams = request.nextUrl.searchParams;
    const adminKey = searchParams.get('admin_key');
    
    // Simple admin key check (in production, use proper authentication)
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const messages = await prisma.supportMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 messages
    });

    return NextResponse.json({
      success: true,
      messages,
      count: messages.length,
    });

  } catch (error) {
    console.error('Error fetching support messages:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
