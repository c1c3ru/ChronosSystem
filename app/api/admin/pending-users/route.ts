import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
        action: 'UNAUTHORIZED_GOOGLE_LOGIN_ATTEMPT'
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50 // Últimas 50 tentativas
    })

    // Extrair emails únicos das tentativas
    const emailsFromLogs = unauthorizedAttempts
      .map(log => {
        if (!log.details) return null
        const match = log.details.match(/não autorizada: (.+)$/)
        return match ? match[1] : null
      })
      .filter(email => email !== null)

    // Remover duplicatas e emails que já existem no sistema
    const uniqueEmails = Array.from(new Set(emailsFromLogs))
    
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: uniqueEmails
        }
      },
      select: {
        email: true
      }
    })

    const existingEmails = existingUsers.map(user => user.email)
    const pendingEmails = uniqueEmails.filter(email => !existingEmails.includes(email))

    // Agrupar tentativas por email
    const pendingUsers = pendingEmails.map(email => {
      const attempts = unauthorizedAttempts.filter(log => 
        log.details && log.details.includes(email)
      )
      
      return {
        email,
        attemptCount: attempts.length,
        lastAttempt: attempts[0]?.timestamp,
        firstAttempt: attempts[attempts.length - 1]?.timestamp
      }
    })

    return NextResponse.json({
      pendingUsers: pendingUsers.sort((a, b) => 
        new Date(b.lastAttempt || 0).getTime() - new Date(a.lastAttempt || 0).getTime()
      ),
      totalAttempts: unauthorizedAttempts.length
    })
  } catch (error) {
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

    const { email, name, role, department } = await request.json()

    if (!email || !name || !role) {
      return NextResponse.json({ error: 'Email, nome e role são obrigatórios' }, { status: 400 })
    }

    if (!['ADMIN', 'SUPERVISOR', 'EMPLOYEE'].includes(role)) {
      return NextResponse.json({ error: 'Role inválido' }, { status: 400 })
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
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
      }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'USER_PRE_AUTHORIZED',
        resource: 'USER',
        details: `Usuário ${email} pré-autorizado com role ${role} por ${session.user.email}`
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department
      }
    })
  } catch (error) {
    console.error('Erro ao autorizar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
