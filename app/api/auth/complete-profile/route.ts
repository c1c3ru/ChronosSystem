import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { determineRoleFromSiape } from '@/lib/admin-siape'
import { getContractTypeConfig } from '@/lib/contract-types'
import { getShiftStartTime } from '@/lib/shift-validation'
import { authLogger } from '@/lib/logger'
import { z } from 'zod'
import { PROFILE_FIELD_LABELS, PROFILE_MESSAGES } from '@/lib/profile-validation'

const isoDateString = (requiredMessage: string = PROFILE_MESSAGES.dateInvalid) =>
  z
    .string({ required_error: requiredMessage, invalid_type_error: PROFILE_MESSAGES.dateInvalid })
    .min(1, requiredMessage)
    .refine((value) => !Number.isNaN(new Date(value).getTime()), PROFILE_MESSAGES.dateInvalid)

const requiredString = (message: string) =>
  z.string({ required_error: message, invalid_type_error: message }).trim().min(1, message)

const completeProfileSchema = z.object({
  phone: requiredString(PROFILE_MESSAGES.phoneRequired),
  address: requiredString(PROFILE_MESSAGES.addressRequired),
  birthDate: isoDateString(PROFILE_MESSAGES.birthDateRequired),
  emergencyContact: requiredString(PROFILE_MESSAGES.emergencyContactRequired),
  emergencyPhone: requiredString(PROFILE_MESSAGES.emergencyPhoneRequired),
  department: z.string().optional().nullable(),
  registrationNumber: z.string().optional().nullable(),
  startDate: z
    .union([z.literal(''), isoDateString()])
    .optional()
    .nullable(),
  contractStartDate: z
    .union([z.literal(''), isoDateString()])
    .optional()
    .nullable(),
  contractEndDate: z
    .union([z.literal(''), isoDateString()])
    .optional()
    .nullable(),
  siapeNumber: z.string().optional().nullable(),
  contractType: z.string().optional(),
  shift: z
    .enum(['MORNING', 'AFTERNOON', 'NIGHT', 'HYBRID'], {
      errorMap: () => ({ message: PROFILE_MESSAGES.shiftRequired }),
    })
    .optional(),
  workingDaysPerWeek: z.number().int().positive().optional(),
  allowFlexibleHours: z.boolean().optional(),
})

/**
 * Resposta 400 padronizada: `fieldErrors` diz, campo a campo, o que está
 * errado e como corrigir; `error`/`message` resumem para o banner/toast.
 */
function validationErrorResponse(fieldErrors: Record<string, string>) {
  const fields = Object.keys(fieldErrors)
  const summary =
    fields.length === 1
      ? fieldErrors[fields[0]]
      : `Corrija os campos: ${fields.map((f) => PROFILE_FIELD_LABELS[f] || f).join(', ')}.`
  return NextResponse.json({ error: summary, message: summary, fieldErrors }, { status: 400 })
}

// POST /api/auth/complete-profile - Completar perfil após login com Google

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const rawBody = await request.json().catch(() => null)
    const parsedBody = completeProfileSchema.safeParse(rawBody)
    if (!parsedBody.success) {
      if (!rawBody || typeof rawBody !== 'object') {
        const message =
          'Não foi possível ler os dados enviados. Recarregue a página e tente novamente.'
        return NextResponse.json({ error: message, message }, { status: 400 })
      }
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsedBody.error.errors) {
        const field = String(issue.path[0] ?? 'general')
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      }
      return validationErrorResponse(fieldErrors)
    }

    const {
      phone,
      address,
      birthDate,
      emergencyContact,
      emergencyPhone,
      department,
      registrationNumber,
      startDate,
      contractStartDate,
      contractEndDate,
      siapeNumber,
      contractType,
      shift,
      workingDaysPerWeek,
      allowFlexibleHours,
    } = parsedBody.data

    // Determinar role baseado na matrícula SIAPE.
    //
    // SEGURANÇA: lib/admin-siape.ts é um arquivo público (o repositório é
    // público no GitHub), então a lista de matrículas nunca pode ser tratada
    // como segredo. Por isso a promoção automática a ADMIN via SIAPE só é
    // permitida quando NENHUM administrador existe ainda no sistema — ou
    // seja, apenas para provisionar o primeiro admin em uma instalação nova
    // (bootstrap). Uma vez que exista pelo menos um ADMIN, completar o
    // próprio perfil nunca mais concede ADMIN sozinho; qualquer promoção
    // depois disso é uma ação administrativa explícita feita por um ADMIN
    // já existente (POST /api/users ou PUT /api/users/[id]).
    const hasExistingAdmin = (await prisma.user.count({ where: { role: 'ADMIN' } })) > 0
    const siapeGrantsAdmin =
      !hasExistingAdmin && !!siapeNumber && determineRoleFromSiape(siapeNumber) === 'ADMIN'
    const newRole = siapeGrantsAdmin ? 'ADMIN' : 'EMPLOYEE'
    authLogger.debug('SIAPE validation', {
      siape: siapeNumber || 'N/A',
      role: newRole,
      hasExistingAdmin,
    })

    // Validações específicas para funcionários (não para ADMIN/SUPERVISOR)
    const fieldErrors: Record<string, string> = {}
    if (newRole === 'EMPLOYEE') {
      if (!department) {
        fieldErrors.department = PROFILE_MESSAGES.departmentRequired
      }
      if (!registrationNumber?.trim()) {
        fieldErrors.registrationNumber = PROFILE_MESSAGES.registrationNumberRequired
      }
    }

    // Validar formato da matrícula SIAPE (apenas se fornecida)
    if (siapeNumber && !/^\d{7}$/.test(siapeNumber)) {
      fieldErrors.siapeNumber = PROFILE_MESSAGES.siapeFormat
    }

    if (Object.keys(fieldErrors).length > 0) {
      return validationErrorResponse(fieldErrors)
    }

    authLogger.debug('Updating user profile', { userId: session.user.id, role: newRole })

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true },
    })

    if (!existingUser) {
      authLogger.error('User not found', { userId: session.user.id })
      return NextResponse.json(
        {
          error: 'Usuário não encontrado',
          message: 'Usuário não encontrado no banco de dados',
        },
        { status: 404 }
      )
    }

    // Determinar carga horária e horários de turno baseado no tipo de contrato e turno
    const finalContractType = newRole === 'EMPLOYEE' ? contractType || 'ESTAGIO_20H' : 'EMPREGO_40H'
    const contractConfig = getContractTypeConfig(finalContractType)
    const finalWeeklyHours = contractConfig?.weeklyHours || 20
    const finalDailyHours = contractConfig?.dailyHours || 4

    // Obter horários padrão do turno
    const finalShift = shift || 'MORNING'
    const shiftTimes = getShiftStartTime(finalShift as 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'HYBRID')

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone,
        address,
        birthDate: new Date(birthDate),
        emergencyContact,
        emergencyPhone,
        department: newRole === 'EMPLOYEE' ? department : 'DIRECAO_GERAL', // Padrão para ADMINs
        registrationNumber: newRole === 'EMPLOYEE' ? registrationNumber : null,
        startDate: startDate ? new Date(startDate) : null,
        contractStartDate: contractStartDate ? new Date(contractStartDate) : null,
        contractEndDate: contractEndDate ? new Date(contractEndDate) : null,
        siapeNumber,
        contractType: finalContractType,
        weeklyHours: finalWeeklyHours,
        dailyHours: finalDailyHours,
        // Campos de turno
        shift: finalShift,
        shiftStartTime: shiftTimes.start,
        shiftEndTime: shiftTimes.end,
        workingDaysPerWeek: workingDaysPerWeek || 5,
        allowFlexibleHours: allowFlexibleHours || false,
        role: newRole, // Atualizar role baseado no SIAPE
        profileComplete: true,
        updatedAt: new Date(),
      },
    })

    authLogger.info('User profile updated successfully', {
      userId: updatedUser.id,
      role: updatedUser.role,
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'COMPLETE_PROFILE',
        resource: 'USER_PROFILE',
        details: `Perfil completado para usuário ${updatedUser.email}`,
      },
    })

    // Evento de segurança dedicado: só ocorre no bootstrap do primeiro ADMIN
    // do sistema (ver comentário acima de siapeGrantsAdmin). Deve ser raro —
    // um alerta/monitoramento sobre esta action é recomendado.
    if (siapeGrantsAdmin) {
      authLogger.security('Bootstrap admin granted via SIAPE self-service', {
        userId: session.user.id,
        email: updatedUser.email,
      })
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'BOOTSTRAP_ADMIN_VIA_SIAPE',
          resource: 'USER_PROFILE',
          details: `Primeiro ADMIN do sistema provisionado via auto-cadastro (SIAPE) para ${updatedUser.email}`,
        },
      })
    }

    // Determinar URL de redirecionamento baseado no role
    const redirectUrl = ['ADMIN', 'SUPERVISOR'].includes(updatedUser.role) ? '/admin' : '/employee'

    return NextResponse.json({
      success: true,
      message: 'Perfil completado com sucesso',
      redirectUrl: redirectUrl,
      forceReload: true, // Flag para forçar reload completo
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    authLogger.error('Error completing profile', {
      userId: 'unknown',
      error: errorMessage,
      stack:
        process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
    })

    const exposeDetails = process.env.NODE_ENV === 'development'

    return NextResponse.json(
      {
        error: 'Erro ao salvar perfil',
        details: exposeDetails ? errorMessage : undefined,
        message: exposeDetails ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}
