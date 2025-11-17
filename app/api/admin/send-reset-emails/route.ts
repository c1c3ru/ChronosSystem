import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import { z } from 'zod'

// Schema para validação
const sendEmailsSchema = z.object({
  tokenIds: z.array(z.string()).min(1, 'Pelo menos um token deve ser selecionado'),
  customMessage: z.string().optional()
})

// POST /api/admin/send-reset-emails - Enviar emails de reset
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = sendEmailsSchema.parse(body)

    // Buscar tokens válidos
    const tokens = await (prisma as any).passwordResetToken.findMany({
      where: {
        id: { in: validatedData.tokenIds },
        used: false,
        expires: { gt: new Date() }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'Nenhum token válido encontrado' }, { status: 400 })
    }

    const emailResults = []
    let successCount = 0
    let failureCount = 0

    // Enviar emails
    for (const token of tokens) {
      try {
        const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token.token}`
        
        const emailSent = await emailService.sendPasswordResetEmail({
          userName: token.user.name || 'Usuário',
          userEmail: token.user.email,
          resetUrl,
          expiresAt: token.expires,
          reason: validatedData.customMessage
        })

        if (emailSent) {
          successCount++
          emailResults.push({
            userId: token.user.id,
            email: token.user.email,
            status: 'success'
          })
        } else {
          failureCount++
          emailResults.push({
            userId: token.user.id,
            email: token.user.email,
            status: 'failed',
            error: 'Falha no envio'
          })
        }
      } catch (error) {
        failureCount++
        emailResults.push({
          userId: token.user.id,
          email: token.user.email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SEND_RESET_EMAILS',
        resource: 'PASSWORD_RESET_EMAIL',
        details: `Emails enviados: ${successCount} sucessos, ${failureCount} falhas. Tokens: ${validatedData.tokenIds.join(', ')}`
      }
    })

    return NextResponse.json({
      success: true,
      message: `Emails processados: ${successCount} enviados, ${failureCount} falharam`,
      results: {
        total: tokens.length,
        success: successCount,
        failed: failureCount,
        details: emailResults
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Dados inválidos', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Erro ao enviar emails de reset:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET /api/admin/send-reset-emails - Obter estatísticas de envio
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar logs de envio de email dos últimos 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const emailLogs = await prisma.auditLog.findMany({
      where: {
        action: 'SEND_RESET_EMAILS',
        timestamp: { gte: thirtyDaysAgo }
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Estatísticas
    const stats = {
      totalEmailsSent: emailLogs.length,
      last24Hours: emailLogs.filter(log => 
        log.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
      last7Days: emailLogs.filter(log => 
        log.timestamp >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      recentLogs: emailLogs.slice(0, 10).map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        details: log.details,
        sentBy: log.user?.name || 'Sistema'
      }))
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erro ao obter estatísticas de email:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
