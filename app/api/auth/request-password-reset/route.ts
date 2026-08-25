import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import crypto from 'crypto'
import { z } from 'zod'
import { rateLimiters, withRateLimit } from '@/lib/rate-limit'

const requestPasswordResetSchema = z.object({
  email: z.string().email('Email inválido'),
})

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(rateLimiters.passwordReset)(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { email } = requestPasswordResetSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    })

    if (!user || !user.password) {
      return NextResponse.json({
        success: true,
        message:
          'Se o email estiver cadastrado, você receberá um link para redefinir sua senha em poucos minutos.',
      })
    }

    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
        usedAt: new Date(),
      },
    })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    const resetToken = await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expires: expiresAt,
      },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken.token}`

    await emailService.sendPasswordResetEmail({
      userName: user.name || 'Usuário',
      userEmail: user.email,
      resetUrl,
      expiresAt,
      reason: 'Solicitado pelo próprio usuário via tela de login.',
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SELF_SERVICE_PASSWORD_RESET_REQUESTED',
        resource: 'USER_PASSWORD',
        details: `Reset de senha solicitado pelo próprio usuário (email: ${user.email}).`,
      },
    })

    return NextResponse.json({
      success: true,
      message:
        'Se o email estiver cadastrado, você receberá um link para redefinir sua senha em poucos minutos.',
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

    console.error('Erro ao solicitar reset de senha:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
