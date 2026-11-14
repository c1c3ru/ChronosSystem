import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNowInFortaleza, parseDateInFortaleza, endOfDayInFortaleza } from '@/lib/timezone'
import {
  buildPrefillValues,
  defaultPeriod,
  hoursEnd,
  isIsoDate,
  isPrefillFormType,
  sumWorkedHours,
  toIsoDate,
  type Period,
} from '@/lib/internship-prefill'

export const dynamic = 'force-dynamic'

/**
 * GET /api/employee/internship-prefill?formType=monthly-report&from=YYYY-MM-DD&to=YYYY-MM-DD
 * Dados do próprio usuário para pré-preencher os formulários de estágio (perfil + horas do ponto).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const params = request.nextUrl.searchParams
    const formType = params.get('formType')
    if (!isPrefillFormType(formType)) {
      return NextResponse.json({ error: 'formType inválido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        registrationNumber: true,
        contractStartDate: true,
        contractEndDate: true,
      },
    })
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const today = getNowInFortaleza()
    const from = params.get('from')
    const to = params.get('to')
    const period: Period =
      isIsoDate(from) && isIsoDate(to) && from <= to
        ? { from, to }
        : defaultPeriod(formType, today, user.contractStartDate, user.contractEndDate)

    // O acumulado começa no início do contrato (ou no início do período, se não houver contrato).
    const contractStart = user.contractStartDate ? toIsoDate(user.contractStartDate) : period.from
    const totalFrom = contractStart < period.from ? contractStart : period.from
    const end = hoursEnd(period, today)

    const records =
      totalFrom <= end
        ? await prisma.attendanceRecord.findMany({
            where: {
              userId: session.user.id,
              timestamp: {
                gte: parseDateInFortaleza(totalFrom),
                lte: endOfDayInFortaleza(parseDateInFortaleza(end)),
              },
            },
            select: { type: true, timestamp: true },
            orderBy: { timestamp: 'asc' },
          })
        : []

    const inPeriod = records.filter((r) => toIsoDate(r.timestamp) >= period.from)
    const values = buildPrefillValues(formType, user, period, {
      period: sumWorkedHours(inPeriod),
      total: sumWorkedHours(records),
    })

    return NextResponse.json({ values, period }, { status: 200 })
  } catch (error: unknown) {
    console.error('Erro ao montar pré-preenchimento:', error)
    return NextResponse.json({ error: 'Erro ao montar pré-preenchimento' }, { status: 500 })
  }
}
