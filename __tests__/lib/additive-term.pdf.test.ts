import { buildAdditiveTermDoc, ADDITIVE_TYPES } from '@/lib/pdf-templates/additive-term.pdf'

const baseData = {
  company_name: 'Empresa Exemplo LTDA',
  company_cnpj: '12.345.678/0001-90',
  company_address: 'Rua das Flores, 100',
  company_representative: 'Ana Representante',
  company_representative_role: 'Diretora',
  student_name: 'Maria Estagiária',
  student_cpf: '123.456.789-00',
  student_enrollment: '20231234',
  student_course: 'Ciência da Computação',
  student_address: 'Av. Central, 200',
  student_phone: '(85) 99999-0000',
  additive_reason: 'Mudança de turno na faculdade',
  justification: 'Choque de horário com disciplina obrigatória',
  campus_city: 'Maracanaú',
  campus_director: 'José Diretor',
}

const contentOf = async (data: Parameters<typeof buildAdditiveTermDoc>[0]) =>
  JSON.stringify((await buildAdditiveTermDoc(data)).content)

describe('buildAdditiveTermDoc', () => {
  it('leva ao PDF todos os campos das alterações marcadas', async () => {
    const content = await contentOf({
      ...baseData,
      additive_type_schedule: 'true',
      additive_type_supervisor: 'true',
      new_weekly_hours: '20',
      new_schedule: 'Segunda a sexta, 13h às 17h',
      new_supervisor_name: 'Carlos Supervisor',
      new_supervisor_role: 'Analista',
      new_supervisor_council: 'CRA-CE 1234',
    })

    // Assinaturas saem em caixa alta, então compara sem diferenciar maiúsculas.
    for (const value of Object.values(baseData)) {
      expect(content.toUpperCase()).toContain(value.toUpperCase())
    }
    expect(content).toContain('Segunda a sexta, 13h às 17h')
    expect(content).toContain('20 h')
    expect(content).toContain('Carlos Supervisor')
    expect(content).toContain('Analista')
    expect(content).toContain('CRA-CE 1234')
    expect(content).toContain('(X) Alteração de Horário')
    expect(content).toContain('(X) Alteração de Supervisor')
    expect(content).toContain('( ) Prorrogação de Vigência')
  })

  it('não imprime campos de alterações desmarcadas', async () => {
    const content = await contentOf({
      ...baseData,
      additive_type_prorogation: 'false',
      new_end_date: '2027-03-31',
      additive_type_other: 'true',
      other_changes: 'Mudança de setor',
    })

    expect(content).not.toContain('31/03/2027')
    expect(content).toContain('Mudança de setor')
  })

  it('formata a nova data de término na prorrogação', async () => {
    const content = await contentOf({
      additive_type_prorogation: 'true',
      new_end_date: '2027-03-31',
      extension_period: '6 meses',
    })

    expect(content).toContain('31/03/2027')
    expect(content).toContain('6 meses')
  })

  it('gera o documento com dados vazios', async () => {
    const doc = await buildAdditiveTermDoc({})
    const content = JSON.stringify(doc.content)

    expect(Array.isArray(doc.content)).toBe(true)
    for (const t of ADDITIVE_TYPES) {
      expect(content).toContain(`( ) ${t.label}`)
    }
  })
})
