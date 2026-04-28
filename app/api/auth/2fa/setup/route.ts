import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { prisma2FA } from '@/lib/prisma-helpers'
import { generateTwoFactorSecret } from '@/lib/two-factor'
import { authLogger } from '@/lib/logger'

// POST /api/auth/2fa/setup - Configurar 2FA para o usuário

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    authLogger.info('Setting up 2FA', { userId: session.user.id })

    // Verificar se o usuário já tem 2FA configurado
    const user2FA = await prisma2FA.find2FAFields(session.user.id)

    if (user2FA?.twoFactorEnabled) {
      return NextResponse.json(
        {
          error: '2FA já está habilitado para este usuário',
        },
        { status: 400 }
      )
    }

    // Gerar novo secret e QR code
    const twoFactorSetup = await generateTwoFactorSecret(session.user.email!, 'Chronos System')

    // Salvar secret temporário no banco (não habilitado ainda)
    await prisma2FA.setupSecret(session.user.id, twoFactorSetup.secret)

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: '2FA_SETUP_INITIATED',
        resource: 'USER_SECURITY',
        details: 'Usuário iniciou configuração de 2FA',
      },
    })

    authLogger.info('2FA setup generated successfully', { userId: session.user.id })

    return NextResponse.json({
      success: true,
      setup: {
        qrCodeUrl: twoFactorSetup.qrCodeUrl,
        manualEntryKey: twoFactorSetup.manualEntryKey,
        instructions: {
          step1: 'Instale um app autenticador (Google Authenticator, Authy, etc.)',
          step2: 'Escaneie o QR code ou digite a chave manual',
          step3: 'Digite o código de 6 dígitos para confirmar',
        },
      },
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    authLogger.error('Error setting up 2FA', { userId: 'unknown', error: errorMessage })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET /api/auth/2fa/setup - Verificar status do 2FA
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const user2FA = await prisma2FA.find2FAWithUserInfo(session.user.id)

    return NextResponse.json({
      enabled: user2FA?.twoFactorEnabled || false,
      hasSecret: !!user2FA?.twoFactorSecret,
      email: user2FA?.email,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    authLogger.error('Error checking 2FA status', { error: errorMessage })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
