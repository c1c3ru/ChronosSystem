import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const acknowledgeNotificationSchema = z.object({
  id: z.string().min(1, 'id é obrigatório'),
})

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const notifications = await prisma.attendanceNotification.findMany({
    where: {
      userId: session.user.id,
      expiresAt: {
        gte: new Date(),
      },
      acknowledgedAt: null,
    },
    orderBy: {
      sentAt: 'desc',
    },
  })

  return NextResponse.json(notifications)
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const rawBody = await request.json().catch(() => null)
  const parsed = acknowledgeNotificationSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
  }
  const { id } = parsed.data

  try {
    await prisma.attendanceNotification.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        acknowledgedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 })
  }
}
