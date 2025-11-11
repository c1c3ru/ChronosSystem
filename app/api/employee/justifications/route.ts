import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/employee/justifications - Listar justificativas do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const justifications = await prisma.justification.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        reviewer: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      justifications: justifications.map(j => ({
        id: j.id,
        type: j.type,
        date: j.date.toLocaleDateString('pt-BR'),
        reason: j.reason,
        status: j.status,
        adminResponse: j.adminResponse,
        reviewedAt: j.reviewedAt?.toLocaleDateString('pt-BR'),
        reviewedBy: j.reviewer?.name,
        createdAt: j.createdAt.toLocaleDateString('pt-BR')
      }))
    })
  } catch (error) {
    console.error('Erro ao buscar justificativas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/employee/justifications - Criar nova justificativa
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { type, date, reason } = await request.json()

    if (!type || !date || !reason) {
      return NextResponse.json({ error: 'Tipo, data e motivo são obrigatórios' }, { status: 400 })
    }

    if (!['LATE', 'ABSENCE'].includes(type)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    // Verificar se já existe justificativa para esta data
    const existingJustification = await prisma.justification.findFirst({
      where: {
        userId: session.user.id,
        date: new Date(date),
        type
      }
    })

    if (existingJustification) {
      return NextResponse.json({ error: 'Já existe uma justificativa para esta data' }, { status: 400 })
    }

    // Contar quantas justificativas pendentes o usuário já tem
    const pendingCount = await prisma.justification.count({
      where: {
        userId: session.user.id,
        status: 'PENDING'
      }
    })

    // REGRA: Primeira justificativa é automática, demais precisam de aprovação admin
    // Mas todas começam como PENDING para revisão
    const justification = await prisma.justification.create({
      data: {
        userId: session.user.id,
        type,
        date: new Date(date),
        reason,
        status: 'PENDING'
      }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'JUSTIFICATION_CREATED',
        resource: 'JUSTIFICATION',
        details: `Justificativa criada: ${type} para ${date} - ${pendingCount + 1}ª justificativa`
      }
    })

    return NextResponse.json({
      success: true,
      justification: {
        id: justification.id,
        type: justification.type,
        date: justification.date.toLocaleDateString('pt-BR'),
        reason: justification.reason,
        status: justification.status,
        isFirstJustification: pendingCount === 0
      },
      message: pendingCount === 0 
        ? 'Primeira justificativa criada. Aguardando revisão do administrador.'
        : 'Justificativa criada. Como você já possui outras justificativas, esta também aguardará aprovação do administrador.'
    })
  } catch (error) {
    console.error('Erro ao criar justificativa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
