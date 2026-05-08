import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/kiosk/recent-activity - Buscar atividade recente para o kiosk
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const machineId = searchParams.get('machineId')

    // Buscar os últimos 10 registros de ponto das últimas 24 horas
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const whereClause: any = {
      timestamp: {
        gte: twentyFourHoursAgo,
      },
    }

    if (machineId) {
      whereClause.machineId = machineId
    }

    const recentActivity = await prisma.attendanceRecord.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        machine: {
          select: {
            name: true,
            location: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 10,
    })

    interface ActivityRecord {
      id: string
      type: string
      timestamp: Date
      user: {
        name: string | null
        email: string
      }
      machine: {
        name: string
        location: string
      }
    }

    // Formatar dados para o frontend
    const formattedActivity = (recentActivity as unknown as ActivityRecord[]).map((record) => ({
      id: record.id,
      user: record.user.name || record.user.email.split('@')[0], // Nome ou primeira parte do email
      type: record.type,
      // timestamp cru em ISO; formatação fica no frontend para respeitar o timezone do dispositivo
      timestamp: record.timestamp.toISOString(),
      machine: record.machine.name,
      location: record.machine.location,
    }))

    return NextResponse.json({
      success: true,
      activity: formattedActivity,
      count: formattedActivity.length,
    })
  } catch (error: unknown) {
    console.error('Erro ao buscar atividade recente:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        activity: [],
        count: 0,
      },
      { status: 500 }
    )
  }
}
