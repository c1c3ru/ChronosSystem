import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getNowInFortaleza } from '@/lib/timezone'
import { redisHealthCheck } from '@/lib/redis'
import { isSmtpConfigured } from '@/lib/mailer'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`

    // Check Redis connection
    const redisHealth = await redisHealthCheck()

    // Get basic stats
    const [userCount, machineCount] = await Promise.all([
      prisma.user.count(),
      prisma.machine.count(),
    ])

    const smtpConfigured = isSmtpConfigured()

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: getNowInFortaleza().toISOString(),
        version: process.env.npm_package_version || '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: 'connected',
          users: userCount,
          machines: machineCount,
        },
        redis: {
          status: redisHealth.healthy ? 'connected' : 'disconnected',
          message: redisHealth.message,
        },
        email: {
          // Não expõe valores, apenas se SMTP_HOST/USER/PASSWORD/FROM estão
          // todos configurados. Sem isso, e-mails falham silenciosamente.
          status: smtpConfigured ? 'configured' : 'not_configured',
          message: smtpConfigured
            ? 'SMTP configurado'
            : 'SMTP não configurado — e-mails (reset de senha, lembretes, justificativas) não estão sendo enviados',
        },
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error('Health check failed', { error: errorMessage })

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: getNowInFortaleza().toISOString(),
        error: 'Database connection failed',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    )
  }
}
