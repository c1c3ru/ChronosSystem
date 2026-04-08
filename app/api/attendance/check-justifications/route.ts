import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeDayForJustification, getUserWorkingHours, isWeekend } from '@/lib/attendance-logic'
import { getHolidaysForPeriod } from '@/lib/holidays'

export const dynamic = 'force-dynamic'

/**
 * API para verificar dias que requerem justificativa obrigatória
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId') || session.user.id
        const daysBack = parseInt(searchParams.get('daysBack') || '30')

        // Verificar permissões
        const canViewAll = ['ADMIN', 'SUPERVISOR'].includes(session.user.role)
        if (!canViewAll && userId !== session.user.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
        }

        // Buscar horários de trabalho do usuário
        const workingHours = await getUserWorkingHours(userId)

        // Calcular período de análise
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - daysBack)
        startDate.setHours(0, 0, 0, 0)

        // BUSCA OTIMIZADA: Pegar todos os feriados do período de uma vez
        const holidayMap = await getHolidaysForPeriod(startDate, endDate)

        // Buscar todos os registros do período
        const records = await prisma.attendanceRecord.findMany({
            where: {
                userId,
                timestamp: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { timestamp: 'asc' }
        })

        // Buscar justificativas existentes
        const existingJustifications = await prisma.justification.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        })

        const justificationMap = new Map(
            existingJustifications.map(j => [j.date.toISOString().split('T')[0], j])
        )

        // Agrupar registros por dia
        const dayRecords = new Map<string, { entry: any, exit: any }>()

        records.forEach(record => {
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

        // Analisar cada dia do período
        const daysRequiringJustification: any[] = []
        const currentDate = new Date(startDate)

        while (currentDate <= endDate) {
            const dateKey = currentDate.toISOString().split('T')[0]
            const dayData = dayRecords.get(dateKey) || { entry: null, exit: null }

            // Verificar se é dia de trabalho (Fim de semana OU feriado no mapa)
            const isWorkDay = !isWeekend(currentDate) && !holidayMap.has(dateKey)

            // Analisar o dia
            const analysis = analyzeDayForJustification(
                currentDate,
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
                    daysRequiringJustification.push({
                        ...analysis,
                        existingJustification: existingJustification ? {
                            id: existingJustification.id,
                            status: existingJustification.status,
                            type: existingJustification.type,
                            reason: existingJustification.reason
                        } : null
                    })
                }
            }

            currentDate.setDate(currentDate.getDate() + 1)
        }

        return NextResponse.json({
            success: true,
            period: {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0],
                daysAnalyzed: daysBack
            },
            summary: {
                totalDaysRequiringJustification: daysRequiringJustification.length,
                pending: daysRequiringJustification.filter(d => d.existingJustification?.status === 'PENDING').length,
                missing: daysRequiringJustification.filter(d => !d.existingJustification).length
            },
            daysRequiringJustification
        })

    } catch (error: any) {
        console.error('Erro ao verificar justificativas:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
