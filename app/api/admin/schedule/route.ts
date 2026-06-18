import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE', profileComplete: true },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        shiftStartTime: true,
        shiftEndTime: true,
        workingDaysPerWeek: true,
        shift: true,
        contractType: true,
        attendanceRecords: {
          where: {
            timestamp: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
          select: { type: true, timestamp: true },
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ department: 'asc' }, { name: 'asc' }],
    })

    const result = employees.map((emp) => {
      const lastRecord = emp.attendanceRecords[0] ?? null
      const isPresent = lastRecord?.type === 'ENTRY'

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        shiftStartTime: emp.shiftStartTime,
        shiftEndTime: emp.shiftEndTime,
        workingDaysPerWeek: emp.workingDaysPerWeek,
        shift: emp.shift,
        contractType: emp.contractType,
        isPresent,
        lastRecord: lastRecord
          ? { type: lastRecord.type, timestamp: lastRecord.timestamp.toISOString() }
          : null,
      }
    })

    return NextResponse.json({ success: true, employees: result })
  } catch (error: unknown) {
    console.error('Erro ao buscar quadro de horários:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
