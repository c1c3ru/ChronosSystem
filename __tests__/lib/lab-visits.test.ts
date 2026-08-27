import {
  PUBLIC_VISIT_SELECT,
  SENSITIVE_VISIT_FIELDS,
  createLabVisitSchema,
  VISIT_SHIFTS,
} from '@/lib/lab-visits'

describe('lab-visits: filtragem LGPD do payload público', () => {
  it('PUBLIC_VISIT_SELECT expõe estritamente os 5 campos permitidos', () => {
    const keys = Object.keys(PUBLIC_VISIT_SELECT).sort()
    expect(keys).toEqual(
      ['responsibleName', 'schoolName', 'studentCount', 'visitDate', 'shift'].sort()
    )
  })

  it('PUBLIC_VISIT_SELECT nunca inclui campos sensíveis (email, telefone, ids)', () => {
    const selectedKeys = Object.keys(PUBLIC_VISIT_SELECT)

    for (const sensitiveField of SENSITIVE_VISIT_FIELDS) {
      expect(selectedKeys).not.toContain(sensitiveField)
    }
  })

  it('todos os valores do select são `true` (nenhum include/relação que vaze dados extras)', () => {
    for (const value of Object.values(PUBLIC_VISIT_SELECT)) {
      expect(value).toBe(true)
    }
  })
})

describe('lab-visits: createLabVisitSchema', () => {
  const validPayload = {
    labId: 'lab-1',
    responsibleName: 'Maria Silva',
    schoolName: 'Escola Estadual Exemplo',
    studentCount: 25,
    visitDate: '2026-09-10',
    shift: 'MORNING',
    contactEmail: 'maria@escola.exemplo.br',
    contactPhone: '85999999999',
  }

  it('aceita um payload válido', () => {
    const result = createLabVisitSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('rejeita email inválido', () => {
    const result = createLabVisitSchema.safeParse({ ...validPayload, contactEmail: 'não-é-email' })
    expect(result.success).toBe(false)
  })

  it('rejeita turno fora de VISIT_SHIFTS', () => {
    const result = createLabVisitSchema.safeParse({ ...validPayload, shift: 'MADRUGADA' })
    expect(result.success).toBe(false)
  })

  it('rejeita quantidade de alunos não positiva', () => {
    const result = createLabVisitSchema.safeParse({ ...validPayload, studentCount: 0 })
    expect(result.success).toBe(false)
  })

  it('VISIT_SHIFTS não inclui turnos inventados', () => {
    expect(VISIT_SHIFTS).toEqual(['MORNING', 'AFTERNOON', 'NIGHT'])
  })
})
