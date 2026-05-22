import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/kiosk/machines - Listar máquinas ativas (público para kiosk)
export async function GET(request: NextRequest) {
  try {
    const machines = await prisma.machine.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        location: true,
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      success: true,
      machines,
    })
  } catch (error) {
    console.error('Erro ao listar máquinas:', error)
    return NextResponse.json({ error: 'Erro ao listar máquinas' }, { status: 500 })
  }
}
