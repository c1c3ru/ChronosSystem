import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCalendarEvent } from '@/lib/google-calendar'
import type { VisitShift } from '@/lib/lab-visits'

// POST /api/lab-visits/[id]/approve
// Rota autenticada (401 sem sessão): move uma visita de PENDING para
// CONFIRMED. É o ÚNICO ponto do sistema que dispara a criação do evento no
// Google Calendar — chamado no máximo uma vez por visita (idempotente: uma
// visita já CONFIRMED não gera um segundo evento).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const { id } = await params

    const visit = await prisma.labVisit.findUnique({
      where: { id },
      include: { lab: true },
    })

    if (!visit) {
      return NextResponse.json({ error: 'Visita não encontrada' }, { status: 404 })
    }

    if (visit.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Uma visita cancelada não pode ser aprovada' },
        { status: 409 }
      )
    }

    if (visit.status === 'CONFIRMED') {
      // Idempotente: já aprovada, não recria o evento no calendário.
      return NextResponse.json({ success: true, visit, alreadyConfirmed: true })
    }

    const updated = await prisma.labVisit.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    })

    const { eventId } = await createCalendarEvent({
      visitId: visit.id,
      labSigla: visit.lab.sigla,
      labNome: visit.lab.nome,
      responsibleName: visit.responsibleName,
      schoolName: visit.schoolName,
      studentCount: visit.studentCount,
      visitDate: visit.visitDate,
      shift: visit.shift as VisitShift,
    })

    const final = eventId
      ? await prisma.labVisit.update({
          where: { id },
          data: { googleCalendarEventId: eventId },
        })
      : updated

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'LAB_VISIT_APPROVED',
        resource: 'LAB_VISIT',
        details: `Visita ${visit.id} (${visit.lab.sigla}) aprovada por ${session.user.email}`,
      },
    })

    return NextResponse.json({ success: true, visit: final })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Erro ao aprovar visita', details: errorMessage },
      { status: 500 }
    )
  }
}
