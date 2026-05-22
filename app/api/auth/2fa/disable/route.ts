import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { prisma2FA } from '@/lib/prisma-helpers'
import { verifyTwoFactorToken } from '@/lib/two-factor'
import { authLogger } from '@/lib/logger'

// POST /api/auth/2fa/disable - Desabilitar 2FA

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { token, confirmPassword } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token 2FA é obrigatório' }, { status: 400 })
    }

    authLogger.info('Disabling 2FA', { userId: session.user.id })

    // Buscar dados do usuário
    const user2FA = await prisma2FA.find2FAFields(session.user.id)

    if (!user2FA?.twoFactorEnabled || !user2FA?.twoFactorSecret) {
      return NextResponse.json(
        {
          error: '2FA não está habilitado',
        },
        { status: 400 }
      )
    }

    // Verificar token 2FA atual
    const verification = verifyTwoFactorToken(token, user2FA.twoFactorSecret)

    if (!verification.isValid) {
      authLogger.security('Invalid 2FA token for disable', { userId: session.user.id })

      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: '2FA_DISABLE_FAILED',
          resource: 'USER_SECURITY',
          details: `Tentativa de desabilitar 2FA com token inválido: ${verification.error}`,
        },
      })

      return NextResponse.json(
        {
          error: verification.error,
        },
        { status: 400 }
      )
    }

    // Desabilitar 2FA
    await prisma2FA.disable2FA(session.user.id)

    authLogger.info('2FA disabled successfully', { userId: session.user.id })

    // Log de desabilitação
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: '2FA_DISABLED',
        resource: 'USER_SECURITY',
        details: '2FA foi desabilitado pelo usuário',
      },
    })

    return NextResponse.json({
      success: true,
      message: '2FA desabilitado com sucesso!',
      enabled: false,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    authLogger.error('Error disabling 2FA', { userId: 'unknown', error: errorMessage })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
