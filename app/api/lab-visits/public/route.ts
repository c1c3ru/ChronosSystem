import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimiters, withRateLimit } from '@/lib/rate-limit'
import { PUBLIC_VISIT_SELECT } from '@/lib/lab-visits'

// GET /api/lab-visits/public
// Rota pública (sem autenticação): lista as visitas já confirmadas para que
// escolas vejam o que já está agendado antes de solicitar um horário.
//
// LGPD: a filtragem acontece na própria query do Prisma via
// PUBLIC_VISIT_SELECT — contactEmail/contactPhone nunca são lidos do banco
// nesta rota, então não há risco de vazamento por esquecimento de campo
// em uma serialização manual.
export async function GET(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(rateLimiters.general)(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const visits = await prisma.labVisit.findMany({
      where: { status: 'CONFIRMED' },
      select: PUBLIC_VISIT_SELECT,
      orderBy: { visitDate: 'asc' },
    })

    return NextResponse.json({ visits })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Erro ao carregar visitas confirmadas', details: errorMessage },
      { status: 500 }
    )
  }
}
