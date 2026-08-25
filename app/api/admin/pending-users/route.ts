import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const preAuthorizeUserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'EMPLOYEE']),
  department: z.string().optional().nullable(),
})

// GET /api/admin/pending-users - Listar tentativas de login não autorizadas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar logs de tentativas não autorizadas
    const unauthorizedAttempts = await prisma.auditLog.findMany({
      where: {
        action: 'UNAUTHORIZED_GOOGLE_LOGIN_ATTEMPT',
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 50, // Últimas 50 tentativas
    })

    // Extrair emails únicos das tentativas
    const emailsFromLogs = unauthorizedAttempts
      .map((log: { details: string | null }) => {
        if (!log.details) return null
        const match = log.details.match(/não autorizada: (.+)$/)
        return match ? match[1] : null
      })
      .filter((email: string | null): email is string => email !== null)

    // Remover duplicatas e emails que já existem no sistema
    const uniqueEmails = Array.from(new Set(emailsFromLogs))

    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: uniqueEmails,
        },
      },
      select: {
        email: true,
      },
    })

    const existingEmails = existingUsers.map((user: { email: string }) => user.email)
    const pendingEmails = uniqueEmails.filter((email: string) => !existingEmails.includes(email))

    // Agrupar tentativas por email
    const pendingUsers = pendingEmails.map((email: string) => {
      const attempts = unauthorizedAttempts.filter(
        (log: { details: string | null }) => log.details && log.details.includes(email)
      )

      return {
        email,
        attemptCount: attempts.length,
        lastAttempt: attempts[0]?.timestamp,
        firstAttempt: attempts[attempts.length - 1]?.timestamp,
      }
    })

    return NextResponse.json({
      pendingUsers: pendingUsers.sort(
        (a, b) => new Date(b.lastAttempt || 0).getTime() - new Date(a.lastAttempt || 0).getTime()
      ),
      totalAttempts: unauthorizedAttempts.length,
    })
  } catch (error: unknown) {
    console.error('Erro ao buscar usuários pendentes:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/admin/pending-users - Autorizar usuário
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const rawBody = await request.json().catch(() => null)
    const parsed = preAuthorizeUserSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      )
    }
    const { email, name, role, department } = parsed.data

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Usuário já existe no sistema' }, { status: 400 })
    }

    // Criar usuário pré-autorizado
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        role,
        department: department || null,
        profileComplete: false, // Usuário precisará completar perfil no primeiro login
      },
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'USER_PRE_AUTHORIZED',
        resource: 'USER',
        details: `Usuário ${email} pré-autorizado com role ${role} por ${session.user.email}`,
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department,
      },
    })
  } catch (error: unknown) {
    console.error('Erro ao autorizar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
