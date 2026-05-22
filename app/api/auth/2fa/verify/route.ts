import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { prisma2FA } from '@/lib/prisma-helpers'
import { verifyTwoFactorToken } from '@/lib/two-factor'
import { rateLimiters } from '@/lib/rate-limit'
import { logger, authLogger } from '@/lib/logger'

// POST /api/auth/2fa/verify - Verificar e ativar 2FA

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Apply rate limiting (3 attempts per minute)
  const rateLimitResult = await rateLimiters.twoFactor(request)

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)

    authLogger.warn('2FA verification rate limit exceeded', {
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      retryAfter,
    })

    return NextResponse.json(
      {
        error: 'Too many attempts. Please try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          'Retry-After': retryAfter.toString(),
        },
      }
    )
  }

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token é obrigatório' }, { status: 400 })
    }

    authLogger.debug('Verifying 2FA token', { userId: session.user.id })

    // Buscar secret do usuário
    const user2FA = await prisma2FA.find2FAFields(session.user.id)

    if (!user2FA?.twoFactorSecret) {
      return NextResponse.json(
        {
          error: '2FA não foi configurado. Configure primeiro.',
        },
        { status: 400 }
      )
    }

    // Verificar token
    const verification = verifyTwoFactorToken(token, user2FA.twoFactorSecret)

    if (!verification.isValid) {
      authLogger.security('2FA verification failed', {
        userId: session.user.id,
        error: verification.error,
      })

      // Log de tentativa de acesso inválida
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: '2FA_VERIFICATION_FAILED',
          resource: 'USER_SECURITY',
          details: `Token inválido: ${verification.error}`,
        },
      })

      return NextResponse.json(
        {
          error: verification.error,
        },
        { status: 400 }
      )
    }

    // Se chegou até aqui, o token é válido
    // Habilitar 2FA se ainda não estiver habilitado
    if (!user2FA.twoFactorEnabled) {
      await prisma2FA.enable2FA(session.user.id, user2FA.twoFactorSecret)

      authLogger.audit('2FA_ENABLED', 'USER_SECURITY', { userId: session.user.id })

      // Log de ativação
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: '2FA_ENABLED',
          resource: 'USER_SECURITY',
          details: '2FA foi habilitado com sucesso',
        },
      })

      const response = NextResponse.json({
        success: true,
        message: '2FA habilitado com sucesso!',
        enabled: true,
      })

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())

      return response
    } else {
      authLogger.debug('2FA token verified successfully', { userId: session.user.id })

      // Log de verificação bem-sucedida
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: '2FA_VERIFICATION_SUCCESS',
          resource: 'USER_SECURITY',
          details: 'Token 2FA verificado com sucesso',
        },
      })

      const response = NextResponse.json({
        success: true,
        message: 'Token verificado com sucesso!',
        enabled: true,
      })

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())

      return response
    }
  } catch (error: unknown) {
    authLogger.error('Error verifying 2FA', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
