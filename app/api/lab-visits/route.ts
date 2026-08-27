import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimiters, withRateLimit } from '@/lib/rate-limit'
import { createLabVisitSchema } from '@/lib/lab-visits'

// POST /api/lab-visits
// Rota pública: formulário de solicitação de visita preenchido por uma
// escola visitante (não exige autenticação). Cria a visita já como
// CONFIRMED — não há fluxo de aprovação nesta versão.
export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(rateLimiters.general)(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const rawBody = await request.json().catch(() => null)
    const parsed = createLabVisitSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      )
    }
    const data = parsed.data

    const lab = await prisma.laboratory.findUnique({ where: { id: data.labId } })
    if (!lab || !lab.isActive) {
      return NextResponse.json({ error: 'Laboratório não encontrado ou inativo' }, { status: 404 })
    }

    const dayStart = new Date(data.visitDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const existing = await prisma.labVisit.findFirst({
      where: {
        labId: data.labId,
        shift: data.shift,
        status: 'CONFIRMED',
        visitDate: { gte: dayStart, lt: dayEnd },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Este laboratório já está reservado nesse turno. Escolha outro horário.' },
        { status: 409 }
      )
    }

    const visit = await prisma.labVisit.create({
      data: {
        labId: data.labId,
        responsibleName: data.responsibleName,
        schoolName: data.schoolName,
        studentCount: data.studentCount,
        visitDate: new Date(data.visitDate),
        shift: data.shift,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        status: 'CONFIRMED',
      },
      select: { id: true, visitDate: true, shift: true },
    })

    return NextResponse.json({ success: true, visit })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Erro ao agendar visita', details: errorMessage },
      { status: 500 }
    )
  }
}
