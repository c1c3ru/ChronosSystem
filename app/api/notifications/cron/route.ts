import { NextRequest, NextResponse } from 'next/server'
import { checkAndNotifyAttendance } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Verificar autorização do Vercel Cron
  // Em desenvolvimento, você pode pular isso ou definir CRON_SECRET no .env.local
  const authHeader = request.headers.get('authorization')
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Não autorizado', { status: 401 })
    }
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
