import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * API para enviar notificações automáticas de justificativas
 *
 * POST /api/notifications/send-justification-alerts
 *
 * Envia emails para usuários com pendências de justificativa
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Apenas admins podem disparar notificações em massa
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { userId } = await request.json()

    // Se userId for fornecido, envia apenas para esse usuário
    // Caso contrário, envia para todos os usuários com pendências

    let usersToNotify: any[] = []

    if (userId) {
      // Notificar apenas um usuário específico
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
        },
      })

      if (user) {
        usersToNotify = [user]
      }
    } else {
      // Notificar todos os usuários com role EMPLOYEE
      usersToNotify = await prisma.user.findMany({
        where: {
          role: 'EMPLOYEE',
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      })
    }

    const results = {
      total: usersToNotify.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      details: [] as any[],
    }

    // Para cada usuário, verificar pendências e enviar email
    for (const user of usersToNotify) {
      try {
        // Buscar pendências do usuário
        const response = await fetch(
          `${process.env.NEXTAUTH_URL}/api/justifications/pending?userId=${user.id}`,
          {
            headers: {
              Cookie: request.headers.get('cookie') || '',
            },
          }
        )

        if (!response.ok) {
          results.failed++
          results.details.push({
            userId: user.id,
            email: user.email,
            status: 'error',
            message: 'Erro ao buscar pendências',
          })
          continue
        }

        const pendingIssues = await response.json()

        // Se não há pendências, pular
        if (!pendingIssues || pendingIssues.length === 0) {
          results.skipped++
          results.details.push({
            userId: user.id,
            email: user.email,
            status: 'skipped',
            message: 'Sem pendências',
          })
          continue
        }

        // Enviar email de notificação
        const emailSent = await emailService.sendJustificationRequiredEmail(
          user.email,
          user.name || 'Usuário',
          pendingIssues.map((issue: any) => ({
            date: issue.date,
            type: issue.type,
            description: issue.description,
          }))
        )

        if (emailSent) {
          results.sent++
          results.details.push({
            userId: user.id,
            email: user.email,
            status: 'sent',
            pendingCount: pendingIssues.length,
          })
        } else {
          results.failed++
          results.details.push({
            userId: user.id,
            email: user.email,
            status: 'error',
            message: 'Erro ao enviar email',
          })
        }
      } catch (error: any) {
        results.failed++
        results.details.push({
          userId: user.id,
          email: user.email,
          status: 'error',
          message: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notificações processadas: ${results.sent} enviadas, ${results.failed} falharam, ${results.skipped} puladas`,
      results,
    })
  } catch (error: any) {
    console.error('Erro ao enviar notificações:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
