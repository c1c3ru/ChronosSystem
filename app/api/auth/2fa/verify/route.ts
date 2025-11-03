import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { prisma2FA } from '@/lib/prisma-helpers'
import { verifyTwoFactorToken } from '@/lib/two-factor'

// POST /api/auth/2fa/verify - Verificar e ativar 2FA
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token é obrigatório' }, { status: 400 })
    }

    console.log('🔍 Verificando token 2FA para usuário:', session.user.email)

    // Buscar secret do usuário
    const user2FA = await prisma2FA.find2FAFields(session.user.id)

    if (!user2FA?.twoFactorSecret) {
      return NextResponse.json({ 
        error: '2FA não foi configurado. Configure primeiro.' 
      }, { status: 400 })
    }

    // Verificar token
    const verification = verifyTwoFactorToken(token, user2FA.twoFactorSecret)

    if (!verification.isValid) {
      console.log('❌ Token 2FA inválido:', verification.error)
      
      // Log de tentativa de acesso inválida
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: '2FA_VERIFICATION_FAILED',
          resource: 'USER_SECURITY',
          details: `Token inválido: ${verification.error}`
        }
      })

      return NextResponse.json({ 
        error: verification.error 
      }, { status: 400 })
    }

    // Se chegou até aqui, o token é válido
    // Habilitar 2FA se ainda não estiver habilitado
    if (!user2FA.twoFactorEnabled) {
      await prisma2FA.enable2FA(session.user.id, user2FA.twoFactorSecret)

      console.log('✅ 2FA habilitado com sucesso para:', session.user.email)

      // Log de ativação
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: '2FA_ENABLED',
          resource: 'USER_SECURITY',
          details: '2FA foi habilitado com sucesso'
        }
      })

      return NextResponse.json({
        success: true,
        message: '2FA habilitado com sucesso!',
        enabled: true
      })
    } else {
      console.log('✅ Token 2FA verificado com sucesso')

      // Log de verificação bem-sucedida
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: '2FA_VERIFICATION_SUCCESS',
          resource: 'USER_SECURITY',
          details: 'Token 2FA verificado com sucesso'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Token verificado com sucesso!',
        enabled: true
      })
    }

  } catch (error) {
    console.error('Erro ao verificar 2FA:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
