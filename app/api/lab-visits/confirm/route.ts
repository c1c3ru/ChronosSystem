import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { VISIT_SHIFTS } from '@/lib/lab-visits'

const confirmVisitsSchema = z.object({
  labIds: z.array(z.string().min(1)).min(1, 'Selecione ao menos um laboratório'),
  visitDate: z
    .string()
    .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Data inválida'),
  shift: z.enum(VISIT_SHIFTS),
})

// POST /api/lab-visits/confirm
// Rota autenticada: usada pela tela interna para SOLICITAR a reserva de um
// ou mais laboratórios num turno, sem precisar dos dados de uma escola
// visitante (usa o próprio usuário logado como responsável). A visita nasce
// PENDING como qualquer outra — precisa passar por
// POST /api/lab-visits/[id]/approve para virar CONFIRMED e gerar o evento
// no Google Calendar.
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const rawBody = await request.json().catch(() => null)
    const parsed = confirmVisitsSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      )
    }
    const { labIds, visitDate, shift } = parsed.data

    const dayStart = new Date(visitDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const [labs, alreadyBooked] = await Promise.all([
      prisma.laboratory.findMany({ where: { id: { in: labIds }, isActive: true } }),
      prisma.labVisit.findMany({
        where: {
          labId: { in: labIds },
          shift,
          status: 'CONFIRMED',
          visitDate: { gte: dayStart, lt: dayEnd },
        },
        select: { labId: true },
      }),
    ])

    const bookedIds = new Set(alreadyBooked.map((v) => v.labId))
    const availableLabs = labs.filter((lab) => !bookedIds.has(lab.id))

    if (availableLabs.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum dos laboratórios selecionados está disponível nesse turno.' },
        { status: 409 }
      )
    }

    const created = await prisma.labVisit.createMany({
      data: availableLabs.map((lab) => ({
        labId: lab.id,
        responsibleName: session.user.name || session.user.email,
        schoolName: 'Visita interna (IFCE Maracanaú)',
        studentCount: 0,
        visitDate: new Date(visitDate),
        shift,
        contactEmail: session.user.email,
        contactPhone: '',
        status: 'PENDING',
      })),
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'LAB_VISIT_REQUESTED',
        resource: 'LAB_VISIT',
        details: `${created.count} laboratório(s) solicitado(s) por ${session.user.email} para ${visitDate} (${shift}) — aguardando aprovação`,
      },
    })

    return NextResponse.json({
      success: true,
      requestedCount: created.count,
      skipped: labIds.length - availableLabs.length,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Erro ao confirmar visitas', details: errorMessage },
      { status: 500 }
    )
  }
}
