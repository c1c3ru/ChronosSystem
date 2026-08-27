import { z } from 'zod'
import type { Prisma } from '@prisma/client'

// Turnos aceitos para uma visita (mesmo vocabulário usado em outras partes
// do sistema para turno de trabalho: MORNING | AFTERNOON | NIGHT).
export const VISIT_SHIFTS = ['MORNING', 'AFTERNOON', 'NIGHT'] as const
export type VisitShift = (typeof VISIT_SHIFTS)[number]

// ---------------------------------------------------------------------------
// LGPD: seleção mínima de campos para o endpoint PÚBLICO de visitas.
//
// Esta constante é a ÚNICA fonte de verdade sobre quais campos de LabVisit
// podem sair para um cliente não autenticado. A rota /api/lab-visits/public
// usa isso diretamente como `select` da query do Prisma — os campos
// sensíveis (contactEmail, contactPhone, id, labId) nunca são lidos do
// banco nessa consulta, muito menos serializados na resposta.
// ---------------------------------------------------------------------------
export const PUBLIC_VISIT_SELECT = {
  responsibleName: true,
  schoolName: true,
  studentCount: true,
  visitDate: true,
  shift: true,
} as const satisfies Prisma.LabVisitSelect

// Tipo inferido diretamente do select acima — se alguém adicionar um campo
// sensível ao PUBLIC_VISIT_SELECT, o tipo (e os testes que o usam) refletem
// isso imediatamente.
export type PublicLabVisit = Prisma.LabVisitGetPayload<{ select: typeof PUBLIC_VISIT_SELECT }>

// Campos que NUNCA podem aparecer no payload público. Usado em testes para
// comprovar a ausência desses dados, não para filtrar em runtime (a
// filtragem real acontece via PUBLIC_VISIT_SELECT, no nível da query).
export const SENSITIVE_VISIT_FIELDS = ['contactEmail', 'contactPhone', 'id', 'labId'] as const

export const laboratorySelect = {
  id: true,
  sigla: true,
  nome: true,
  descricao: true,
} as const satisfies Prisma.LaboratorySelect

export type PublicLaboratory = Prisma.LaboratoryGetPayload<{ select: typeof laboratorySelect }> & {
  available: boolean
}

// Schema de criação de visita (usado tanto pelo formulário público quanto
// pela confirmação interna, que preenche responsibleName/schoolName com
// dados do próprio servidor).
export const createLabVisitSchema = z.object({
  labId: z.string().min(1, 'Selecione um laboratório'),
  responsibleName: z.string().min(2, 'Nome do responsável é obrigatório'),
  schoolName: z.string().min(2, 'Nome da escola é obrigatório'),
  studentCount: z.number().int().positive('Quantidade de alunos deve ser maior que zero'),
  visitDate: z
    .string()
    .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Data inválida'),
  shift: z.enum(VISIT_SHIFTS),
  contactEmail: z.string().email('Email inválido'),
  contactPhone: z.string().min(8, 'Telefone inválido'),
})

export type CreateLabVisitInput = z.infer<typeof createLabVisitSchema>
