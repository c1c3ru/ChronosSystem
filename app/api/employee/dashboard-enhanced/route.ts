import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface WorkingHours {
  start: string // "08:00"
  end: string   // "17:00"
  lunchStart: string // "12:00"
  lunchEnd: string   // "13:00"
}

// Horários padrão IFCE (pode ser configurável por usuário no futuro)
const DEFAULT_WORKING_HOURS: WorkingHours = {
  start: "08:00",
  end: "17:00", 
  lunchStart: "12:00",
  lunchEnd: "13:00"
}

// GET /api/employee/dashboard-enhanced - Dashboard com análise de atrasos e alertas
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] Enhanced dashboard - Verificando sessão...')
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const userId = session.user.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Buscar último registro do usuário
    const lastRecord = await prisma.attendanceRecord.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      include: {
        machine: {
          select: {
            name: true,
            location: true
          }
        }
      }
    })

    // Verificar se está trabalhando
    const isWorking = lastRecord?.type === 'ENTRY'

    // Buscar registros de hoje
    const todayRecords = await prisma.attendanceRecord.findMany({
      where: {
        userId,
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        machine: {
          select: {
            name: true,
            location: true
          }
        }
      },
      orderBy: { timestamp: 'asc' }
    })

    // Analisar situação de hoje
    const todayAnalysis = analyzeTodayRecords(todayRecords, DEFAULT_WORKING_HOURS)

    // Buscar registros recentes (últimos 7 dias) com análise
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentRecords = await prisma.attendanceRecord.findMany({
      where: {
        userId,
        timestamp: {
          gte: sevenDaysAgo
        }
      },
      include: {
        machine: {
          select: {
            name: true,
            location: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 20
    })

    // Agrupar registros por dia e analisar
    const recordsByDay = groupRecordsByDay(recentRecords)
    const analyzedDays = recordsByDay.map(dayRecords => 
      analyzeDayRecords(dayRecords, DEFAULT_WORKING_HOURS)
    )

    // Contar justificativas pendentes
    const pendingJustifications = await prisma.justification.count({
      where: {
        userId,
        status: 'PENDING'
      }
    })

    // Verificar quantas faltas/atrasos sem justificativa
    const unjustifiedIssues = analyzedDays.filter(day => 
      day && (day.alerts.length > 0) && !day.hasJustification
    ).length

    return NextResponse.json({
      success: true,
      workStatus: {
        isWorking,
        lastRecord: lastRecord ? {
          type: lastRecord.type,
          time: lastRecord.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          location: lastRecord.machine.location,
          label: lastRecord.type === 'ENTRY' ? 'Entrada' : 'Saída'
        } : null,
        todayHours: todayAnalysis.totalHours,
        todayStatus: todayAnalysis.status,
        todayAlerts: todayAnalysis.alerts
      },
      analyzedDays: analyzedDays.slice(0, 5), // Últimos 5 dias
      alerts: {
        pendingJustifications,
        unjustifiedIssues,
        needsAttention: unjustifiedIssues > 0 || pendingJustifications > 0
      }
    })

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

function analyzeTodayRecords(records: any[], workingHours: WorkingHours) {
  if (records.length === 0) {
    return {
      totalHours: '0h 00min',
      status: 'absent' as const,
      alerts: [{
        type: 'absence' as const,
        message: 'Nenhum registro hoje',
        severity: 'high' as const
      }]
    }
  }

  const entries = records.filter(r => r.type === 'ENTRY')
  const exits = records.filter(r => r.type === 'EXIT')
  const alerts: any[] = []

  // Verificar primeiro registro (entrada)
  if (entries.length > 0) {
    const firstEntry = entries[0]
    const entryTime = firstEntry.timestamp
    const expectedStart = parseTime(workingHours.start)
    
    if (entryTime.getHours() * 60 + entryTime.getMinutes() > expectedStart + 30) {
      const delayMinutes = (entryTime.getHours() * 60 + entryTime.getMinutes()) - expectedStart
      alerts.push({
        type: 'late_arrival',
        message: `Atraso de ${delayMinutes} minutos na entrada`,
        severity: delayMinutes > 60 ? 'high' : 'medium',
        time: firstEntry.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        expectedTime: workingHours.start
      })
    }
  }

  // Calcular horas trabalhadas
  let totalMinutes = 0
  for (let i = 0; i < Math.min(entries.length, exits.length); i++) {
    const entryTime = entries[i].timestamp.getTime()
    const exitTime = exits[i].timestamp.getTime()
    totalMinutes += (exitTime - entryTime) / (1000 * 60)
  }

  // Se ainda está trabalhando, calcular até agora
  if (entries.length > exits.length) {
    const lastEntry = entries[entries.length - 1]
    const now = new Date()
    totalMinutes += (now.getTime() - lastEntry.timestamp.getTime()) / (1000 * 60)
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)
  const totalHours = `${hours}h ${minutes.toString().padStart(2, '0')}min`

  // Determinar status
  let status: 'working' | 'completed' | 'incomplete' | 'absent' = 'working'
  if (entries.length === 0) {
    status = 'absent'
  } else if (entries.length === exits.length) {
    status = totalMinutes >= 480 ? 'completed' : 'incomplete' // 8 horas = 480 min
  }

  return {
    totalHours,
    status,
    alerts
  }
}

function groupRecordsByDay(records: any[]) {
  const groups = new Map()
  
  records.forEach(record => {
    const date = record.timestamp.toDateString()
    if (!groups.has(date)) {
      groups.set(date, [])
    }
    groups.get(date).push(record)
  })
  
  return Array.from(groups.values())
}

function analyzeDayRecords(dayRecords: any[], workingHours: WorkingHours) {
  if (dayRecords.length === 0) return null

  const date = dayRecords[0].timestamp
  const entries = dayRecords.filter(r => r.type === 'ENTRY')
  const exits = dayRecords.filter(r => r.type === 'EXIT')
  const alerts: any[] = []

  // Análise similar ao dia atual
  if (entries.length > 0) {
    const firstEntry = entries[0]
    const entryTime = firstEntry.timestamp
    const expectedStart = parseTime(workingHours.start)
    
    if (entryTime.getHours() * 60 + entryTime.getMinutes() > expectedStart + 30) {
      const delayMinutes = (entryTime.getHours() * 60 + entryTime.getMinutes()) - expectedStart
      alerts.push({
        type: 'late_arrival',
        message: `Atraso de ${delayMinutes} minutos`,
        severity: delayMinutes > 60 ? 'high' : 'medium'
      })
    }
  }

  // Calcular horas
  let totalMinutes = 0
  for (let i = 0; i < Math.min(entries.length, exits.length); i++) {
    const entryTime = entries[i].timestamp.getTime()
    const exitTime = exits[i].timestamp.getTime()
    totalMinutes += (exitTime - entryTime) / (1000 * 60)
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)

  return {
    date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    fullDate: date,
    entry: entries[0]?.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    exit: exits[0]?.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    totalHours: `${hours}h ${minutes.toString().padStart(2, '0')}min`,
    status: entries.length === 0 ? 'absent' : 
            entries.length === exits.length ? 'completed' : 'incomplete',
    alerts,
    location: dayRecords[0].machine.location,
    hasJustification: false // TODO: verificar se há justificativa para este dia
  }
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}
