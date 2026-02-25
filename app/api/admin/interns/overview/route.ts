import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const interns = await prisma.user.findMany({
            where: {
                role: 'EMPLOYEE'
            },
            select: {
                id: true,
                name: true,
                email: true,
                department: true,
                shift: true,
                shiftStartTime: true,
                shiftEndTime: true,
                contractType: true,
                weeklyHours: true,
                dailyHours: true,
                profileComplete: true,
                hourBalance: true,
                _count: {
                    select: {
                        attendanceRecords: true
                    }
                },
                attendanceRecords: {
                    take: 1,
                    orderBy: {
                        timestamp: 'desc'
                    },
                    select: {
                        type: true,
                        timestamp: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        const formattedInterns = interns.map(intern => ({
            ...intern,
            lastStatus: intern.attendanceRecords[0] || null,
            attendanceRecords: undefined // Remover o array original
        }))

        return NextResponse.json(formattedInterns)

    } catch (error: any) {
        console.error('Erro ao buscar overview de estagiários:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
