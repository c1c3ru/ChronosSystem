import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

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
        userId: session.user.id,
      },
      include: {
        reviewer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    interface JustificationWithReviewer {
      id: string
      type: string
      date: Date
      reason: string
      status: string
      adminResponse: string | null
      reviewedAt: Date | null
      reviewer: {
        name: string | null
        email: string
      } | null
      createdAt: Date
    }

    return NextResponse.json({
      success: true,
      justifications: (justifications as unknown as JustificationWithReviewer[]).map((j) => ({
        id: j.id,
        type: j.type,
        date: j.date.toISOString(),
        reason: j.reason,
        status: j.status,
        adminResponse: j.adminResponse,
        reviewedAt: j.reviewedAt?.toISOString(),
        reviewedBy: j.reviewer?.name,
        createdAt: j.createdAt.toISOString(),
      })),
    })
  } catch (error: unknown) {
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

    if (!['LATE', 'ABSENCE', 'EARLY_DEPARTURE'].includes(type)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    // Verificar se já existe justificativa para esta data
    const existingJustification = await prisma.justification.findFirst({
      where: {
        userId: session.user.id,
        date: new Date(date),
        type,
      },
    })

    if (existingJustification) {
      return NextResponse.json(
        { error: 'Já existe uma justificativa para esta data' },
        { status: 400 }
      )
    }

    // Contar quantas justificativas pendentes o usuário já tem
    const pendingCount = await prisma.justification.count({
      where: {
        userId: session.user.id,
        status: 'PENDING',
      },
    })

    // REGRA: Primeira justificativa é automática, demais precisam de aprovação admin
    // Mas todas começam como PENDING para revisão
    const justification = await prisma.justification.create({
      data: {
        userId: session.user.id,
        type,
        date: new Date(date),
        reason,
        status: 'PENDING',
      },
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'JUSTIFICATION_CREATED',
        resource: 'JUSTIFICATION',
        details: `Justificativa criada: ${type} para ${date} - ${pendingCount + 1}ª justificativa`,
      },
    })

    // 🎯 NOVO: Enviar notificação ao supervisor
    try {
      // Buscar todos os supervisores e admins
      const supervisors = await prisma.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'SUPERVISOR'],
          },
        },
        select: {
          email: true,
          name: true,
        },
      })

      // Buscar dados do usuário
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          email: true,
        },
      })

      // Enviar email para cada supervisor
      for (const supervisor of supervisors) {
        await emailService.sendJustificationSubmittedEmail(
          supervisor.email,
          supervisor.name || 'Supervisor',
          user?.name || 'Funcionário',
          user?.email || '',
          {
            type,
            date: justification.date.toISOString(),
            reason,
          }
        )
      }

      console.log(`📧 [NOTIFICATION] Emails enviados para ${supervisors.length} supervisor(es)`)
    } catch (emailError: unknown) {
      // Não falhar a criação da justificativa se o email falhar
      console.error('❌ [NOTIFICATION] Erro ao enviar notificação:', emailError)
    }

    return NextResponse.json({
      success: true,
      justification: {
        id: justification.id,
        type: justification.type,
        date: justification.date.toISOString(),
        reason: justification.reason,
        status: justification.status,
        isFirstJustification: pendingCount === 0,
      },
      message:
        pendingCount === 0
          ? 'Primeira justificativa criada. Aguardando revisão do administrador.'
          : 'Justificativa criada. Como você já possui outras justificativas, esta também aguardará aprovação do administrador.',
    })
  } catch (error: unknown) {
    console.error('Erro ao criar justificativa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
