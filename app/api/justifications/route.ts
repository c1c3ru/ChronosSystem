import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiLogger } from '@/lib/logger'

// GET /api/justifications - Buscar justificativas do usuário

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    apiLogger.debug('Fetching user justifications', { userId: session.user.id })

    const justifications = await prisma.justification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    apiLogger.debug('Justifications fetched', { count: justifications.length })

    return NextResponse.json(justifications)
  } catch (error: any) {
    apiLogger.error('Error fetching justifications', { error: error.message })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/justifications - Criar nova justificativa
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { type, date, reason } = await request.json()

    if (!type || !date || !reason) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    if (reason.length < 10) {
      return NextResponse.json(
        { error: 'Justificativa deve ter pelo menos 10 caracteres' },
        { status: 400 }
      )
    }

    apiLogger.debug('Creating justification', { userId: session.user.id, type, date })

    // Criar justificativa no banco de dados
    const justification = await prisma.justification.create({
      data: {
        userId: session.user.id,
        type,
        date: new Date(date),
        reason,
        status: 'PENDING',
      },
    })

    apiLogger.info('Justification created', { id: justification.id, userId: session.user.id })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_JUSTIFICATION',
        resource: 'JUSTIFICATION',
        details: `Justificativa criada para ${type} em ${date}`,
      },
    })

    return NextResponse.json(justification)
  } catch (error: any) {
    apiLogger.error('Error creating justification', { error: error.message })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
