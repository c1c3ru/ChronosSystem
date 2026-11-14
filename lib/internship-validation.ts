/**
 * Regras dos formulários de estágio (Res. CONSUP/IFCE nº 108/2023 e Lei nº 11.788/2008).
 *
 * Módulo puro, sem React, no mesmo estilo de `lib/profile-validation.ts`: cada função devolve
 * `errors` (campo → mensagem, bloqueiam o PDF) e `warnings` (avisos que não bloqueiam).
 * Cada mensagem diz o que está errado e como corrigir.
 */

/** Limites da Res. 108/2023, art. 35 (superior e técnico) e art. 34 (duração). */
export const INTERNSHIP_LIMITS = {
  maxDailyHours: 6,
  maxWeeklyHours: 30,
  maxMonths: 24,
  maxMonthsWithDisability: 48,
} as const

export const WEEK_DAYS = [
  { key: 'segunda_feira', label: 'segunda-feira' },
  { key: 'terca_feira', label: 'terça-feira' },
  { key: 'quarta_feira', label: 'quarta-feira' },
  { key: 'quinta_feira', label: 'quinta-feira' },
  { key: 'sexta_feira', label: 'sexta-feira' },
  { key: 'sabado', label: 'sábado' },
  { key: 'domingo', label: 'domingo' },
] as const

export type WeeklySchedule = Partial<Record<string, { inicio?: string; final?: string }>>

export interface ValidationResult {
  errors: Record<string, string>
  warnings: string[]
}

const isBlank = (value?: string | null) => !value || !value.trim()
const digits = (value?: string | null) => (value ?? '').replace(/\D/g, '')

// ─── Documentos ──────────────────────────────────────────────────────────────

export function isValidCPF(value?: string | null): boolean {
  const cpf = digits(value)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  const check = (len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }
  return check(9) === Number(cpf[9]) && check(10) === Number(cpf[10])
}

export function isValidCNPJ(value?: string | null): boolean {
  const cnpj = digits(value)
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false
  const check = (len: number) => {
    const weights =
      len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const sum = weights.reduce((acc, w, i) => acc + Number(cnpj[i]) * w, 0)
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }
  return check(12) === Number(cnpj[12]) && check(13) === Number(cnpj[13])
}

export function isValidEmail(value?: string | null): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value ?? '').trim())
}

// ─── Datas e horários ────────────────────────────────────────────────────────

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

/** Soma meses a uma data YYYY-MM-DD (aritmética UTC, sem depender do fuso de quem chama). */
export function addMonthsIso(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1 + months, d))
  return date.toISOString().slice(0, 10)
}

/** "8:00", "08:00", "08h", "8h30", "0830" → minutos desde 00:00. Inválido → null. */
export function parseTime(value?: string | null): number | null {
  const match = (value ?? '').trim().match(/^(\d{1,2})(?:[:hH]?(\d{2}))?[hH]?$/)
  if (!match) return null
  const h = Number(match[1])
  const min = Number(match[2] ?? 0)
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

const fmtHours = (minutes: number) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

const fmtDate = (iso: string) => iso.split('-').reverse().join('/')

export interface PeriodFields {
  start: string
  end: string
}

/**
 * Início e fim do estágio: datas válidas, fim depois do início e duração até 24 meses
 * (48 para pessoa com deficiência; quando o formulário não sabe, vira aviso).
 */
export function checkPeriod(
  start: string | undefined,
  end: string | undefined,
  fields: PeriodFields,
  { hasDisability }: { hasDisability?: boolean } = {}
): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: string[] = []

  if (isBlank(start)) errors[fields.start] = 'Informe a data de início do estágio.'
  else if (!isValidIsoDate(start!))
    errors[fields.start] = 'Data de início inválida. Use dia/mês/ano.'

  if (isBlank(end)) errors[fields.end] = 'Informe a data de término do estágio.'
  else if (!isValidIsoDate(end!)) errors[fields.end] = 'Data de término inválida. Use dia/mês/ano.'

  if (errors[fields.start] || errors[fields.end]) return { errors, warnings }

  if (end! <= start!) {
    errors[fields.end] = 'A data de término precisa ser depois da data de início.'
    return { errors, warnings }
  }

  const limit24 = addMonthsIso(start!, INTERNSHIP_LIMITS.maxMonths)
  const limit48 = addMonthsIso(start!, INTERNSHIP_LIMITS.maxMonthsWithDisability)
  if (end! > limit48 || (hasDisability === false && end! > limit24)) {
    const max = hasDisability === false ? limit24 : limit48
    const months =
      hasDisability === false
        ? INTERNSHIP_LIMITS.maxMonths
        : INTERNSHIP_LIMITS.maxMonthsWithDisability
    errors[fields.end] =
      `O estágio na mesma concedente pode durar até ${months} meses (Res. IFCE 108/2023, art. 34). ` +
      `Com início em ${fmtDate(start!)}, o término máximo é ${fmtDate(max)}.`
  } else if (hasDisability === undefined && end! > limit24) {
    warnings.push(
      `O período passa de 24 meses. Isso só é permitido para estagiário com deficiência (até 48 meses, Res. IFCE 108/2023, art. 34).`
    )
  }

  return { errors, warnings }
}

/**
 * Quadro de horários: início antes do fim, até 6 h por dia, até 30 h por semana e soma igual à
 * carga semanal declarada (Res. IFCE 108/2023, art. 35). `fieldPrefix` dá o nome do campo de
 * cada dia nos erros (ex.: "horarios" → "horarios.segunda_feira").
 */
export function checkSchedule(
  schedule: WeeklySchedule | undefined,
  weeklyHours: string | undefined,
  { fieldPrefix, weeklyHoursField }: { fieldPrefix: string; weeklyHoursField: string }
): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: string[] = []
  let total = 0

  for (const day of WEEK_DAYS) {
    const slot = schedule?.[day.key]
    if (!slot || (isBlank(slot.inicio) && isBlank(slot.final))) continue
    const field = `${fieldPrefix}.${day.key}`
    const ini = parseTime(slot.inicio)
    const fim = parseTime(slot.final)
    if (ini === null || fim === null) {
      errors[field] =
        `Horário de ${day.label} incompleto ou inválido. Use HH:MM, por exemplo 08:00 e 12:00.`
      continue
    }
    if (fim <= ini) {
      errors[field] = `Na ${day.label}, o horário de fim precisa ser depois do início.`
      continue
    }
    const minutes = fim - ini
    if (minutes > INTERNSHIP_LIMITS.maxDailyHours * 60) {
      errors[field] =
        `Na ${day.label} são ${fmtHours(minutes)} de estágio; o máximo é 6 h por dia (Res. IFCE 108/2023, art. 35).`
    }
    total += minutes
  }

  const declaredRaw = (weeklyHours ?? '').replace(',', '.').trim()
  const declared = declaredRaw ? Number(declaredRaw) : null

  if (declaredRaw && (declared === null || !Number.isFinite(declared) || declared <= 0)) {
    errors[weeklyHoursField] =
      'Carga horária semanal inválida. Digite só o número de horas, por exemplo 20.'
  } else if (declared !== null && declared > INTERNSHIP_LIMITS.maxWeeklyHours) {
    errors[weeklyHoursField] =
      `A carga horária semanal máxima é 30 h (Res. IFCE 108/2023, art. 35). Foram informadas ${declared} h.`
  }

  if (total > INTERNSHIP_LIMITS.maxWeeklyHours * 60) {
    errors[`${fieldPrefix}.total`] =
      `O quadro de horários soma ${fmtHours(total)} por semana; o máximo é 30 h (Res. IFCE 108/2023, art. 35).`
  } else if (
    total > 0 &&
    declared !== null &&
    !errors[weeklyHoursField] &&
    Math.abs(total - declared * 60) >= 1
  ) {
    errors[`${fieldPrefix}.total`] =
      `O quadro de horários soma ${fmtHours(total)} por semana, mas a carga semanal informada é ${declared} h. Ajuste um dos dois.`
  }

  return { errors, warnings }
}

// ─── Helpers de composição ───────────────────────────────────────────────────

function merge(...results: ValidationResult[]): ValidationResult {
  return results.reduce<ValidationResult>(
    (acc, r) => ({
      errors: { ...acc.errors, ...r.errors },
      warnings: [...acc.warnings, ...r.warnings],
    }),
    { errors: {}, warnings: [] }
  )
}

function required(
  data: Record<string, unknown>,
  fields: Record<string, string>
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const [field, label] of Object.entries(fields)) {
    const value = data[field]
    if (typeof value !== 'string' || isBlank(value)) errors[field] = `Preencha: ${label}.`
  }
  return errors
}

function documents(
  data: Record<string, unknown>,
  { cpf = [], cnpj = [], email = [] }: { cpf?: string[]; cnpj?: string[]; email?: string[] },
  labels: Record<string, string>
): Record<string, string> {
  const errors: Record<string, string> = {}
  const val = (f: string) => (typeof data[f] === 'string' ? (data[f] as string) : '')
  const label = (f: string) => labels[f] ?? f
  for (const f of cpf) {
    if (!isBlank(val(f)) && !isValidCPF(val(f)))
      errors[f] = `${label(f)}: CPF inválido. Confira os 11 números.`
  }
  for (const f of cnpj) {
    if (!isBlank(val(f)) && !isValidCNPJ(val(f)))
      errors[f] = `${label(f)}: CNPJ inválido. Confira os 14 números.`
  }
  for (const f of email) {
    if (!isBlank(val(f)) && !isValidEmail(val(f)))
      errors[f] = `${label(f)}: e-mail inválido. Exemplo: nome@dominio.com.`
  }
  return errors
}

function parseSchedule(value: unknown): WeeklySchedule | undefined {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as WeeklySchedule
    } catch {
      return undefined
    }
  }
  return (value as WeeklySchedule) ?? undefined
}

// ─── Formulários ─────────────────────────────────────────────────────────────

const COMMITMENT_LABELS: Record<string, string> = {
  internship_type: 'tipo de estágio',
  company_name: 'razão social da concedente',
  company_cnpj: 'CNPJ da concedente',
  company_representative: 'representante legal da concedente',
  student_name: 'nome do discente',
  student_cpf: 'CPF do discente',
  student_course: 'curso',
  student_id: 'matrícula',
  advisor_name: 'docente orientador',
  supervisor_name: 'supervisor do estágio',
  activities_description: 'atividades do plano de atividades',
  weekly_hours: 'carga horária semanal',
  company_representative_cpf: 'CPF do representante',
  supervisor_cpf: 'CPF do supervisor',
  company_email: 'E-mail da concedente',
  student_email_institutional: 'E-mail institucional',
  student_email_personal: 'E-mail pessoal',
  advisor_email: 'E-mail do orientador',
  supervisor_email: 'E-mail do supervisor',
}

/** Termo de Compromisso (`app/documents/commitment-term`). */
export function validateCommitmentTerm(data: Record<string, unknown>): ValidationResult {
  const str = (f: string) => (typeof data[f] === 'string' ? (data[f] as string) : undefined)
  return merge(
    {
      errors: {
        ...documents(
          data,
          {
            cpf: ['student_cpf', 'company_representative_cpf', 'supervisor_cpf'],
            cnpj: ['company_cnpj'],
            email: [
              'company_email',
              'student_email_institutional',
              'student_email_personal',
              'advisor_email',
              'supervisor_email',
            ],
          },
          {
            ...COMMITMENT_LABELS,
            student_cpf: 'CPF do discente',
            company_cnpj: 'CNPJ da concedente',
          }
        ),
        ...required(data, {
          internship_type: COMMITMENT_LABELS.internship_type,
          company_name: COMMITMENT_LABELS.company_name,
          company_cnpj: COMMITMENT_LABELS.company_cnpj,
          company_representative: COMMITMENT_LABELS.company_representative,
          student_name: COMMITMENT_LABELS.student_name,
          student_cpf: COMMITMENT_LABELS.student_cpf,
          student_course: COMMITMENT_LABELS.student_course,
          student_id: COMMITMENT_LABELS.student_id,
          advisor_name: COMMITMENT_LABELS.advisor_name,
          supervisor_name: COMMITMENT_LABELS.supervisor_name,
          activities_description: COMMITMENT_LABELS.activities_description,
          weekly_hours: COMMITMENT_LABELS.weekly_hours,
        }),
      },
      warnings: [],
    },
    checkPeriod(str('start_date'), str('end_date'), { start: 'start_date', end: 'end_date' }),
    checkSchedule(parseSchedule(data.horarios), str('weekly_hours'), {
      fieldPrefix: 'horarios',
      weeklyHoursField: 'weekly_hours',
    })
  )
}

/** Solicitação de Cadastro do Estágio (`app/documents/internship-registration-request`). */
export function validateRegistrationRequest(data: Record<string, unknown>): ValidationResult {
  const str = (f: string) => (typeof data[f] === 'string' ? (data[f] as string) : undefined)
  const disabilities = Array.isArray(data.deficiencia) ? data.deficiencia : []
  const labels = {
    cpf: 'CPF do discente',
    cpf_responsavel: 'CPF do responsável legal',
    supervisor_cpf: 'CPF do supervisor',
    email_institucional: 'E-mail institucional',
    email_pessoal: 'E-mail pessoal',
    email_pf: 'E-mail da concedente',
  }
  return merge(
    {
      errors: {
        ...documents(
          data,
          {
            cpf: ['cpf', 'cpf_responsavel', 'supervisor_cpf'],
            email: ['email_institucional', 'email_pessoal', 'email_pf'],
          },
          labels
        ),
        ...required(data, {
          nome: 'nome do discente',
          cpf: 'CPF do discente',
          curso: 'curso',
          matricula: 'matrícula',
          supervisor_nome: 'supervisor do estágio',
          carga_horaria_semanal: 'carga horária semanal',
        }),
      },
      warnings: [],
    },
    checkPeriod(
      str('data_inicial'),
      str('data_final_prevista'),
      { start: 'data_inicial', end: 'data_final_prevista' },
      { hasDisability: disabilities.length > 0 }
    ),
    checkSchedule(parseSchedule(data.horarios), str('carga_horaria_semanal'), {
      fieldPrefix: 'horarios',
      weeklyHoursField: 'carga_horaria_semanal',
    })
  )
}

/** Termo Aditivo (`app/documents/additive-term`). */
export function validateAdditiveTerm(data: Record<string, unknown>): ValidationResult {
  const str = (f: string) => (typeof data[f] === 'string' ? (data[f] as string) : '')
  const on = (f: string) => str(f) === 'true'
  const errors: Record<string, string> = {
    ...documents(
      data,
      { cpf: ['student_cpf'], cnpj: ['company_cnpj'] },
      { student_cpf: 'CPF do discente', company_cnpj: 'CNPJ da concedente' }
    ),
    ...required(data, {
      company_name: 'razão social da concedente',
      student_name: 'nome do discente',
      justification: 'justificativa',
    }),
  }

  const types = [
    'additive_type_prorogation',
    'additive_type_allowance',
    'additive_type_supervisor',
    'additive_type_schedule',
    'additive_type_other',
  ]
  if (!types.some(on)) {
    errors.additive_type_prorogation = 'Marque pelo menos uma alteração no "Objeto do Aditivo".'
  }

  if (on('additive_type_prorogation')) {
    if (isBlank(str('new_end_date'))) errors.new_end_date = 'Informe a nova data de término.'
    else if (!isValidIsoDate(str('new_end_date')))
      errors.new_end_date = 'Nova data de término inválida. Use dia/mês/ano.'
  }
  if (on('additive_type_allowance') && isBlank(str('new_allowance_value'))) {
    errors.new_allowance_value = 'Informe o novo valor da bolsa.'
  }
  if (on('additive_type_supervisor') && isBlank(str('new_supervisor_name'))) {
    errors.new_supervisor_name = 'Informe o nome do novo supervisor.'
  }
  if (on('additive_type_schedule')) {
    if (isBlank(str('new_schedule'))) errors.new_schedule = 'Descreva o novo horário.'
    const { errors: hoursErrors } = checkSchedule(undefined, str('new_weekly_hours'), {
      fieldPrefix: 'new_schedule',
      weeklyHoursField: 'new_weekly_hours',
    })
    Object.assign(errors, hoursErrors)
    if (isBlank(str('new_weekly_hours')))
      errors.new_weekly_hours = 'Informe a nova carga horária semanal.'
  }
  if (on('additive_type_other') && isBlank(str('other_changes'))) {
    errors.other_changes = 'Descreva as outras alterações.'
  }

  return { errors, warnings: [] }
}
