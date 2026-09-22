import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyHashChain, type HashChainRecord } from '@/lib/qr-security'
import { logger } from '@/lib/logger'

// GET /api/admin/audit/verify-hash-chain
// Verifica a integridade da cadeia de hash (HMAC) dos registros de ponto.
// Query params opcionais:
//   userId    - verifica apenas os registros de um usuário (histórico completo)
//   sinceDays - quando userId não é informado, limita a varredura aos últimos N dias (padrão 30)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') || undefined
    const sinceDays = Math.max(1, parseInt(searchParams.get('sinceDays') || '30', 10) || 30)

    const records = await prisma.attendanceRecord.findMany({
      where: userId
        ? { userId }
        : { timestamp: { gte: new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000) } },
      select: {
        id: true,
        userId: true,
        machineId: true,
        type: true,
        timestamp: true,
        prevHash: true,
        hash: true,
      },
      orderBy: [{ userId: 'asc' }, { timestamp: 'asc' }],
    })

    const recordsByUser = new Map<string, HashChainRecord[]>()
    for (const record of records) {
      const existing = recordsByUser.get(record.userId)
      if (existing) {
        existing.push(record)
      } else {
        recordsByUser.set(record.userId, [record])
      }
    }

    const violatingUsers: {
      userId: string
      violations: ReturnType<typeof verifyHashChain>
    }[] = []

    for (const [uid, userRecords] of recordsByUser) {
      const violations = verifyHashChain(userRecords)
      if (violations.length > 0) {
        violatingUsers.push({ userId: uid, violations })
      }
    }

    return NextResponse.json({
      scannedRecords: records.length,
      scannedUsers: recordsByUser.size,
      scope: userId ? { userId } : { sinceDays },
      isValid: violatingUsers.length === 0,
      violatingUsers,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error('Erro ao verificar cadeia de hash', { error: errorMessage })
    return NextResponse.json(
      {
        error: 'Erro ao verificar cadeia de hash',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}
