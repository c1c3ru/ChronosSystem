import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import { apiLogger } from '@/lib/logger'
import { AttendanceRecord } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * API de Cron Job para verificação diária de justificativas pendentes
 *
 * GET /api/cron/daily-justification-check
 *
 * Esta API deve ser chamada diariamente (ex: 9h da manhã) por um serviço de cron
 * como Vercel Cron Jobs, GitHub Actions, ou similar.
 *
 * Configuração Vercel Cron (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-justification-check",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação do cron (opcional mas recomendado)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    apiLogger.info('Starting daily justification check')

    // Buscar todos os usuários com role EMPLOYEE
    const employees = await prisma.user.findMany({
      where: {
        role: 'EMPLOYEE',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    const results = {
      total: employees.length,
      sent: 0,
      skipped: 0,
      failed: 0,
      details: [] as Record<string, unknown>[],
    }

    // Para cada funcionário, verificar pendências
    for (const employee of employees) {
      try {
        // Buscar pendências usando a API interna
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const attendanceRecords = await prisma.attendanceRecord.findMany({
          where: {
            userId: employee.id,
            timestamp: {
              gte: thirtyDaysAgo,
            },
          },
        })

        const existingJustifications = await prisma.justification.findMany({
          where: {
            userId: employee.id,
            date: {
              gte: thirtyDaysAgo,
            },
          },
        })

        // Agrupar registros por dia
        const dayRecords = new Map<string, AttendanceRecord[]>()
        attendanceRecords.forEach((record) => {
          const dateKey = record.timestamp.toISOString().split('T')[0]
          if (!dayRecords.has(dateKey)) {
            dayRecords.set(dateKey, [])
          }
          dayRecords.get(dateKey)!.push(record)
        })

        // Verificar justificativas pendentes (sem aprovação)
        const justificationMap = new Map(
          existingJustifications
            .filter((j) => j.status !== 'APPROVED')
            .map((j) => [j.date.toISOString().split('T')[0], j])
        )

        if (justificationMap.size > 0) {
          // Encontrar a mais antiga
          const oldestDate = Array.from(justificationMap.keys()).sort()[0]

          // Enviar lembrete
          const emailSent = await emailService.sendDailyPendingReminder(
            employee.email,
            employee.name || 'Funcionário',
            justificationMap.size,
            oldestDate
          )

          if (emailSent) {
            results.sent++
            results.details.push({
              userId: employee.id,
              email: employee.email,
              status: 'sent',
              pendingCount: justificationMap.size,
              oldestDate,
            })
            apiLogger.info('Reminder sent', {
              email: employee.email,
              pendingCount: justificationMap.size,
            })
          } else {
            results.failed++
            results.details.push({
              userId: employee.id,
              email: employee.email,
              status: 'failed',
              message: 'Erro ao enviar email',
            })
          }
        } else {
          results.skipped++
          results.details.push({
            userId: employee.id,
            email: employee.email,
            status: 'skipped',
            message: 'Sem pendências',
          })
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        results.failed++
        results.details.push({
          userId: employee.id,
          email: employee.email,
          status: 'error',
          message: errorMessage,
        })
        apiLogger.error('Error processing employee', {
          email: employee.email,
          error: errorMessage,
        })
      }
    }

    apiLogger.info('Daily justification check completed', {
      total: results.total,
      sent: results.sent,
      skipped: results.skipped,
      failed: results.failed,
    })

    return NextResponse.json({
      success: true,
      message: `Verificação diária concluída: ${results.sent} lembretes enviados`,
      timestamp: new Date().toISOString(),
      results,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    apiLogger.error('Error in daily justification check', { error: errorMessage })
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}
