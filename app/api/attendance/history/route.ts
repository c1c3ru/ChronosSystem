import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/attendance/history - Buscar histórico de registros com paginação
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Parâmetros de paginação
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const type = searchParams.get('type') // ENTRY, EXIT, ou ALL

    const skip = (page - 1) * limit

    // Construir filtro de data
    const dateFilter: any = {}
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom)
    }
    if (dateTo) {
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      dateFilter.lte = endDate
    }

    // Construir filtro de tipo
    const typeFilter = type && type !== 'ALL' ? type : undefined

    // Buscar total de registros
    const total = await prisma.attendanceRecord.count({
      where: {
        userId: session.user.id,
        ...(Object.keys(dateFilter).length > 0 && { timestamp: dateFilter }),
        ...(typeFilter && { type: typeFilter }),
      },
    })

    // Buscar registros paginados
    const records = await prisma.attendanceRecord.findMany({
      where: {
        userId: session.user.id,
        ...(Object.keys(dateFilter).length > 0 && { timestamp: dateFilter }),
        ...(typeFilter && { type: typeFilter }),
      },
      include: {
        machine: {
          select: {
            name: true,
            location: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
    })

    // Agrupar por dia
    const recordsByDay: { [key: string]: any[] } = {}
    records.forEach((record) => {
      const date = new Date(record.timestamp).toLocaleDateString('pt-BR')
      if (!recordsByDay[date]) {
        recordsByDay[date] = []
      }
      recordsByDay[date].push(record)
    })

    // Formatar resposta
    const formattedDays = Object.entries(recordsByDay).map(([date, dayRecords]) => {
      const entries = dayRecords
        .filter((r) => r.type === 'ENTRY')
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      const exits = dayRecords
        .filter((r) => r.type === 'EXIT')
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      // Calcular horas trabalhadas
      let totalMinutes = 0
      for (let i = 0; i < Math.min(entries.length, exits.length); i++) {
        const entryTime = new Date(entries[i].timestamp).getTime()
        const exitTime = new Date(exits[i].timestamp).getTime()
        totalMinutes += (exitTime - entryTime) / (1000 * 60)
      }

      const hours = Math.floor(totalMinutes / 60)
      const minutes = Math.floor(totalMinutes % 60)
      const totalHours = `${hours}h ${minutes.toString().padStart(2, '0')}min`

      // Determinar status
      let status = 'Incompleto'
      if (entries.length === 0 && exits.length === 0) {
        status = 'Ausente'
      } else if (entries.length > 0 && exits.length > 0 && entries.length === exits.length) {
        status = 'Completo'
      } else if (entries.length > exits.length) {
        status = 'Em andamento'
      }

      return {
        date,
        status,
        totalHours,
        entries: entries.map((r) => ({
          id: r.id,
          timestamp: new Date(r.timestamp).toISOString(), // ISO cru para formatar no frontend
          machine: r.machine.name,
          location: r.machine.location,
        })),
        exits: exits.map((r) => ({
          id: r.id,
          timestamp: new Date(r.timestamp).toISOString(), // ISO cru para formatar no frontend
          machine: r.machine.name,
          location: r.machine.location,
        })),
      }
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: formattedDays,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  } catch (error: any) {
    console.error('❌ [API] Erro ao buscar histórico:', error)
    return NextResponse.json({ error: 'Erro ao buscar histórico de registros' }, { status: 500 })
  }
}
