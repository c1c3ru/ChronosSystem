import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma2FA } from '@/lib/prisma-helpers'
import { generateTwoFactorSecret } from '@/lib/two-factor'

// EXEMPLO: Versão refatorada type-safe do setup de 2FA
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    console.log('🔐 Configurando 2FA para usuário:', session.user.email)

    // ✅ SOLUÇÃO TYPE-SAFE: Usar helper específico
    const user2FA = await prisma2FA.find2FAFields(session.user.id)

    if (user2FA?.twoFactorEnabled) {
      return NextResponse.json({ 
        error: '2FA já está habilitado para este usuário' 
      }, { status: 400 })
    }

    // Gerar novo secret e QR code
    const twoFactorSetup = await generateTwoFactorSecret(
      session.user.email!,
      'Chronos System'
    )

    // ✅ SOLUÇÃO TYPE-SAFE: Update com helper
    await prisma2FA.update2FA(session.user.id, {
      twoFactorSecret: twoFactorSetup.secret,
      twoFactorEnabled: false // Só habilita após verificação
    })

    return NextResponse.json({
      success: true,
      setup: {
        qrCodeUrl: twoFactorSetup.qrCodeUrl,
        manualEntryKey: twoFactorSetup.manualEntryKey
      }
    })

  } catch (error) {
    console.error('Erro ao configurar 2FA:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET - Verificar status 2FA (versão type-safe)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // ✅ SOLUÇÃO TYPE-SAFE: Usar helper específico
    const user2FA = await prisma2FA.find2FAFields(session.user.id)

    return NextResponse.json({
      enabled: user2FA?.twoFactorEnabled || false,
      hasSecret: !!user2FA?.twoFactorSecret,
      email: session.user.email
    })

  } catch (error) {
    console.error('Erro ao verificar status 2FA:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
