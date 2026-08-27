import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimiters, withRateLimit } from '@/lib/rate-limit'
import {
  laboratorySelect,
  createLaboratorySchema,
  VISIT_SHIFTS,
  type PublicLaboratory,
} from '@/lib/lab-visits'

// GET /api/lab-visits/laboratories?date=YYYY-MM-DD&shift=MORNING
// Rota pública: lista os laboratórios (sigla, nome, descrição) e, quando
// `date`+`shift` são informados, calcula a disponibilidade de cada um para
// aquele horário (indisponível se já existir uma visita CONFIRMED).
export async function GET(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(rateLimiters.general)(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const shiftParam = searchParams.get('shift')

    const hasValidSlot =
      !!dateParam &&
      !Number.isNaN(new Date(dateParam).getTime()) &&
      !!shiftParam &&
      (VISIT_SHIFTS as readonly string[]).includes(shiftParam)

    const labs = await prisma.laboratory.findMany({
      where: { isActive: true },
      select: laboratorySelect,
      orderBy: { sigla: 'asc' },
    })

    let bookedLabIds = new Set<string>()

    if (hasValidSlot) {
      const dayStart = new Date(dateParam as string)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const bookedVisits = await prisma.labVisit.findMany({
        where: {
          status: 'CONFIRMED',
          shift: shiftParam as string,
          visitDate: { gte: dayStart, lt: dayEnd },
        },
        select: { labId: true },
      })

      bookedLabIds = new Set(bookedVisits.map((visit) => visit.labId))
    }

    const result: PublicLaboratory[] = labs.map((lab) => ({
      ...lab,
      // Sem data/turno selecionado, consideramos disponível por padrão —
      // a indisponibilidade só é conhecida em relação a um horário específico.
      available: hasValidSlot ? !bookedLabIds.has(lab.id) : true,
    }))

    return NextResponse.json({ laboratories: result })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Erro ao carregar laboratórios', details: errorMessage },
      { status: 500 }
    )
  }
}

// POST /api/lab-visits/laboratories
// Rota autenticada (401 sem sessão): cadastra um novo laboratório. Usada
// pela interface restrita para adicionar mais laboratórios/cards à tela.
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const rawBody = await request.json().catch(() => null)
    const parsed = createLaboratorySchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      )
    }

    const existing = await prisma.laboratory.findUnique({
      where: { sigla: parsed.data.sigla },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um laboratório cadastrado com essa sigla' },
        { status: 409 }
      )
    }

    const lab = await prisma.laboratory.create({
      data: parsed.data,
      select: laboratorySelect,
    })

    return NextResponse.json({ success: true, laboratory: { ...lab, available: true } }, { status: 201 })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Erro ao cadastrar laboratório', details: errorMessage },
      { status: 500 }
    )
  }
}
