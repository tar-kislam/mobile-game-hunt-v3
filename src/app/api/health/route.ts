import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'

// SECURITY: Public health check - minimal information to prevent information disclosure
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // SECURITY: Return minimal response for public health checks
    // Detailed system info should be in internal health check endpoint
    return NextResponse.json({ status: "healthy" }, { status: 200 })
  } catch (error) {
    console.error("Health check failed:", error)
    
    // SECURITY: Don't expose error details in public endpoint
    return NextResponse.json({ status: "unhealthy" }, { status: 503 })
  }
}

export async function HEAD() {
  // Simple health check for load balancers
  try {
    await prisma.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
