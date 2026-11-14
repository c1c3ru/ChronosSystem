import {
  buildCommitmentTermDoc,
  insuranceClause,
  internshipTypeLabel,
} from '@/lib/pdf-templates/commitment-term.pdf'

const contentOf = async (data: Parameters<typeof buildCommitmentTermDoc>[0]) =>
  JSON.stringify((await buildCommitmentTermDoc(data)).content)

describe('Termo de Compromisso — tipo de estágio', () => {
  it('imprime OBRIGATÓRIO e o seguro pelo IFCE no estágio obrigatório', async () => {
    const content = await contentOf({ internship_type: 'obrigatorio' })

    expect(content).toContain('será OBRIGATÓRIO')
    expect(content).toContain('o INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DO CEARÁ')
    expect(content).not.toContain('A concedente neste ato contrata')
  })

  it('imprime NÃO OBRIGATÓRIO e a apólice da concedente no não obrigatório', async () => {
    const content = await contentOf({
      internship_type: 'nao_obrigatorio',
      insurance_policy: '123456',
      insurance_company: 'Seguradora X',
    })

    expect(content).toContain('será NÃO OBRIGATÓRIO')
    expect(content).toContain(
      'A concedente neste ato contrata em favor do DISCENTE ESTAGIÁRIO seguro contra acidentes pessoais, com cobertura limitada ao local e período de estágio, mediante apólice 123456 da seguradora Seguradora X.'
    )
  })

  it('deixa lacuna quando o tipo não foi escolhido, em vez de presumir não obrigatório', () => {
    expect(internshipTypeLabel(undefined)).toMatch(/^_+$/)
    expect(internshipTypeLabel('')).toMatch(/^_+$/)
  })

  it('no obrigatório cita a apólice só quando informada', () => {
    expect(insuranceClause({ internship_type: 'obrigatorio' })).not.toContain('apólice')
    expect(
      insuranceClause({
        internship_type: 'obrigatorio',
        insurance_policy: '999',
        insurance_company: 'Seg',
      })
    ).toContain('apólice 999 da seguradora Seg')
  })
})

describe('Termo de Compromisso — bolsa e transporte', () => {
  it('escreve os valores por extenso sem duplicar o R$ da máscara', async () => {
    const content = await contentOf({
      internship_type: 'nao_obrigatorio',
      has_grant: 'true',
      grant_value: 'R$ 600,00',
      has_transport: 'true',
      transport_value: 'R$ 150,50',
    })

    expect(content).toContain('bolsa-auxílio no valor de R$ 600,00 (seiscentos reais)')
    expect(content).toContain(
      'auxílio-transporte no valor de R$ 150,50 (cento e cinquenta reais e cinquenta centavos)'
    )
    expect(content).not.toContain('R$ R$')
  })

  it('deixa lacuna quando a bolsa existe mas o valor está vazio', async () => {
    const content = await contentOf({ has_grant: 'true', grant_value: '' })

    expect(content).toContain('bolsa-auxílio no valor de R$ ____________.')
  })
})
