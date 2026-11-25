import {
  PROFILE_MESSAGES,
  validateProfileForm,
  validateSelfProfileForm,
} from '@/lib/profile-validation'

const VALID_STUDENT = {
  phone: '(85) 99999-9999',
  address: 'Rua A, 123, Centro, Maracanaú',
  birthDate: '2005-03-15',
  emergencyContact: 'Maria',
  emergencyPhone: '(85) 3333-4444',
  department: 'Alunos',
  registrationNumber: '20231234567',
  contractType: 'ESTAGIO_20H',
  startDate: '2026-02-01',
  contractStartDate: '2026-02-01',
  contractEndDate: '2026-12-01',
  shift: 'MORNING',
  shiftStartTime: '08:00',
  shiftEndTime: '12:00',
}

const opts = { isEmployee: true, today: '2026-11-09' }

describe('validateProfileForm', () => {
  it('aceita um cadastro de aluno completo', () => {
    expect(validateProfileForm(VALID_STUDENT, opts)).toEqual({})
  })

  it('aponta cada campo obrigatório vazio com instrução de como preencher', () => {
    const errors = validateProfileForm({}, opts)
    expect(Object.keys(errors).sort()).toEqual(
      [
        'phone',
        'address',
        'birthDate',
        'emergencyContact',
        'emergencyPhone',
        'department',
        'registrationNumber',
        'contractType',
        'startDate',
        'contractStartDate',
        'contractEndDate',
        'shift',
        'shiftStartTime',
        'shiftEndTime',
      ].sort()
    )
    expect(errors.phone).toContain('(85) 99999-9999')
  })

  it('explica o formato esperado quando o telefone está incompleto', () => {
    const errors = validateProfileForm({ ...VALID_STUDENT, phone: '(85) 9999' }, opts)
    expect(errors.phone).toBe(PROFILE_MESSAGES.phoneFormat)
    expect(errors.phone).toMatch(/DDD/)
  })

  it('rejeita data de nascimento no futuro', () => {
    const errors = validateProfileForm({ ...VALID_STUDENT, birthDate: '2030-01-01' }, opts)
    expect(errors.birthDate).toBe(PROFILE_MESSAGES.birthDateFuture)
  })

  it('rejeita data de nascimento com ano digitado errado', () => {
    const errors = validateProfileForm({ ...VALID_STUDENT, birthDate: '0205-03-15' }, opts)
    expect(errors.birthDate).toBe(PROFILE_MESSAGES.birthDateTooOld)
  })

  it('rejeita ano 0026 e 0027 no início e término de contrato', () => {
    const errors = validateProfileForm(
      {
        ...VALID_STUDENT,
        startDate: '0026-11-09',
        contractStartDate: '0026-11-09',
        contractEndDate: '0027-04-09',
      },
      opts
    )
    expect(errors.startDate).toBe(PROFILE_MESSAGES.contractYearInvalid)
    expect(errors.contractStartDate).toBe(PROFILE_MESSAGES.contractYearInvalid)
    expect(errors.contractEndDate).toBe(PROFILE_MESSAGES.contractYearInvalid)
  })

  it('rejeita fim do contrato antes do início', () => {
    const errors = validateProfileForm(
      { ...VALID_STUDENT, contractStartDate: '2026-06-01', contractEndDate: '2026-05-01' },
      opts
    )
    expect(errors.contractEndDate).toBe(PROFILE_MESSAGES.contractEndBeforeStart)
  })

  it('rejeita horário de fim do turno antes do início', () => {
    const errors = validateProfileForm(
      { ...VALID_STUDENT, shiftStartTime: '12:00', shiftEndTime: '08:00' },
      opts
    )
    expect(errors.shiftEndTime).toBe(PROFILE_MESSAGES.shiftEndBeforeStart)
  })

  it('valida SIAPE só quando o usuário marcou que possui', () => {
    expect(validateProfileForm({ ...VALID_STUDENT, siapeNumber: '12' }, opts)).toEqual({})
    const errors = validateProfileForm(
      { ...VALID_STUDENT, hasSiape: true, siapeNumber: '12' },
      opts
    )
    expect(errors.siapeNumber).toBe(PROFILE_MESSAGES.siapeFormat)
  })

  it('não exige campos de contrato de quem não é aluno/estagiário', () => {
    const { phone, address, birthDate, emergencyContact, emergencyPhone } = VALID_STUDENT
    expect(
      validateProfileForm(
        { phone, address, birthDate, emergencyContact, emergencyPhone },
        { isEmployee: false, today: '2026-11-09' }
      )
    ).toEqual({})
  })
})

describe('validateSelfProfileForm ("Meu perfil")', () => {
  const valid = {
    phone: '(85) 98888-7777',
    address: 'Rua Nova, 45, Centro, Maracanaú',
    emergencyContact: 'Mãe',
    emergencyPhone: '(85) 97777-6666',
  }

  it('aceita contatos válidos', () => {
    expect(validateSelfProfileForm(valid)).toEqual({})
  })

  it('aponta telefone incompleto e contato de emergência vazio', () => {
    const errors = validateSelfProfileForm({ ...valid, phone: '(85) 9888', emergencyContact: ' ' })
    expect(Object.keys(errors).sort()).toEqual(['emergencyContact', 'phone'])
  })
})
