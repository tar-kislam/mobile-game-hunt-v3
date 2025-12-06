import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Internal Health Check Endpoint
 * 
 * SECURITY: This endpoint requires authentication and provides detailed system information.
 * Use this for internal monitoring, not for public health checks.
 * 
 * Public health checks should use /api/health which returns minimal information.
 */
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication for internal health check
    const session = await getServerSession(authOptions)
    
    // Only allow admin/editor roles
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Get detailed system info (only for authenticated admins/editors)
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV,
      database: "connected",
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        external: Math.round((process.memoryUsage().external / 1024 / 1024) * 100) / 100,
      },
      nodeVersion: process.version,
    }

    return NextResponse.json(healthData, { status: 200 })
  } catch (error) {
    console.error("Internal health check failed:", error)
    
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    )
  }
}

