import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/attendance/detailed-paginated - Buscar registros detalhados com paginação
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    // Parâmetros de paginação e filtros
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const searchTerm = searchParams.get('search') || ''
    const dateFilter = searchParams.get('date') || ''
    const typeFilter = searchParams.get('type') || 'ALL'
    const roleFilter = searchParams.get('role') || 'ALL'

    const skip = (page - 1) * limit

    // Construir filtros
    const whereClause: any = {}

    // Filtro de busca
    if (searchTerm) {
      whereClause.OR = [
        {
          user: {
            name: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            email: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        },
        {
          machine: {
            name: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    // Filtro de data
    if (dateFilter) {
      const date = new Date(dateFilter)
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      whereClause.timestamp = {
        gte: date,
        lt: nextDay
      }
    }

    // Filtro de tipo
    if (typeFilter !== 'ALL') {
      whereClause.type = typeFilter
    }

    // Filtro de role
    if (roleFilter !== 'ALL') {
      whereClause.user = {
        ...whereClause.user,
        role: roleFilter
      }
    }

    // Buscar total de registros
    const total = await prisma.attendanceRecord.count({
      where: whereClause
    })

    // Buscar registros paginados
    const records = await prisma.attendanceRecord.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        machine: {
          select: {
            id: true,
            name: true,
            location: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: records.map(record => ({
        id: record.id,
        timestamp: record.timestamp.toISOString(),
        type: record.type,
        user: record.user,
        machine: record.machine,
        formattedTime: record.timestamp.toLocaleString('pt-BR'),
        formattedDate: record.timestamp.toLocaleDateString('pt-BR'),
        formattedHour: record.timestamp.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

  } catch (error: any) {
    console.error('❌ [API] Erro ao buscar registros detalhados:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar registros' },
      { status: 500 }
    )
  }
}
