import { buildStudentEvaluationDoc } from '@/lib/pdf-templates/student-evaluation.pdf'
import { EVALUATION_CRITERIA, averageGrade, parseAttendance } from '@/lib/student-evaluation'
import { validateStudentEvaluation } from '@/lib/internship-validation'

const allGrades = (grade: string) =>
  Object.fromEntries(EVALUATION_CRITERIA.map((c) => [c.key, grade])) as Record<string, string>

const complete = {
  student_name: 'Maria Estagiária',
  company_supervisor: 'Carlos Supervisor',
  attendance_percent: '92',
  ...allGrades('4'),
}

describe('critérios do art. 40', () => {
  it('incluem os critérios citados na Res. 108/2023', () => {
    const labels = EVALUATION_CRITERIA.map((c) => c.label).join(' | ')
    for (const termo of [
      'Aplicação dos conhecimentos teóricos',
      'Aprendizado',
      'Assiduidade',
      'Atendimento às orientações',
      'Cooperação',
      'Comunicação',
      'Pontualidade',
      'Proatividade',
      'Relacionamento',
      'Responsabilidade',
    ]) {
      expect(labels).toContain(termo)
    }
  })
})

describe('averageGrade e parseAttendance', () => {
  it('calcula a média das notas preenchidas', () => {
    expect(averageGrade({ eval_assiduity: '5', eval_punctuality: '4' })).toBe(4.5)
    expect(averageGrade({})).toBeNull()
  })

  it('lê frequência com vírgula ou %', () => {
    expect(parseAttendance('85,5%')).toBe(85.5)
    expect(parseAttendance('abc')).toBeNull()
  })
})

describe('validateStudentEvaluation', () => {
  it('passa com a avaliação completa', () => {
    expect(validateStudentEvaluation(complete)).toEqual({ errors: {}, warnings: [] })
  })

  it('exige nota em todos os critérios e a frequência', () => {
    const { errors } = validateStudentEvaluation({
      ...complete,
      eval_guidance: '',
      attendance_percent: '',
    })
    expect(errors.eval_guidance).toMatch(/Atendimento às orientações/)
    expect(errors.attendance_percent).toBeDefined()
  })

  it('não aceita conceito satisfatório com frequência abaixo de 70%', () => {
    const { errors } = validateStudentEvaluation({
      ...complete,
      attendance_percent: '65',
      final_concept: 'satisfatorio',
    })
    expect(errors.final_concept).toMatch(/70%/)
  })

  it('só avisa frequência baixa quando o conceito não foi dado', () => {
    const r = validateStudentEvaluation({ ...complete, attendance_percent: '65' })
    expect(r.errors).toEqual({})
    expect(r.warnings[0]).toMatch(/abaixo do mínimo/)
  })
})

describe('buildStudentEvaluationDoc', () => {
  it('imprime critérios, média, frequência e conceito final', async () => {
    const doc = await buildStudentEvaluationDoc({
      ...complete,
      eval_assiduity: '5',
      final_concept: 'satisfatorio',
      advisor_name: 'Prof. Orientador',
    })
    const content = JSON.stringify(doc.content)

    expect(content).toContain('Termo de Avaliação ao Discente Estagiário'.toUpperCase())
    expect(content).toContain('Aplicação dos conhecimentos teóricos na prática')
    expect(content).toContain('4,1') // média: (12 × 4 + 5) / 13 = 4,08
    expect(content).toContain('92 %')
    expect(content).toContain('(X) Satisfatório')
    expect(content).toContain('( ) Insatisfatório')
    expect(content).toContain('Prof. Orientador')
    expect(content).toContain('DOCENTE ORIENTADOR')
  })

  it('marca frequência abaixo do mínimo', async () => {
    const doc = await buildStudentEvaluationDoc({ attendance_percent: '60' })
    expect(JSON.stringify(doc.content)).toContain('60 % (abaixo do mínimo de 70%)')
  })
})
