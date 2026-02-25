import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeDayForJustification, isWeekend } from '@/lib/attendance-logic'
import { getHolidaysForPeriod } from '@/lib/holidays'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const daysBack = parseInt(searchParams.get('daysBack') || '30')

        // Calcular período
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - daysBack)
        startDate.setHours(0, 0, 0, 0)

        // 1. Buscar todos os estagiários
        const employees = await prisma.user.findMany({
            where: {
                role: 'EMPLOYEE'
            },
            select: {
                id: true,
                name: true,
                email: true,
                shiftStartTime: true,
                shiftEndTime: true,
                contractType: true
            }
        })

        // 2. Buscar feriados do período
        const holidayMap = await getHolidaysForPeriod(startDate, endDate)

        // 3. Buscar TODAS as justificativas pendentes e aprovadas do período
        const justifications = await prisma.justification.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        })

        // Agrupar justificativas por usuário e data
        const justificationMap = new Map<string, Map<string, any>>()
        justifications.forEach(j => {
            if (!justificationMap.has(j.userId)) {
                justificationMap.set(j.userId, new Map())
            }
            const userJMap = justificationMap.get(j.userId)!
            userJMap.set(j.date.toISOString().split('T')[0], j)
        })

        // 4. Buscar registros de ponto do período
        const records = await prisma.attendanceRecord.findMany({
            where: {
                timestamp: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { timestamp: 'asc' }
        })

        // Agrupar registros por usuário e data
        const userDateRecords = new Map<string, Map<string, { entry: any, exit: any }>>()
        records.forEach(record => {
            const dateKey = record.timestamp.toISOString().split('T')[0]
            if (!userDateRecords.has(record.userId)) {
                userDateRecords.set(record.userId, new Map())
            }
            const userMap = userDateRecords.get(record.userId)!
            if (!userMap.has(dateKey)) {
                userMap.set(dateKey, { entry: null, exit: null })
            }
            const day = userMap.get(dateKey)!
            if (record.type === 'ENTRY') {
                day.entry = record
            } else {
                day.exit = record
            }
        })

        // 5. Analisar cada usuário
        const overview = employees.map(employee => {
            const missingDates: any[] = []
            const pendingDates: any[] = []

            const userJMap = justificationMap.get(employee.id) || new Map()
            const userRMap = userDateRecords.get(employee.id) || new Map()

            const workingHours = {
                start: employee.shiftStartTime || "08:00",
                end: employee.shiftEndTime || "12:00",
                lunchStart: "12:00",
                lunchEnd: "13:00"
            }

            // Percorrer cada dia do período
            const current = new Date(startDate)
            while (current <= endDate) {
                const dateKey = current.toISOString().split('T')[0]
                const isWorkDay = !isWeekend(current) && !holidayMap.has(dateKey)

                if (isWorkDay) {
                    const dayData = userRMap.get(dateKey) || { entry: null, exit: null }
                    const analysis = analyzeDayForJustification(
                        current,
                        dayData.entry,
                        dayData.exit,
                        workingHours,
                        true
                    )

                    if (analysis.requiresJustification) {
                        const justification = userJMap.get(dateKey)
                        if (!justification) {
                            missingDates.push({
                                date: dateKey,
                                reason: analysis.justificationReason
                            })
                        } else if (justification.status === 'PENDING') {
                            pendingDates.push({
                                date: dateKey,
                                justificationId: justification.id,
                                reason: justification.reason
                            })
                        }
                    }
                }
                current.setDate(current.getDate() + 1)
            }

            return {
                userId: employee.id,
                name: employee.name,
                email: employee.email,
                missingCount: missingDates.length,
                pendingCount: pendingDates.length,
                missingDates,
                pendingDates
            }
        })

        // Filtrar apenas quem tem pendências ou faltas
        const filteredOverview = overview.filter(u => u.missingCount > 0 || u.pendingCount > 0)

        // Ordenar por número de pendências/faltas
        filteredOverview.sort((a, b) => (b.missingCount + b.pendingCount) - (a.missingCount + a.pendingCount))

        return NextResponse.json(filteredOverview)

    } catch (error: any) {
        console.error('Erro no overview de justificativas:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
