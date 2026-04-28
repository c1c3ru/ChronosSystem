/**
 * additive-term.pdf.ts
 *
 * Template pdfmake do "Termo Aditivo ao Contrato de Estágio" (IFCE).
 * Retorna um TDocumentDefinitions pronto para ser passado ao BasePDFService.
 *
 * USO:
 *   import { buildAdditiveTermDoc } from '@/lib/pdf-templates/additive-term.pdf'
 *   import { generatePDF } from '@/lib/pdfmake-base-service'
 *
 *   const doc = await buildAdditiveTermDoc(formData)
 *   await generatePDF(doc, { filename: 'termo-aditivo.pdf' })
 */

import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces'
import {
  ifceHeader,
  docTitle,
  cell,
  emptyCell,
  dataTable,
  sectionBlock,
  sigBlock,
  fmtDate,
  v,
} from '@/lib/pdfmake-base-service'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface AdditiveTermData {
  // Estagiário
  nome_estudante?: string
  matricula_estudante?: string
  curso_estudante?: string

  // Empresa
  empresa_nome?: string
  empresa_cnpj?: string
  empresa_telefone?: string

  // Alterações contratuais
  motivo_aditivo?: string
  justificativa?: string
  nova_data_fim?: string
  novo_fim?: string
  nova_carga_horaria?: string
  prazo_prorrogacao?: string
  novo_valor_bolsa?: string
  novo_valor_transporte?: string
}

// ─── BUILDER ─────────────────────────────────────────────────────────────────

/**
 * Constrói o TDocumentDefinitions completo para o Termo Aditivo.
 * É assíncrono por causa do carregamento das imagens do cabeçalho.
 */
export async function buildAdditiveTermDoc(d: AdditiveTermData): Promise<TDocumentDefinitions> {
  const header = await ifceHeader()

  // ── Tabela 1: Identificação ──────────────────────────────────────────────
  const identificationTable = dataTable(
    ['40%', '20%', '40%'],
    [
      [
        cell('Discente', v(d.nome_estudante)),
        cell('Matrícula', v(d.matricula_estudante)),
        cell('Curso', v(d.curso_estudante)),
      ],
      [
        cell('Empresa', v(d.empresa_nome)),
        cell('CNPJ', v(d.empresa_cnpj)),
        cell('Telefone', v(d.empresa_telefone)),
      ],
    ]
  )

  // ── Faixa "Alterações Contratuais" ───────────────────────────────────────
  const sectionBarAlt: Content = {
    table: {
      widths: ['*'],
      body: [[{
        text: 'ALTERAÇÕES CONTRATUAIS',
        style: 'sectionBar',
        margin: [4, 2, 4, 2],
        border: [true, true, true, true],
      }]],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 4, 0, 0],
  }

  // ── Tabela 2: Alterações ─────────────────────────────────────────────────
  const novaDataFim = fmtDate(d.nova_data_fim ?? d.novo_fim)
  const novaCH = d.nova_carga_horaria ? `${d.nova_carga_horaria} h` : ''

  const alteracoesTable = dataTable(
    ['*'],
    [
      // Linha 1: Motivo (largura total)
      [cell('Motivo do Aditivo', v(d.motivo_aditivo ?? d.justificativa))],
      // Linha 2: três colunas
      ...[
        // Usamos uma sub-tabela para ter 3 colunas dentro da célula única
        [{
          table: {
            widths: ['34%', '33%', '33%'],
            body: [[
              cell('Nova Data de Término', novaDataFim),
              cell('Nova C.H. Semanal', novaCH),
              cell('Período Prorrogação', v(d.prazo_prorrogacao)),
            ]],
          },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: (i: number) => (i === 0 || i === 3 ? 0 : 0.5),
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
          margin: [0, 0, 0, 0],
          border: [true, false, true, true],
        } as TableCell],
      ],
      // Linha 3: Bolsa + Transporte
      ...[
        [{
          table: {
            widths: ['50%', '50%'],
            body: [[
              cell('Novo Valor Bolsa (R$)', v(d.novo_valor_bolsa)),
              cell('Novo Aux. Transporte (R$)', v(d.novo_valor_transporte)),
            ]],
          },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: (i: number) => (i === 0 || i === 2 ? 0 : 0.5),
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
          margin: [0, 0, 0, 0],
          border: [true, false, true, true],
        } as TableCell],
      ],
    ]
  )

  // ── Seção Justificativa ──────────────────────────────────────────────────
  const justSection = sectionBlock('JUSTIFICATIVA', v(d.justificativa))

  // ── Assinaturas ──────────────────────────────────────────────────────────
  const signatures = sigBlock(
    ['Supervisor do Estágio', 'Discente Estagiário', 'Coordenador de Estágios'],
    'As demais cláusulas do Termo de Compromisso permanecem inalteradas.'
  )

  // ── Montagem final ───────────────────────────────────────────────────────
  const content: Content[] = [
    ...header,
    docTitle('Termo Aditivo ao Contrato de Estágio'),
    identificationTable,
    sectionBarAlt,
    alteracoesTable,
    ...justSection,
    ...signatures,
  ]

  return { content }
}
