import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/kiosk-secret - Retorna o segredo de provisionamento configurado
// no servidor (KIOSK_PROVISION_SECRET), para o admin digitar na tela de setup
// de um terminal físico (/kiosk). Não é gerado por usuário: é um único valor
// compartilhado, definido nas variáveis de ambiente do deploy.
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const secret = process.env.KIOSK_PROVISION_SECRET

  if (!secret) {
    return NextResponse.json(
      {
        configured: false,
        error: 'KIOSK_PROVISION_SECRET não está configurado nas variáveis de ambiente do servidor.',
      },
      { status: 200 }
    )
  }

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'KIOSK_SECRET_VIEWED',
      resource: 'KIOSK_PROVISIONING',
      details: `Segredo de provisionamento do kiosk visualizado por ${session.user.email}`,
    },
  })

  return NextResponse.json({ configured: true, secret })
}
