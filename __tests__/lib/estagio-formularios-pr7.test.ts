import { buildConcedenteEvaluationDoc } from '@/lib/pdf-templates/concedente-evaluation.pdf'
import { buildWorkDeclarationDoc } from '@/lib/pdf-templates/work-declaration.pdf'
import { longDate, parseActivities } from '@/lib/work-declaration'
import { validateConcedenteEvaluation, validateWorkDeclaration } from '@/lib/internship-validation'

const VALID_CPF = '529.982.247-25'
const VALID_CNPJ = '11.222.333/0001-81'

describe('parseActivities e longDate', () => {
  it('uma atividade por linha, sem vazias e sem a numeração digitada', () => {
    expect(parseActivities('1. Gestão\n\n2) Suporte\n  3 - Vendas  \nTreinamento')).toEqual([
      'Gestão',
      'Suporte',
      'Vendas',
      'Treinamento',
    ])
    expect(parseActivities(undefined)).toEqual([])
  })

  it('data por extenso, ou linha em branco', () => {
    expect(longDate('2026-11-03')).toBe('3 de novembro de 2026')
    expect(longDate('')).toContain('______ de')
    expect(longDate('2026-13-01')).toContain('______ de')
  })
})

describe('buildConcedenteEvaluationDoc', () => {
  it('marca as opções escolhidas e leva todos os dados da concedente', async () => {
    const content = JSON.stringify(
      (
        await buildConcedenteEvaluationDoc({
          campus: 'Maracanaú',
          company_name: 'Empresa Exemplo',
          company_industry: 'Software',
          company_cnpj: VALID_CNPJ,
          company_email: 'contato@exemplo.com',
          company_supervisor: 'Carlos Supervisor',
          internship_sector: 'TI',
          visit_purpose: 'acompanhamento',
          area_compatible: 'nao',
          area_compatible_reason: 'Área de vendas',
          company_visited_institution: 'sim',
          facilities_evaluation: 'satisfatorias',
          evaluation_date: '2026-11-13',
          city: 'Maracanaú',
        })
      ).content
    )
    expect(content).toContain('(X) Acompanhamento de atividades de estágio')
    expect(content).toContain('( ) Análise da concedente')
    expect(content).toContain('(X) NÃO')
    expect(content).toContain('Área de vendas')
    expect(content).toContain('(X) Satisfatórias')
    expect(content).toContain('Campus Maracanaú')
    expect(content).toContain('Carlos Supervisor')
    expect(content).toContain('Maracanaú, 13 de novembro de 2026.')
  })

  it('dados vazios não quebram a geração', async () => {
    await expect(buildConcedenteEvaluationDoc({})).resolves.toHaveProperty('content')
  })
})

describe('buildWorkDeclarationDoc', () => {
  it('proprietário: texto com empresa, CNPJ, data e atividades numeradas', async () => {
    const doc = await buildWorkDeclarationDoc('owner', {
      declarant_name: 'João Proprietário',
      declarant_cpf: VALID_CPF,
      company_name: 'JP Tecnologia',
      company_cnpj: VALID_CNPJ,
      since_date: '2022-03-01',
      company_industry: 'Consultoria',
      activities: 'Gestão\nSuporte',
    })
    const content = JSON.stringify(doc.content)
    expect(content).toContain('DECLARAÇÃO DE PROPRIETÁRIO')
    expect(content).toContain('JP Tecnologia')
    expect(content).toContain('01/03/2022')
    expect(content).toContain('"ol":[{"text":"Gestão"')
    expect(content).toContain('habilitação jurídica')
  })

  it('autônomo não imprime conselho; profissional liberal imprime', async () => {
    const autonomo = JSON.stringify(
      (
        await buildWorkDeclarationDoc('self-employed', {
          professional_type: 'autonomo',
          profession: 'Designer',
          council_name: 'CREA',
          council_number: '999',
        })
      ).content
    )
    expect(autonomo).toContain('(autônomo)')
    expect(autonomo).not.toContain('CREA')

    const liberal = JSON.stringify(
      (
        await buildWorkDeclarationDoc('self-employed', {
          professional_type: 'liberal',
          council_name: 'CREA-CE',
          council_number: '123',
        })
      ).content
    )
    expect(liberal).toContain('(profissional liberal)')
    expect(liberal).toContain('CREA-CE')
  })
})

describe('validateConcedenteEvaluation', () => {
  const ok = {
    company_name: 'Empresa',
    visit_purpose: 'analise',
    area_compatible: 'sim',
    company_visited_institution: 'nao',
    facilities_evaluation: 'satisfatorias',
  }

  it('aceita o mínimo preenchido', () => {
    expect(validateConcedenteEvaluation(ok)).toEqual({ errors: {}, warnings: [] })
  })

  it('exige as 4 respostas', () => {
    const { errors } = validateConcedenteEvaluation({ company_name: 'Empresa' })
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining([
        'visit_purpose',
        'area_compatible',
        'company_visited_institution',
        'facilities_evaluation',
      ])
    )
  })

  it('exige o "por quê" em resposta negativa e avisa', () => {
    const result = validateConcedenteEvaluation({
      ...ok,
      area_compatible: 'nao',
      facilities_evaluation: 'insatisfatorias',
    })
    expect(result.errors).toHaveProperty('area_compatible_reason')
    expect(result.errors).toHaveProperty('facilities_reason')
    expect(result.warnings).toHaveLength(1)
  })

  it('confere CNPJ e e-mail quando preenchidos', () => {
    const { errors } = validateConcedenteEvaluation({
      ...ok,
      company_cnpj: '11.111.111/1111-11',
      company_email: 'sem-arroba',
    })
    expect(errors).toHaveProperty('company_cnpj')
    expect(errors).toHaveProperty('company_email')
  })
})

describe('validateWorkDeclaration', () => {
  const base = {
    declarant_name: 'Fulano',
    declarant_rg: '123',
    declarant_cpf: VALID_CPF,
    since_date: '2020-01-01',
    activities: 'Atividade 1',
  }
  const today = '2026-11-14'

  it('proprietário completo passa', () => {
    const result = validateWorkDeclaration(
      'owner',
      { ...base, company_name: 'X', company_cnpj: VALID_CNPJ, company_industry: 'TI' },
      today
    )
    expect(result.errors).toEqual({})
  })

  it('profissional liberal exige conselho e número; autônomo não', () => {
    const liberal = validateWorkDeclaration(
      'self-employed',
      { ...base, professional_type: 'liberal', profession: 'Engenheiro' },
      today
    )
    expect(liberal.errors).toHaveProperty('council_name')
    expect(liberal.errors).toHaveProperty('council_number')

    const autonomo = validateWorkDeclaration(
      'self-employed',
      { ...base, professional_type: 'autonomo', profession: 'Designer' },
      today
    )
    expect(autonomo.errors).toEqual({})
  })

  it('CPF inválido, data futura, sem atividades e mais de 10 atividades', () => {
    const { errors } = validateWorkDeclaration(
      'self-employed',
      {
        ...base,
        professional_type: 'autonomo',
        profession: 'Designer',
        declarant_cpf: '111.111.111-11',
        since_date: '2027-01-01',
        activities: '',
      },
      today
    )
    expect(errors).toHaveProperty('declarant_cpf')
    expect(errors).toHaveProperty('since_date')
    expect(errors.activities).toMatch(/pelo menos uma/)

    const many = validateWorkDeclaration(
      'self-employed',
      {
        ...base,
        professional_type: 'autonomo',
        profession: 'Designer',
        activities: Array.from({ length: 11 }, (_, i) => `A${i}`).join('\n'),
      },
      today
    )
    expect(many.errors.activities).toMatch(/até 10/)
  })
})
