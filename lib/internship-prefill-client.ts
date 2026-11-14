import {
  HOURS_FIELDS,
  mergePrefill,
  type Period,
  type PrefillFormType,
} from '@/lib/internship-prefill'

/** Nomes dos campos de início e fim do período em cada formulário. */
const PERIOD_FIELDS: Record<PrefillFormType, [string, string]> = {
  'monthly-report': ['period_start', 'period_end'],
  'semester-report': ['period_start', 'period_end'],
  'final-report': ['start_date', 'end_date'],
  'realization-term': ['start_date', 'end_date'],
}

/**
 * Busca os valores de pré-preenchimento do usuário logado. Falha em silêncio (devolve `null`):
 * o formulário continua funcionando sem o pré-preenchimento.
 */
export async function fetchInternshipPrefill(
  formType: PrefillFormType,
  period?: Partial<Period>
): Promise<Record<string, string> | null> {
  try {
    const params = new URLSearchParams({ formType })
    if (period?.from && period?.to) {
      params.set('from', period.from)
      params.set('to', period.to)
    }
    const response = await fetch(`/api/employee/internship-prefill?${params.toString()}`)
    if (!response.ok) return null
    const data = (await response.json()) as { values?: Record<string, string> }
    return data.values ?? null
  } catch {
    return null
  }
}

function periodOf(formType: PrefillFormType, data: Record<string, unknown>): Partial<Period> {
  const [startKey, endKey] = PERIOD_FIELDS[formType]
  const from = data[startKey]
  const to = data[endKey]
  return {
    from: typeof from === 'string' ? from : undefined,
    to: typeof to === 'string' ? to : undefined,
  }
}

/**
 * Completa os campos vazios do rascunho (ou de um formulário novo) com o perfil e as horas do
 * ponto. O período salvo no rascunho, se houver, define a soma das horas.
 */
export async function prefillDraft<T extends Record<string, unknown>>(
  formType: PrefillFormType,
  draft: T
): Promise<T> {
  const values = await fetchInternshipPrefill(formType, periodOf(formType, draft))
  return values ? mergePrefill(draft, values) : draft
}

/**
 * Recalcula a carga horária pelo ponto para o período digitado. Sobrescreve só os campos de
 * horas (e completa o período, se estiver vazio). Devolve `null` se não deu para calcular.
 */
export async function recalculateHours<T extends Record<string, unknown>>(
  formType: PrefillFormType,
  current: T
): Promise<T | null> {
  const values = await fetchInternshipPrefill(formType, periodOf(formType, current))
  if (!values) return null
  const hours: Record<string, string> = {}
  for (const key of HOURS_FIELDS[formType]) {
    if (values[key] !== undefined) hours[key] = values[key]
  }
  return { ...mergePrefill(current, values), ...hours }
}
