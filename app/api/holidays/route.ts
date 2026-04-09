import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getYearHolidays, isNationalHoliday, isWorkingDay } from '@/lib/holidays'

export const dynamic = 'force-dynamic'

// GET /api/holidays - Obter feriados do ano
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear()

    // Obter todos os feriados do ano
    const holidays = getYearHolidays(year)

    // Verificar se hoje é feriado
    const today = new Date()
    const todayHoliday = isNationalHoliday(today)
    const isTodayWorkingDay = isWorkingDay(today)

    return NextResponse.json({
      success: true,
      year,
      holidays: holidays.map((h) => ({
        name: h.name,
        date: h.date.toISOString(),
        formattedDate: h.date.toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        type: h.type,
        dayOfWeek: h.date.toLocaleDateString('pt-BR', { weekday: 'long' }),
      })),
      today: {
        isHoliday: todayHoliday.isHoliday,
        holidayName: todayHoliday.holidayName,
        isWorkingDay: isTodayWorkingDay,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar feriados:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
