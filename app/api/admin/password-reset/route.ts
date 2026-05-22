import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { z } from 'zod'

// Schema para validação
const massResetSchema = z.object({
  userIds: z.array(z.string()).optional(), // Se não fornecido, reseta todos
  reason: z.string().min(1, 'Motivo é obrigatório'),
  expiresInHours: z.number().min(1).max(168).default(24), // 1 hora a 7 dias
})

const individualResetSchema = z.object({
  userId: z.string(),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  expiresInHours: z.number().min(1).max(168).default(24),
})

// POST /api/admin/password-reset - Reset de senha em massa ou individual
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { type } = body

    if (type === 'mass') {
      return await handleMassReset(request, session, body)
    } else if (type === 'individual') {
      return await handleIndividualReset(request, session, body)
    } else {
      return NextResponse.json({ error: 'Tipo de reset inválido' }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro no reset de senha:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Reset em massa
async function handleMassReset(
  request: NextRequest,
  session: { user: { id: string } },
  body: unknown
) {
  try {
    const validatedData = massResetSchema.parse(body)

    // Buscar usuários
    let users
    if (validatedData.userIds && validatedData.userIds.length > 0) {
      users = await prisma.user.findMany({
        where: {
          id: { in: validatedData.userIds },
          password: { not: null }, // Apenas usuários com senha (não só Google)
        },
        select: { id: true, email: true, name: true },
      })
    } else {
      // Todos os usuários com senha
      users = await prisma.user.findMany({
        where: {
          password: { not: null },
        },
        select: { id: true, email: true, name: true },
      })
    }

    if (users.length === 0) {
      return NextResponse.json({ error: 'Nenhum usuário encontrado para reset' }, { status: 400 })
    }

    // Criar tokens para todos os usuários
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + validatedData.expiresInHours)

    const resetTokens = []

    for (const user of users) {
      // Invalidar tokens existentes
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true, usedAt: new Date() },
      })

      // Criar novo token
      const token = crypto.randomBytes(32).toString('hex')

      const resetToken = await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expires: expiresAt,
        },
      })

      resetTokens.push({
        userId: user.id,
        email: user.email,
        name: user.name,
        token: resetToken.token,
        resetUrl: `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken.token}`,
      })
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'MASS_PASSWORD_RESET',
        resource: 'USER_PASSWORD',
        details: `Reset em massa para ${users.length} usuários. Motivo: ${validatedData.reason}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Reset de senha iniciado para ${users.length} usuários`,
      resetTokens,
      expiresAt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors,
        },
        { status: 400 }
      )
    }
    throw error
  }
}

// Reset individual
async function handleIndividualReset(
  request: NextRequest,
  session: { user: { id: string } },
  body: unknown
) {
  try {
    const validatedData = individualResetSchema.parse(body)

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { id: true, email: true, name: true, password: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'Usuário não possui senha (login apenas com Google)' },
        { status: 400 }
      )
    }

    // Invalidar tokens existentes
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true, usedAt: new Date() },
    })

    // Criar novo token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + validatedData.expiresInHours)

    const resetToken = await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expires: expiresAt,
      },
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'INDIVIDUAL_PASSWORD_RESET',
        resource: 'USER_PASSWORD',
        details: `Reset individual para usuário ${user.email}. Motivo: ${validatedData.reason}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Token de reset criado com sucesso',
      resetToken: {
        userId: user.id,
        email: user.email,
        name: user.name,
        token: resetToken.token,
        resetUrl: `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken.token}`,
      },
      expiresAt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors,
        },
        { status: 400 }
      )
    }
    throw error
  }
}

// GET /api/admin/password-reset - Listar tokens ativos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const activeTokens = await prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expires: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      activeTokens: activeTokens.map(
        (token: { id: string; token: string; expires: Date; createdAt: Date; user: unknown }) => ({
          id: token.id,
          token: token.token,
          expires: token.expires,
          createdAt: token.createdAt,
          user: token.user,
          resetUrl: `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token.token}`,
        })
      ),
    })
  } catch (error) {
    console.error('Erro ao listar tokens:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/admin/password-reset - Invalidar tokens
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get('tokenId')
    const userId = searchParams.get('userId')

    if (tokenId) {
      // Invalidar token específico
      await prisma.passwordResetToken.update({
        where: { id: tokenId },
        data: { used: true, usedAt: new Date() },
      })

      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'INVALIDATE_RESET_TOKEN',
          resource: 'PASSWORD_RESET_TOKEN',
          details: `Token ${tokenId} invalidado manualmente`,
        },
      })

      return NextResponse.json({ success: true, message: 'Token invalidado' })
    } else if (userId) {
      // Invalidar todos os tokens do usuário
      await prisma.passwordResetToken.updateMany({
        where: { userId, used: false },
        data: { used: true, usedAt: new Date() },
      })

      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'INVALIDATE_USER_RESET_TOKENS',
          resource: 'PASSWORD_RESET_TOKEN',
          details: `Todos os tokens do usuário ${userId} invalidados`,
        },
      })

      return NextResponse.json({ success: true, message: 'Tokens do usuário invalidados' })
    } else {
      return NextResponse.json({ error: 'tokenId ou userId é obrigatório' }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro ao invalidar token:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
