import {
  isValidCPF,
  isValidCNPJ,
  parseTime,
  addMonthsIso,
  checkPeriod,
  checkSchedule,
  validateCommitmentTerm,
  validateRegistrationRequest,
  validateAdditiveTerm,
} from '@/lib/internship-validation'

const PERIOD = { start: 'start', end: 'end' }
const SCHED = { fieldPrefix: 'horarios', weeklyHoursField: 'weekly_hours' }

describe('documentos', () => {
  it('valida CPF pelos dígitos verificadores', () => {
    expect(isValidCPF('529.982.247-25')).toBe(true)
    expect(isValidCPF('529.982.247-24')).toBe(false)
    expect(isValidCPF('111.111.111-11')).toBe(false)
    expect(isValidCPF('123')).toBe(false)
  })

  it('valida CNPJ pelos dígitos verificadores', () => {
    expect(isValidCNPJ('11.222.333/0001-81')).toBe(true)
    expect(isValidCNPJ('11.222.333/0001-80')).toBe(false)
    expect(isValidCNPJ('00.000.000/0000-00')).toBe(false)
  })
})

describe('parseTime', () => {
  it.each([
    ['08:00', 480],
    ['8:00', 480],
    ['08h', 480],
    ['8h30', 510],
    ['0830', 510],
    ['13', 780],
  ])('%s → %i min', (v, min) => expect(parseTime(v)).toBe(min))

  it.each(['', 'abc', '25:00', '08:61'])('rejeita %p', (v) => expect(parseTime(v)).toBeNull())
})

describe('checkPeriod', () => {
  it('exige fim depois do início', () => {
    const { errors } = checkPeriod('2026-12-01', '2026-11-30', PERIOD)
    expect(errors.end).toMatch(/depois da data de início/)
  })

  it('aceita exatamente 24 meses', () => {
    expect(addMonthsIso('2026-01-15', 24)).toBe('2028-01-15')
    const r = checkPeriod('2026-01-15', '2028-01-15', PERIOD, { hasDisability: false })
    expect(r.errors).toEqual({})
  })

  it('bloqueia mais de 24 meses sem deficiência e informa o término máximo', () => {
    const { errors } = checkPeriod('2026-01-15', '2028-01-16', PERIOD, { hasDisability: false })
    expect(errors.end).toContain('15/01/2028')
  })

  it('permite até 48 meses para pessoa com deficiência', () => {
    const r = checkPeriod('2026-01-15', '2029-06-30', PERIOD, { hasDisability: true })
    expect(r.errors).toEqual({})
    expect(r.warnings).toEqual([])
  })

  it('só avisa quando o formulário não sabe se há deficiência', () => {
    const r = checkPeriod('2026-01-15', '2029-06-30', PERIOD)
    expect(r.errors).toEqual({})
    expect(r.warnings[0]).toMatch(/24 meses/)
  })

  it('bloqueia mais de 48 meses em qualquer caso', () => {
    const { errors } = checkPeriod('2026-01-15', '2030-02-01', PERIOD)
    expect(errors.end).toMatch(/48 meses/)
  })
})

describe('checkSchedule', () => {
  const week = (inicio: string, final: string) =>
    Object.fromEntries(
      ['segunda_feira', 'terca_feira', 'quarta_feira', 'quinta_feira', 'sexta_feira'].map((d) => [
        d,
        { inicio, final },
      ])
    )

  it('aceita 4 h × 5 dias = 20 h declaradas', () => {
    expect(checkSchedule(week('08:00', '12:00'), '20', SCHED).errors).toEqual({})
  })

  it('bloqueia mais de 6 h num dia', () => {
    const { errors } = checkSchedule(
      { segunda_feira: { inicio: '08:00', final: '15:00' } },
      '',
      SCHED
    )
    expect(errors['horarios.segunda_feira']).toMatch(/7h.*6 h por dia/)
  })

  it('bloqueia carga semanal acima de 30 h', () => {
    const { errors } = checkSchedule(undefined, '31', SCHED)
    expect(errors.weekly_hours).toMatch(/30 h/)
  })

  it('bloqueia quadro que soma mais de 30 h', () => {
    // 5 dias × 6 h = 30 h é exatamente o limite
    expect(checkSchedule(week('08:00', '14:00'), '', SCHED).errors).toEqual({})
    const sixDays = { ...week('08:00', '14:00'), sabado: { inicio: '08:00', final: '10:00' } }
    expect(checkSchedule(sixDays, '', SCHED).errors['horarios.total']).toMatch(/32h/)
  })

  it('aponta quadro diferente da carga declarada', () => {
    const { errors } = checkSchedule(week('08:00', '12:00'), '30', SCHED)
    expect(errors['horarios.total']).toMatch(/20h.*30 h/)
  })

  it('aponta fim antes do início e horário inválido', () => {
    const { errors } = checkSchedule(
      {
        segunda_feira: { inicio: '12:00', final: '08:00' },
        terca_feira: { inicio: 'x', final: '' },
      },
      '',
      SCHED
    )
    expect(errors['horarios.segunda_feira']).toMatch(/depois do início/)
    expect(errors['horarios.terca_feira']).toMatch(/inválido/)
  })
})

describe('validateCommitmentTerm', () => {
  const valid = {
    internship_type: 'obrigatorio',
    company_name: 'Empresa',
    company_cnpj: '11.222.333/0001-81',
    company_representative: 'Ana',
    student_name: 'Maria',
    student_cpf: '529.982.247-25',
    student_course: 'Computação',
    student_id: '2023',
    advisor_name: 'Prof.',
    supervisor_name: 'Carlos',
    activities_description: 'Desenvolver sistemas',
    weekly_hours: '20',
    start_date: '2026-12-01',
    end_date: '2027-05-31',
    horarios: JSON.stringify({
      segunda_feira: { inicio: '08:00', final: '12:00' },
      terca_feira: { inicio: '08:00', final: '12:00' },
      quarta_feira: { inicio: '08:00', final: '12:00' },
      quinta_feira: { inicio: '08:00', final: '12:00' },
      sexta_feira: { inicio: '08:00', final: '12:00' },
    }),
  }

  it('passa com um termo completo', () => {
    expect(validateCommitmentTerm(valid).errors).toEqual({})
  })

  it('aponta campos vazios, CPF inválido e carga acima do limite', () => {
    const { errors } = validateCommitmentTerm({
      ...valid,
      internship_type: '',
      student_cpf: '111.111.111-11',
      weekly_hours: '40',
    })
    expect(errors.internship_type).toMatch(/tipo de estágio/)
    expect(errors.student_cpf).toMatch(/CPF inválido/)
    expect(errors.weekly_hours).toMatch(/30 h/)
  })
})

describe('validateRegistrationRequest', () => {
  it('usa a deficiência informada para o limite de duração', () => {
    const base = {
      nome: 'Maria',
      cpf: '529.982.247-25',
      curso: 'Computação',
      matricula: '2023',
      supervisor_nome: 'Carlos',
      carga_horaria_semanal: '20',
      data_inicial: '2026-01-01',
      data_final_prevista: '2028-06-30',
    }
    expect(
      validateRegistrationRequest({ ...base, deficiencia: [] }).errors.data_final_prevista
    ).toMatch(/24 meses/)
    expect(
      validateRegistrationRequest({ ...base, deficiencia: ['visual'] }).errors.data_final_prevista
    ).toBeUndefined()
  })
})

describe('validateAdditiveTerm', () => {
  const base = { company_name: 'Empresa', student_name: 'Maria', justification: 'Motivo' }

  it('exige ao menos uma alteração marcada', () => {
    expect(validateAdditiveTerm(base).errors.additive_type_prorogation).toMatch(/pelo menos uma/)
  })

  it('exige os campos da alteração marcada', () => {
    const { errors } = validateAdditiveTerm({
      ...base,
      additive_type_schedule: 'true',
      new_weekly_hours: '35',
    })
    expect(errors.new_schedule).toBeDefined()
    expect(errors.new_weekly_hours).toMatch(/30 h/)
  })

  it('passa com prorrogação preenchida', () => {
    expect(
      validateAdditiveTerm({
        ...base,
        additive_type_prorogation: 'true',
        new_end_date: '2027-06-30',
      }).errors
    ).toEqual({})
  })
})
