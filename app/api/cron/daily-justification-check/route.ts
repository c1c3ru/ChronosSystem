import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

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

        console.log('🔔 [CRON] Iniciando verificação diária de justificativas...')

        // Buscar todos os usuários com role EMPLOYEE
        const employees = await prisma.user.findMany({
            where: {
                role: 'EMPLOYEE'
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        })

        const results = {
            total: employees.length,
            sent: 0,
            skipped: 0,
            failed: 0,
            details: [] as any[]
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
                            gte: thirtyDaysAgo
                        }
                    }
                })

                const existingJustifications = await prisma.justification.findMany({
                    where: {
                        userId: employee.id,
                        date: {
                            gte: thirtyDaysAgo
                        }
                    }
                })

                // Análise simplificada: verificar dias sem justificativa aprovada
                const pendingIssues: any[] = []

                // Agrupar registros por dia
                const dayRecords = new Map<string, any[]>()
                attendanceRecords.forEach(record => {
                    const dateKey = record.timestamp.toISOString().split('T')[0]
                    if (!dayRecords.has(dateKey)) {
                        dayRecords.set(dateKey, [])
                    }
                    dayRecords.get(dateKey)!.push(record)
                })

                // Verificar justificativas pendentes (sem aprovação)
                const justificationMap = new Map(
                    existingJustifications
                        .filter(j => j.status !== 'APPROVED')
                        .map(j => [j.date.toISOString().split('T')[0], j])
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
                            oldestDate
                        })
                        console.log(`✅ [CRON] Lembrete enviado para ${employee.email} (${justificationMap.size} pendências)`)
                    } else {
                        results.failed++
                        results.details.push({
                            userId: employee.id,
                            email: employee.email,
                            status: 'failed',
                            message: 'Erro ao enviar email'
                        })
                    }
                } else {
                    results.skipped++
                    results.details.push({
                        userId: employee.id,
                        email: employee.email,
                        status: 'skipped',
                        message: 'Sem pendências'
                    })
                }

            } catch (error: any) {
                results.failed++
                results.details.push({
                    userId: employee.id,
                    email: employee.email,
                    status: 'error',
                    message: error.message
                })
                console.error(`❌ [CRON] Erro ao processar ${employee.email}:`, error)
            }
        }

        console.log(`🔔 [CRON] Verificação concluída:`, {
            total: results.total,
            sent: results.sent,
            skipped: results.skipped,
            failed: results.failed
        })

        return NextResponse.json({
            success: true,
            message: `Verificação diária concluída: ${results.sent} lembretes enviados`,
            timestamp: new Date().toISOString(),
            results
        })

    } catch (error: any) {
        console.error('❌ [CRON] Erro na verificação diária:', error)
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 })
    }
}
