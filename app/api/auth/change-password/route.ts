import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = changePasswordSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, password: true },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Sua conta não possui senha local para alteração.' },
        { status: 400 }
      )
    }

    const isValid = await bcrypt.compare(validatedData.currentPassword, user.password)

    if (!isValid) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true, usedAt: new Date() },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_PASSWORD_CHANGED',
        resource: 'USER_PASSWORD',
        details: 'Senha alterada pelo próprio usuário via área autenticada.',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso.',
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Erro ao alterar senha:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
