/**
 * Validação do formulário "Complete seu Perfil" (cadastro do aluno/estagiário).
 *
 * Fica num módulo puro, sem React, para que a página e a API usem exatamente
 * as mesmas regras e as mesmas mensagens. Cada mensagem diz o que está errado
 * E como corrigir (formato esperado / exemplo), para o aluno não ficar sem
 * saber o que fazer.
 */

export const PROFILE_FIELD_LABELS: Record<string, string> = {
  phone: 'Telefone',
  address: 'Endereço',
  birthDate: 'Data de nascimento',
  emergencyContact: 'Nome do contato de emergência',
  emergencyPhone: 'Telefone de emergência',
  department: 'Departamento',
  registrationNumber: 'Matrícula',
  siapeNumber: 'Matrícula SIAPE',
  contractType: 'Tipo de contrato',
  startDate: 'Início no IFCE/órgão',
  contractStartDate: 'Início do contrato',
  contractEndDate: 'Fim do contrato',
  shift: 'Tipo de turno',
  shiftStartTime: 'Horário de início do turno',
  shiftEndTime: 'Horário de fim do turno',
  workingDaysPerWeek: 'Dias de trabalho por semana',
}

/**
 * Id do elemento no DOM de cada campo, quando difere do nome do campo
 * (os campos de turno vêm do ShiftConfigForm, que usa ids com hífen).
 */
export const PROFILE_FIELD_DOM_IDS: Record<string, string> = {
  shift: 'shift-type',
  shiftStartTime: 'shift-start-time',
  shiftEndTime: 'shift-end-time',
  workingDaysPerWeek: 'working-days',
}

export const PROFILE_MESSAGES = {
  phoneRequired: 'Informe o telefone com DDD. Exemplo: (85) 99999-9999.',
  phoneFormat:
    'Telefone incompleto ou inválido. Digite o DDD + número (10 ou 11 dígitos). Exemplo: (85) 99999-9999.',
  addressRequired: 'Informe o endereço completo: rua, número, bairro, cidade e CEP.',
  addressTooShort:
    'Endereço muito curto. Inclua rua, número, bairro, cidade e CEP. Exemplo: Rua A, 123, Centro, Maracanaú, 61900-000.',
  birthDateRequired: 'Informe sua data de nascimento (dia/mês/ano).',
  birthDateInvalid:
    'Data de nascimento inválida. Use o formato dia/mês/ano, por exemplo 15/03/2005.',
  birthDateFuture: 'A data de nascimento não pode ser no futuro. Confira o dia, o mês e o ano.',
  birthDateTooOld:
    'Ano de nascimento muito antigo. Confira se o ano foi digitado com 4 dígitos (ex.: 2005).',
  emergencyContactRequired:
    'Informe o nome de alguém que possamos avisar em caso de emergência (ex.: mãe, pai, responsável).',
  emergencyPhoneRequired:
    'Informe o telefone do contato de emergência com DDD. Exemplo: (85) 99999-9999.',
  departmentRequired: 'Selecione na lista o departamento/setor onde você faz o estágio.',
  registrationNumberRequired:
    'Matrícula não informada. Digite sua matrícula de aluno (o número que aparece no Q-Acadêmico).',
  siapeRequired:
    'Digite os 7 números da matrícula SIAPE ou desmarque a opção "Possuo matrícula SIAPE".',
  siapeFormat: 'A matrícula SIAPE tem exatamente 7 números (somente dígitos). Exemplo: 1234567.',
  contractTypeRequired: 'Selecione o tipo de contrato (carga horária) do seu estágio.',
  startDateRequired: 'Informe a data em que você começou no IFCE/órgão (dia/mês/ano).',
  dateInvalid: 'Data inválida. Use o formato dia/mês/ano, por exemplo 01/02/2026.',
  contractStartDateRequired: 'Informe a data de início do contrato (está no Termo de Compromisso).',
  contractEndDateRequired: 'Informe a data de término do contrato (está no Termo de Compromisso).',
  contractEndBeforeStart:
    'A data de fim do contrato precisa ser depois da data de início. Confira as duas datas.',
  shiftRequired: 'Selecione o turno em que você faz o estágio.',
  shiftStartRequired: 'Informe o horário de início do turno no formato HH:MM (ex.: 08:00).',
  shiftEndRequired: 'Informe o horário de fim do turno no formato HH:MM (ex.: 12:00).',
  shiftEndBeforeStart:
    'O horário de fim precisa ser depois do horário de início. Exemplo: início 08:00, fim 12:00.',
} as const

export interface ProfileFormValues {
  phone?: string | null
  address?: string | null
  birthDate?: string | null
  emergencyContact?: string | null
  emergencyPhone?: string | null
  department?: string | null
  registrationNumber?: string | null
  startDate?: string | null
  contractStartDate?: string | null
  contractEndDate?: string | null
  hasSiape?: boolean
  siapeNumber?: string | null
  contractType?: string | null
  shift?: string | null
  shiftStartTime?: string | null
  shiftEndTime?: string | null
}

export const PHONE_PATTERN = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

const isBlank = (value: string | null | undefined) => !value || !value.trim()

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

/** Data de hoje em YYYY-MM-DD, no relógio local de quem chama. */
export function todayIsoDate(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export interface ValidateProfileOptions {
  /** Alunos/estagiários (EMPLOYEE) têm campos institucionais e de contrato obrigatórios. */
  isEmployee: boolean
  /** Data de hoje em YYYY-MM-DD (injetável para testes). */
  today?: string
}

/**
 * Valida os campos do perfil e devolve um mapa campo → mensagem. Mapa vazio
 * significa que está tudo certo.
 */
export function validateProfileForm(
  values: ProfileFormValues,
  { isEmployee, today = todayIsoDate() }: ValidateProfileOptions
): Record<string, string> {
  const errors: Record<string, string> = {}

  // Telefones
  if (isBlank(values.phone)) {
    errors.phone = PROFILE_MESSAGES.phoneRequired
  } else if (!PHONE_PATTERN.test(values.phone!.trim())) {
    errors.phone = PROFILE_MESSAGES.phoneFormat
  }

  if (isBlank(values.emergencyPhone)) {
    errors.emergencyPhone = PROFILE_MESSAGES.emergencyPhoneRequired
  } else if (!PHONE_PATTERN.test(values.emergencyPhone!.trim())) {
    errors.emergencyPhone = PROFILE_MESSAGES.phoneFormat
  }

  // Endereço
  if (isBlank(values.address)) {
    errors.address = PROFILE_MESSAGES.addressRequired
  } else if (values.address!.trim().length < 10) {
    errors.address = PROFILE_MESSAGES.addressTooShort
  }

  // Data de nascimento
  if (isBlank(values.birthDate)) {
    errors.birthDate = PROFILE_MESSAGES.birthDateRequired
  } else if (!isValidIsoDate(values.birthDate!)) {
    errors.birthDate = PROFILE_MESSAGES.birthDateInvalid
  } else if (values.birthDate! > today) {
    errors.birthDate = PROFILE_MESSAGES.birthDateFuture
  } else if (values.birthDate! < '1900-01-01') {
    errors.birthDate = PROFILE_MESSAGES.birthDateTooOld
  }

  if (isBlank(values.emergencyContact)) {
    errors.emergencyContact = PROFILE_MESSAGES.emergencyContactRequired
  }

  // SIAPE (só quando o usuário marcou que possui)
  if (values.hasSiape) {
    if (isBlank(values.siapeNumber)) {
      errors.siapeNumber = PROFILE_MESSAGES.siapeRequired
    } else if (!/^\d{7}$/.test(values.siapeNumber!)) {
      errors.siapeNumber = PROFILE_MESSAGES.siapeFormat
    }
  }

  if (isEmployee) {
    if (isBlank(values.department)) {
      errors.department = PROFILE_MESSAGES.departmentRequired
    }
    if (isBlank(values.registrationNumber)) {
      errors.registrationNumber = PROFILE_MESSAGES.registrationNumberRequired
    }
    if (isBlank(values.contractType)) {
      errors.contractType = PROFILE_MESSAGES.contractTypeRequired
    }

    if (isBlank(values.startDate)) {
      errors.startDate = PROFILE_MESSAGES.startDateRequired
    } else if (!isValidIsoDate(values.startDate!)) {
      errors.startDate = PROFILE_MESSAGES.dateInvalid
    }

    if (isBlank(values.contractStartDate)) {
      errors.contractStartDate = PROFILE_MESSAGES.contractStartDateRequired
    } else if (!isValidIsoDate(values.contractStartDate!)) {
      errors.contractStartDate = PROFILE_MESSAGES.dateInvalid
    }

    if (isBlank(values.contractEndDate)) {
      errors.contractEndDate = PROFILE_MESSAGES.contractEndDateRequired
    } else if (!isValidIsoDate(values.contractEndDate!)) {
      errors.contractEndDate = PROFILE_MESSAGES.dateInvalid
    } else if (
      !errors.contractStartDate &&
      values.contractStartDate &&
      values.contractEndDate! <= values.contractStartDate
    ) {
      errors.contractEndDate = PROFILE_MESSAGES.contractEndBeforeStart
    }

    if (isBlank(values.shift)) {
      errors.shift = PROFILE_MESSAGES.shiftRequired
    }
    if (isBlank(values.shiftStartTime) || !TIME_PATTERN.test(values.shiftStartTime!)) {
      errors.shiftStartTime = PROFILE_MESSAGES.shiftStartRequired
    }
    if (isBlank(values.shiftEndTime) || !TIME_PATTERN.test(values.shiftEndTime!)) {
      errors.shiftEndTime = PROFILE_MESSAGES.shiftEndRequired
    } else if (
      !errors.shiftStartTime &&
      values.shiftStartTime &&
      values.shiftEndTime! <= values.shiftStartTime
    ) {
      errors.shiftEndTime = PROFILE_MESSAGES.shiftEndBeforeStart
    }
  }

  return errors
}
