import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeDayForJustification, getUserWorkingHours, isWeekend } from '@/lib/attendance-logic'
import { isNationalHoliday } from '@/lib/holidays'

// GET /api/justifications/pending - Buscar pendências que requerem justificativa

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar horários de trabalho do usuário
    const workingHours = await getUserWorkingHours(session.user.id)

    // Buscar registros dos últimos 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        userId: session.user.id,
        timestamp: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { timestamp: 'asc' },
    })

    // Buscar justificativas já enviadas
    const existingJustifications = await prisma.justification.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
    })

    const justificationMap = new Map(
      existingJustifications.map((j) => [j.date.toISOString().split('T')[0], j])
    )

    // Agrupar registros por dia
    const dayRecords = new Map<string, { entry: any; exit: any }>()

    attendanceRecords.forEach((record) => {
      const dateKey = record.timestamp.toISOString().split('T')[0]
      if (!dayRecords.has(dateKey)) {
        dayRecords.set(dateKey, { entry: null, exit: null })
      }
      const day = dayRecords.get(dateKey)!
      if (record.type === 'ENTRY') {
        day.entry = record
      } else {
        day.exit = record
      }
    })

    const pendingIssues: any[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Analisar cada dia dos últimos 30 dias
    for (let i = 1; i < 30; i++) {
      // Começar de 1 para não incluir hoje
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const dateKey = date.toISOString().split('T')[0]
      const dayData = dayRecords.get(dateKey) || { entry: null, exit: null }

      // Verificar se é dia de trabalho
      const isWorkDay = !isWeekend(date) && !isNationalHoliday(date).isHoliday

      if (!isWorkDay) continue

      // Analisar o dia usando a nova função
      const analysis = analyzeDayForJustification(
        date,
        dayData.entry,
        dayData.exit,
        workingHours,
        isWorkDay
      )

      // Se requer justificativa e não tem justificativa aprovada
      if (analysis.requiresJustification) {
        const existingJustification = justificationMap.get(dateKey)
        const hasApprovedJustification = existingJustification?.status === 'APPROVED'

        if (!hasApprovedJustification) {
          // Determinar tipo baseado na análise
          let type: 'LATE' | 'ABSENCE' | 'EARLY_DEPARTURE' = 'ABSENCE'
          let description = analysis.justificationReason || 'Pendência detectada'

          if (!analysis.hasEntry && !analysis.hasExit) {
            type = 'ABSENCE'
            description = `Falta no dia ${date.toLocaleDateString('pt-BR')}`
          } else if (analysis.lateArrival?.requiresJustification) {
            type = 'LATE'
            description = `Atraso de ${analysis.lateArrival.minutesLate} minutos`
            if (dayData.entry) {
              const entryTime = new Date(dayData.entry.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })
              description += ` (entrada às ${entryTime})`
            }
          } else if (analysis.earlyDeparture?.requiresJustification) {
            type = 'EARLY_DEPARTURE'
            const hoursWorked = Math.floor(analysis.earlyDeparture.hoursWorked)
            const minutesWorked = Math.round(
              (analysis.earlyDeparture.hoursWorked - hoursWorked) * 60
            )
            description = `Saída antecipada: trabalhou ${hoursWorked}h${minutesWorked}min, faltam ${analysis.earlyDeparture.minutesShort} minutos`
          }

          pendingIssues.push({
            id: `${type.toLowerCase()}-${dateKey}`,
            date: date.toISOString(),
            type,
            description,
            canJustify: !existingJustification || existingJustification.status === 'REJECTED',
            existingJustification: existingJustification
              ? {
                  id: existingJustification.id,
                  status: existingJustification.status,
                  reason: existingJustification.reason,
                }
              : null,
          })
        }
      }
    }

    // Ordenar por data (mais recentes primeiro)
    pendingIssues.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(pendingIssues)
  } catch (error) {
    console.error('Erro ao buscar pendências:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
