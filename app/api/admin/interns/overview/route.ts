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
        role: 'EMPLOYEE',
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
            attendanceRecords: true,
          },
        },
        attendanceRecords: {
          where: {
            timestamp: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
          select: {
            type: true,
            timestamp: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const formattedInterns = interns.map((intern) => {
      const todayRecords = intern.attendanceRecords.filter((r) => new Date(r.timestamp) >= today)

      // Lógica de tempo real (Restrita a registros de HOJE):
      // Está "Presente" se o ÚLTIMO registro registrado HOJE foi ENTRADA.
      const isPresent = todayRecords.length > 0 && todayRecords[0].type === 'ENTRY'

      // Ajuste de saldo em tempo real se o estagiário estiver presente
      let currentBalance = intern.hourBalance
      if (isPresent && todayRecords[0]) {
        const now = new Date()
        const lastEntryTime = new Date(todayRecords[0].timestamp)
        const diffHours = (now.getTime() - lastEntryTime.getTime()) / (1000 * 60 * 60)
        currentBalance += diffHours
      }

      return {
        ...intern,
        hourBalance: currentBalance,
        lastStatus: intern.attendanceRecords[0] || null,
        isPresent, // Novo campo para o UI
        attendanceRecords: undefined,
      }
    })

    return NextResponse.json(formattedInterns)
  } catch (error: unknown) {
    console.error('Erro ao buscar overview de estagiários:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
