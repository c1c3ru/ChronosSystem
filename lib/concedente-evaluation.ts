/**
 * Opções do "Formulário para Registro de Avaliação do Docente Orientador à Instituição Concedente
 * de Vaga de Estágio" (modelo oficial da PROEXT/IFCE). Compartilhado por tela, PDF e validação.
 */

export type Option = { readonly value: string; readonly label: string }

export const VISIT_PURPOSES = [
  { value: 'analise', label: 'Análise da concedente para realização de atividade de estágio' },
  { value: 'acompanhamento', label: 'Acompanhamento de atividades de estágio' },
] as const

export const YES_NO = [
  { value: 'sim', label: 'SIM' },
  { value: 'nao', label: 'NÃO' },
] as const

export const FACILITIES_OPTIONS = [
  { value: 'satisfatorias', label: 'Satisfatórias' },
  { value: 'insatisfatorias', label: 'Insatisfatórias' },
] as const
