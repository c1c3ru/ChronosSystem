import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/contracts/expiring - Verificar contratos próximos do fim
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const daysAhead = parseInt(searchParams.get('days') || '60') // Padrão: 60 dias
    const userId = searchParams.get('userId') // Para verificar usuário específico

    // Calcular data limite
    const limitDate = new Date()
    limitDate.setDate(limitDate.getDate() + daysAhead)

    // Se for para usuário específico
    if (userId) {
      // Verificar se o usuário pode acessar essas informações
      if (session.user.id !== userId && !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          contractEndDate: true,
          contractStartDate: true,
          contractType: true,
          department: true,
          role: true,
        },
      })

      if (!user || !user.contractEndDate) {
        return NextResponse.json({
          hasExpiringContract: false,
          message: 'Usuário não encontrado ou sem data de fim de contrato',
        })
      }

      const daysUntilExpiration = Math.ceil(
        (user.contractEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )

      return NextResponse.json({
        hasExpiringContract: daysUntilExpiration <= daysAhead && daysUntilExpiration > 0,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          contractEndDate: user.contractEndDate,
          contractStartDate: user.contractStartDate,
          contractType: user.contractType,
          department: user.department,
          role: user.role,
          daysUntilExpiration,
        },
      })
    }

    // Para admins/supervisores: listar todos os contratos próximos do fim
    if (!['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const expiringContracts = await prisma.user.findMany({
      where: {
        contractEndDate: {
          lte: limitDate,
          gt: new Date(), // Apenas contratos que ainda não expiraram
        },
        role: 'EMPLOYEE', // Apenas funcionários têm contratos
      },
      select: {
        id: true,
        name: true,
        email: true,
        contractEndDate: true,
        contractStartDate: true,
        contractType: true,
        department: true,
        phone: true,
        weeklyHours: true,
      },
      orderBy: {
        contractEndDate: 'asc',
      },
    })

    // Calcular dias até expiração para cada contrato
    const contractsWithDays = expiringContracts.map((user: any) => {
      const daysUntilExpiration = Math.ceil(
        (user.contractEndDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )

      let urgencyLevel: 'critical' | 'urgent' | 'warning' = 'warning'
      if (daysUntilExpiration <= 15) {
        urgencyLevel = 'critical'
      } else if (daysUntilExpiration <= 30) {
        urgencyLevel = 'urgent'
      }

      return {
        ...user,
        daysUntilExpiration,
        urgencyLevel,
      }
    })

    // Estatísticas
    const stats = {
      total: contractsWithDays.length,
      critical: contractsWithDays.filter((c: any) => c.urgencyLevel === 'critical').length,
      urgent: contractsWithDays.filter((c: any) => c.urgencyLevel === 'urgent').length,
      warning: contractsWithDays.filter((c: any) => c.urgencyLevel === 'warning').length,
    }

    return NextResponse.json({
      expiringContracts: contractsWithDays,
      stats,
      searchParams: {
        daysAhead,
        limitDate,
      },
    })
  } catch (error) {
    console.error('Erro ao verificar contratos expirando:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/contracts/expiring - Marcar contrato como renovado
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { userId, newEndDate, notes } = await request.json()

    if (!userId || !newEndDate) {
      return NextResponse.json({ error: 'userId e newEndDate são obrigatórios' }, { status: 400 })
    }

    // Atualizar data de fim do contrato
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        contractEndDate: new Date(newEndDate),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        contractEndDate: true,
      },
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CONTRACT_RENEWAL',
        resource: 'USER_CONTRACT',
        details: `Contrato renovado para ${updatedUser.name} (${updatedUser.email}). Nova data: ${newEndDate}${notes ? `. Observações: ${notes}` : ''}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Contrato renovado com sucesso',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Erro ao renovar contrato:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
