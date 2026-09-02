import { NextRequest, NextResponse } from 'next/server'
import { checkAndNotifyAttendance } from '@/lib/notifications'
import { checkCronAuth } from '@/lib/cron-auth'
import { apiLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Fail-closed em qualquer ambiente: nunca depender de NODE_ENV para decidir
  // se a autenticação é aplicada (ver lib/cron-auth.ts).
  const auth = checkCronAuth(request)
  if (!auth.authorized) {
    if (auth.reason === 'missing_secret') {
      apiLogger.error('Cron auth failed: CRON_SECRET não configurado no servidor', {
        path: request.nextUrl.pathname,
      })
      return NextResponse.json(
        { error: 'Erro de configuração do servidor: CRON_SECRET não definido' },
        { status: 500 }
      )
    }

    apiLogger.security('Tentativa de acesso não autorizado ao cron de notificações', {
      reason: auth.reason,
      ip: request.headers.get('x-forwarded-for') || undefined,
    })
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const results = await checkAndNotifyAttendance()
    return NextResponse.json({
      success: true,
      processedAt: new Date().toISOString(),
      notificationsSent: results,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Erro no processamento do cron de notificações:', error)
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
