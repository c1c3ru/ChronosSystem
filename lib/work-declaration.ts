/**
 * Declarações de atividade profissional para aproveitamento de horas como estágio obrigatório
 * (modelos oficiais da PROEXT/IFCE): "Declaração de proprietário" e "Declaração de atividades de
 * profissional liberal ou autônomo". Módulo puro, compartilhado por tela, PDF e validação.
 */

export const MAX_ACTIVITIES = 10

export type WorkDeclarationKind = 'owner' | 'self-employed'

export interface WorkDeclarationConfig {
  formType: 'owner-declaration' | 'self-employed-declaration'
  title: string
  fileName: string
  /** Observação do rodapé, copiada do modelo oficial. */
  observation: string
}

export const WORK_DECLARATIONS: Record<WorkDeclarationKind, WorkDeclarationConfig> = {
  owner: {
    formType: 'owner-declaration',
    title: 'Declaração de Proprietário',
    fileName: 'declaracao-de-proprietario.pdf',
    observation:
      'Entregar cópia de documento que comprove a habilitação jurídica (cédula de identidade e registro comercial ou inscrição do ato constitutivo no órgão competente ou estatuto ou contrato social, etc.).',
  },
  'self-employed': {
    formType: 'self-employed-declaration',
    title: 'Declaração de Atividades de Profissional Liberal ou Autônomo',
    fileName: 'declaracao-profissional-liberal-ou-autonomo.pdf',
    observation:
      'Entregar cópia de documento que comprove registro no conselho competente (para profissional liberal), ou, se autônomo, entregar comprovante de recolhimento de contribuição previdenciária como contribuinte individual, comprovante de recolhimento de ISS (imposto sobre serviços de qualquer natureza), declaração comprobatória de percepção de rendimentos (DECORE) expedida e firmada por contabilista, devidamente autenticada por meio de colagem da etiqueta autoadesiva denominada declaração de habilitação profissional (DHP), contrato de prestação de serviço ou qualquer outro meio lícito que seja suficiente para provar sua condição, sob as penas da lei.',
  },
}

/** Tipo de profissional na declaração de autônomo. */
export const PROFESSIONAL_TYPES = [
  { value: 'liberal', label: 'Profissional liberal' },
  { value: 'autonomo', label: 'Autônomo' },
] as const

/**
 * Uma atividade por linha. Remove linhas vazias e a numeração que a pessoa tenha digitado
 * ("1.", "2)", "3 -"), porque o PDF numera sozinho.
 */
export function parseActivities(text?: string | null): string[] {
  return (text ?? '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\d{1,2}\s*[.)\-–]\s*/, '').trim())
    .filter(Boolean)
}

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

/** `2026-11-13` → `13 de novembro de 2026`. Vazio ou inválido → linha para preencher à mão. */
export function longDate(iso?: string | null): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '')
  const month = match ? MONTHS[Number(match[2]) - 1] : undefined
  if (!match || !month) return '______ de ______________________ de _________'
  return `${Number(match[3])} de ${month} de ${match[1]}`
}
