import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Schema para validação
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

const validateTokenSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
})

// POST /api/auth/reset-password - Processar reset de senha
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

    // Buscar token válido
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: validatedData.token },
      include: { user: true },
    })

    if (!resetToken) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
    }

    if (resetToken.used) {
      return NextResponse.json({ error: 'Token já foi utilizado' }, { status: 400 })
    }

    if (resetToken.expires < new Date()) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 400 })
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

    // Atualizar senha do usuário
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    })

    // Marcar token como usado
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true, usedAt: new Date() },
    })

    // Invalidar todos os outros tokens do usuário
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        id: { not: resetToken.id },
        used: false,
      },
      data: { used: true, usedAt: new Date() },
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: resetToken.userId,
        action: 'PASSWORD_RESET_COMPLETED',
        resource: 'USER_PASSWORD',
        details: `Senha alterada via token de reset`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso',
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

    console.error('Erro ao resetar senha:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET /api/auth/reset-password?token=xxx - Validar token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token é obrigatório' }, { status: 400 })
    }

    const validatedData = validateTokenSchema.parse({ token })

    // Buscar token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: validatedData.token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    if (!resetToken) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Token não encontrado',
        },
        { status: 404 }
      )
    }

    if (resetToken.used) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Token já foi utilizado',
        },
        { status: 400 }
      )
    }

    if (resetToken.expires < new Date()) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Token expirado',
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      user: resetToken.user,
      expires: resetToken.expires,
      createdAt: resetToken.createdAt,
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

    console.error('Erro ao validar token:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
