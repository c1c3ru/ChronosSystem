import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard/activity - Atividade recente
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Buscar registros recentes com dados do usuário e máquina
    const recentRecords = await prisma.attendanceRecord.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        machine: {
          select: {
            name: true,
            location: true
          }
        }
      }
    })

    // Formatar dados para o frontend
    const activity = recentRecords.map(record => ({
      id: record.id,
      user: record.user.name || record.user.email,
      action: record.type === 'ENTRY' ? 'registrou entrada' : 'registrou saída',
      timestamp: formatTimeAgo(record.timestamp),
      type: record.type,
      location: record.machine.name,
      fullLocation: record.machine.location,
      rawTimestamp: record.timestamp
    }))

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Erro ao buscar atividade recente:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Função auxiliar para formatar tempo relativo
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'há poucos segundos'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `há ${hours} hora${hours > 1 ? 's' : ''}`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `há ${days} dia${days > 1 ? 's' : ''}`
  }
}
