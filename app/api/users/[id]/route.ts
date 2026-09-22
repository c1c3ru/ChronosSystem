import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { z } from 'zod'
import { UserCache } from '@/lib/cache'
import { BCRYPT_SALT_ROUNDS, MIN_PASSWORD_LENGTH } from '@/lib/password-policy'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(MIN_PASSWORD_LENGTH).optional(),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'EMPLOYEE']).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  registrationNumber: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/users/[id] - Buscar usuário por ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Usuários podem ver seus próprios dados, admins/supervisores podem ver todos
    if (session.user.id !== id && !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        birthDate: true,
        emergencyContact: true,
        emergencyPhone: true,
        department: true,
        startDate: true,
        siapeNumber: true,
        registrationNumber: true,
        contractType: true,
        weeklyHours: true,
        dailyHours: true,
        profileComplete: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            attendanceRecords: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error: unknown) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT /api/users/[id] - Atualizar usuário
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar permissões
    const canEdit = session.user.id === id || ['ADMIN', 'SUPERVISOR'].includes(session.user.role)
    if (!canEdit) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar conflitos de email
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (emailExists) {
        return NextResponse.json({ error: 'Email já está em uso' }, { status: 400 })
      }
    }

    // Apenas ADMIN pode alterar isActive
    if ('isActive' in validatedData && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem ativar/desativar perfis' },
        { status: 403 }
      )
    }

    // Apenas ADMIN pode alterar role — SUPERVISOR também pode chegar até
    // aqui (edição do próprio perfil), então sem esta checagem um
    // SUPERVISOR poderia se auto-promover a ADMIN via PUT no próprio id.
    if ('role' in validatedData && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem alterar o nível de acesso (role)' },
        { status: 403 }
      )
    }

    // Preparar dados para atualização
    const updateData: Record<string, unknown> = { ...validatedData } as Record<string, unknown>

    // Hash da senha se fornecida
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, BCRYPT_SALT_ROUNDS)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_USER',
        resource: 'USER',
        details: `Usuário atualizado: ${user.email}`,
      },
    })

    // Invalidate user cache
    await UserCache.invalidate(id)
    await UserCache.invalidateAll()

    return NextResponse.json(user)
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Deletar usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Não permitir deletar a si mesmo
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Não é possível deletar sua própria conta' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    await prisma.user.delete({
      where: { id },
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_USER',
        resource: 'USER',
        details: `Usuário deletado: ${user.email} (${user.role})`,
      },
    })

    // Invalidate user cache
    await UserCache.invalidate(id)
    await UserCache.invalidateAll()

    return NextResponse.json({ message: 'Usuário deletado com sucesso' })
  } catch (error: unknown) {
    console.error('Erro ao deletar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
