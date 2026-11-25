import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { UserCache } from '@/lib/cache'
import { BCRYPT_SALT_ROUNDS, MIN_PASSWORD_LENGTH } from '@/lib/password-policy'
import { isValidContractDate, toDateOnly } from '@/lib/contract-date'
import {
  PROFILE_MESSAGES,
  SELF_EDITABLE_PROFILE_FIELDS,
  TIME_PATTERN,
  validateShiftTimes,
} from '@/lib/profile-validation'
import {
  describeSchedule,
  resolveWeeklySchedule,
  sortSchedule,
  summarizeSchedule,
  validateWeeklySchedule,
  type ScheduleSource,
} from '@/lib/weekly-schedule'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
const contractDateSchema = z.string().refine(isValidContractDate, 'Ano inválido no contrato.')

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
  contractStartDate: contractDateSchema.optional(),
  contractEndDate: contractDateSchema.optional(),
  emergencyContact: z.string().trim().min(1, PROFILE_MESSAGES.emergencyContactRequired).optional(),
  emergencyPhone: z.string().trim().min(1, PROFILE_MESSAGES.emergencyPhoneRequired).optional(),
  shift: z
    .enum(['MORNING', 'AFTERNOON', 'NIGHT', 'HYBRID'], {
      errorMap: () => ({ message: PROFILE_MESSAGES.shiftRequired }),
    })
    .optional(),
  shiftStartTime: z.string().regex(TIME_PATTERN, PROFILE_MESSAGES.shiftStartRequired).optional(),
  shiftEndTime: z.string().regex(TIME_PATTERN, PROFILE_MESSAGES.shiftEndRequired).optional(),
  workingDaysPerWeek: z
    .number()
    .int()
    .min(1, PROFILE_MESSAGES.workingDaysRange)
    .max(7, PROFILE_MESSAGES.workingDaysRange)
    .optional(),
  allowFlexibleHours: z.boolean().optional(),
  // Dias trabalhados e horário de cada dia (lib/weekly-schedule.ts); null
  // volta ao horário único antigo.
  weeklySchedule: z
    .array(z.object({ day: z.number().int().min(0).max(6), start: z.string(), end: z.string() }))
    .max(7)
    .nullable()
    .optional(),
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
        contractStartDate: true,
        contractEndDate: true,
        weeklyHours: true,
        dailyHours: true,
        shift: true,
        shiftStartTime: true,
        shiftEndTime: true,
        workingDaysPerWeek: true,
        weeklySchedule: true,
        allowFlexibleHours: true,
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

/**
 * Texto do log de auditoria. Mudança de horário registra o antes e o depois,
 * para a coordenação saber quando e por quem o turno foi alterado.
 */
function describeUpdate(
  email: string,
  before: ScheduleSource & { shift: string },
  after: ScheduleSource & { shift: string },
  changes: z.infer<typeof updateUserSchema>,
  selfEdit: boolean
): string {
  const parts = [
    selfEdit ? `Perfil atualizado pelo próprio usuário: ${email}` : `Usuário atualizado: ${email}`,
  ]
  const fields = Object.keys(changes).filter((key) => key !== 'password')
  if (fields.length > 0) parts.push(`campos: ${fields.join(', ')}`)
  const scheduleFields = [
    'shift',
    'shiftStartTime',
    'shiftEndTime',
    'workingDaysPerWeek',
    'weeklySchedule',
  ]
  if (fields.some((f) => scheduleFields.includes(f))) {
    const fmt = (src: ScheduleSource & { shift: string }) =>
      `${src.shift} ${describeSchedule(resolveWeeklySchedule(src))}`
    parts.push(`horário: ${fmt(before)} → ${fmt(after)}`)
  }
  return parts.join(' | ')
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

    // O aluno editando o próprio perfil ("Meu perfil") só altera contato e
    // horário. Nome, e-mail, senha, setor, matrícula, contrato, nível de
    // acesso e status continuam com a administração.
    const isSelfEmployeeEdit = session.user.id === id && session.user.role === 'EMPLOYEE'
    if (isSelfEmployeeEdit) {
      const allowed: readonly string[] = SELF_EDITABLE_PROFILE_FIELDS
      const blocked = Object.keys(validatedData).filter((key) => !allowed.includes(key))
      if (blocked.length > 0) {
        return NextResponse.json(
          {
            error:
              'Você pode alterar apenas telefone, endereço, contato de emergência e horário. Para os demais dados, procure a coordenação.',
            blockedFields: blocked,
          },
          { status: 403 }
        )
      }
    }

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

    // Datas contratuais exigem autoridade administrativa: o aluno não pode
    // alterar a própria vigência por chamada direta à API.
    const changingContract =
      validatedData.contractStartDate !== undefined || validatedData.contractEndDate !== undefined
    if (changingContract && !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Apenas administradores e supervisores podem alterar o contrato' },
        { status: 403 }
      )
    }

    if (changingContract) {
      const start = validatedData.contractStartDate ?? toDateOnly(existingUser.contractStartDate)
      const end = validatedData.contractEndDate ?? toDateOnly(existingUser.contractEndDate)
      if (!isValidContractDate(start) || !isValidContractDate(end) || end <= start) {
        return NextResponse.json(
          {
            error: 'Informe datas válidas, com ano completo e fim posterior ao início.',
          },
          { status: 400 }
        )
      }
    }

    // Horário do turno: valida o par resultante (o que veio + o que já existe)
    const changingShiftTimes =
      validatedData.shiftStartTime !== undefined || validatedData.shiftEndTime !== undefined
    if (changingShiftTimes) {
      const start = validatedData.shiftStartTime ?? existingUser.shiftStartTime
      const end = validatedData.shiftEndTime ?? existingUser.shiftEndTime
      const fieldErrors = validateShiftTimes(start, end)
      if (Object.keys(fieldErrors).length > 0) {
        const message = Object.values(fieldErrors)[0]
        return NextResponse.json({ error: message, message, fieldErrors }, { status: 400 })
      }
    }

    // Horário semanal: valida e grava junto os campos legados derivados
    // (início/fim do primeiro dia e quantidade de dias).
    let scheduleUpdate: Record<string, unknown> = {}
    if (validatedData.weeklySchedule) {
      const fieldErrors = validateWeeklySchedule(validatedData.weeklySchedule)
      if (Object.keys(fieldErrors).length > 0) {
        const message = Object.values(fieldErrors)[0]
        return NextResponse.json({ error: message, message, fieldErrors }, { status: 400 })
      }
      const schedule = sortSchedule(validatedData.weeklySchedule)
      scheduleUpdate = {
        weeklySchedule: schedule as unknown as Prisma.InputJsonValue,
        ...summarizeSchedule(schedule),
      }
    } else if (
      validatedData.weeklySchedule === null ||
      changingShiftTimes ||
      validatedData.workingDaysPerWeek !== undefined
    ) {
      // Horário único (modo antigo): descarta a lista por dia para não ficar
      // desatualizada em relação aos campos legados.
      scheduleUpdate = { weeklySchedule: Prisma.DbNull }
    }

    // Preparar dados para atualização
    const updateData: Record<string, unknown> = {
      ...validatedData,
      ...scheduleUpdate,
    } as Record<string, unknown>

    if (validatedData.contractStartDate) {
      updateData.contractStartDate = new Date(validatedData.contractStartDate + 'T00:00:00.000Z')
    }
    if (validatedData.contractEndDate) {
      updateData.contractEndDate = new Date(validatedData.contractEndDate + 'T00:00:00.000Z')
    }

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
        details: describeUpdate(
          user.email,
          existingUser,
          { ...existingUser, ...(updateData as Partial<typeof existingUser>) },
          validatedData,
          isSelfEmployeeEdit
        ),
      },
    })

    // Invalidate user cache
    await UserCache.invalidate(id)
    await UserCache.invalidateAll()

    return NextResponse.json(user)
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of error.errors) {
        const field = String(issue.path[0] ?? 'general')
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      }
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors,
          fieldErrors,
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
