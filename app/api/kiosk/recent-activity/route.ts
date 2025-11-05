import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/kiosk/recent-activity - Buscar atividade recente para o kiosk
export async function GET() {
  try {
    // Buscar os últimos 10 registros de ponto das últimas 24 horas
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const recentActivity = await prisma.attendanceRecord.findMany({
      where: {
        timestamp: {
          gte: twentyFourHoursAgo
        }
      },
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
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    })

    // Formatar dados para o frontend
    const formattedActivity = recentActivity.map(record => ({
      id: record.id,
      user: record.user.name || record.user.email.split('@')[0], // Nome ou primeira parte do email
      type: record.type,
      time: record.timestamp.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      timestamp: record.timestamp,
      machine: record.machine.name,
      location: record.machine.location
    }))

    return NextResponse.json({
      success: true,
      activity: formattedActivity,
      count: formattedActivity.length
    })

  } catch (error) {
    console.error('Erro ao buscar atividade recente:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        activity: [],
        count: 0
      }, 
      { status: 500 }
    )
  }
}
