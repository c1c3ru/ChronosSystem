/**
 * Termo de Avaliação ao Discente Estagiário (Res. CONSUP/IFCE nº 108/2023, art. 20, XV,
 * art. 40 e art. 41). Critérios, frequência mínima e conceito final compartilhados pela tela,
 * pelo PDF e pela validação.
 */

/** Critérios do art. 40 da Res. 108/2023, mais três usuais ("entre outros"). */
export const EVALUATION_CRITERIA = [
  { key: 'eval_theory_application', label: 'Aplicação dos conhecimentos teóricos na prática' },
  { key: 'eval_learning_capacity', label: 'Aprendizado' },
  { key: 'eval_assiduity', label: 'Assiduidade' },
  { key: 'eval_guidance', label: 'Atendimento às orientações recebidas' },
  { key: 'eval_cooperation', label: 'Cooperação' },
  { key: 'eval_communication', label: 'Comunicação' },
  { key: 'eval_punctuality', label: 'Pontualidade' },
  { key: 'eval_proactivity', label: 'Proatividade' },
  { key: 'eval_relationship', label: 'Relacionamento interpessoal' },
  { key: 'eval_responsibility', label: 'Responsabilidade' },
  { key: 'eval_technical_knowledge', label: 'Conhecimento técnico' },
  { key: 'eval_quality', label: 'Qualidade do trabalho' },
  { key: 'eval_organization', label: 'Organização' },
] as const

export type EvaluationCriterionKey = (typeof EVALUATION_CRITERIA)[number]['key']

export const GRADE_SCALE =
  '1 = Insuficiente · 2 = Regular · 3 = Bom · 4 = Muito bom · 5 = Excelente'

/** Frequência mínima para aprovação (art. 40, VIII). */
export const MIN_ATTENDANCE_PERCENT = 70

export const FINAL_CONCEPTS = [
  { value: 'satisfatorio', label: 'Satisfatório' },
  { value: 'insatisfatorio', label: 'Insatisfatório' },
] as const

/** "85", "85,5", "85%" → 85.5; vazio ou inválido → null. */
export function parseAttendance(value?: string | null): number | null {
  const clean = (value ?? '').replace('%', '').replace(',', '.').trim()
  if (!clean || !/^\d+(\.\d+)?$/.test(clean)) return null
  return Number(clean)
}

/** Média das notas preenchidas (1 a 5), com uma casa decimal; sem notas → null. */
export function averageGrade(data: Partial<Record<string, string>>): number | null {
  const grades = EVALUATION_CRITERIA.map((c) => Number(data[c.key])).filter(
    (n) => Number.isInteger(n) && n >= 1 && n <= 5
  )
  if (grades.length === 0) return null
  return Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10
}
