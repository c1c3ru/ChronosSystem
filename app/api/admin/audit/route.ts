import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/audit - Buscar logs de auditoria do sistema
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const actionFilter = searchParams.get('action') || 'ALL'
    const searchTerm = searchParams.get('search') || ''

    const skip = (page - 1) * limit
    // Tipo estruturado compatível com o filtro do Prisma para AuditLog
    const whereClause: {
      action?: string
      OR?: Array<{
        details?: { contains: string; mode: 'insensitive' }
        user?: { name?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }
      }>
    } = {}

    if (actionFilter !== 'ALL') {
      whereClause.action = actionFilter
    }

    if (searchTerm) {
      whereClause.OR = [
        {
          details: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
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
        }
      ]
    }

    const total = await prisma.auditLog.count({ where: whereClause })

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
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
      data: logs.map(log => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        details: log.details,
        timestamp: log.timestamp.toISOString(),
        formattedDate: log.timestamp.toLocaleString('pt-BR'),
        user: log.user ? {
          name: log.user.name || 'Usuário Desconhecido',
          email: log.user.email,
          role: log.user.role
        } : {
          name: 'Sistema / Não Identificado',
          email: 'N/A',
          role: 'SYSTEM'
        }
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

  } catch (error: unknown) {
    console.error('❌ [API] Erro ao buscar logs de auditoria:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar logs de auditoria' },
      { status: 500 }
    )
  }
}
