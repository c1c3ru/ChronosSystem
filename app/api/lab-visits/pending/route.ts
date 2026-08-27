import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { staffVisitSelect } from '@/lib/lab-visits'

// GET /api/lab-visits/pending
// Rota autenticada (401 sem sessão): lista as visitas PENDING com dados
// completos (inclui contato) para a equipe interna analisar e aprovar.
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const visits = await prisma.labVisit.findMany({
      where: { status: 'PENDING' },
      select: staffVisitSelect,
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ visits })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Erro ao carregar visitas pendentes', details: errorMessage },
      { status: 500 }
    )
  }
}
