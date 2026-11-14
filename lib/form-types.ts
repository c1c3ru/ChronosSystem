/**
 * Tipos de formulário de estágio que têm rascunho. Fica separado de `form-drafts.ts`
 * (código de navegador) para a API poder validar o `formType` com a mesma lista.
 */
export const FORM_TYPES = [
  'final-report',
  'monthly-report',
  'internship-registration', // legado: tela unificada em internship-registration-request
  'internship-registration-request',
  'commitment-term',
  'additive-term',
  'equivalence-request',
  'extension-declaration',
  'professional-activities',
  'professional-declaration', // legado: tela unificada em professional-activities
  'semester-report',
  'rescission-term',
  'realization-term',
  'student-evaluation',
  'concedente-evaluation',
  'owner-declaration',
  'self-employed-declaration',
] as const

export type FormType = (typeof FORM_TYPES)[number]

export function isFormType(value: unknown): value is FormType {
  return typeof value === 'string' && (FORM_TYPES as readonly string[]).includes(value)
}
