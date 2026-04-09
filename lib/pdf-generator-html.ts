/**
 * Gerador de PDF com layout fiel ao padrão IFCE
 * Usa html2pdf.js — sem WebAssembly
 *
 * CONTÉM: 13 builders HTML para documentos IFCE
 * EXPORTA: generateHTMLPDF da engine unificada
 */

import { LOGO_IFCE_BASE64, BRASAO_BASE64 } from './pdf-assets'
// Re-exportar generateHTMLPDF da engine unificada
export { generateHTMLPDF } from './pdf-engine'

function fmt(d?: string): string {
  if (!d) return '___/___/_____'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

// ─── CSS PADRÃO IFCE ─────────────────────────────────────────────────────────
const CSS = `
  html, body { margin:0; padding:0; background:#fff; }
  * { box-sizing:border-box; font-family:Arial,Helvetica,sans-serif; font-size:8.5px; color:#000; }
  body { padding:15px 18px; background:#fff; }

  /* Cabeçalho institucional */
  .hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  .hdr img { width:48px; height:48px; object-fit:contain; }
  .hdr-txt { text-align:center; flex:1; padding:0 8px; line-height:1.5; }
  .hdr-txt .inst { font-size:9.5px; font-weight:bold; text-transform:uppercase; color:#c00; }
  .hdr-txt .sub  { font-size:7.5px; }
  .hdr-txt .sub2 { font-size:7px; color:#c00; }
  .hdr-txt .campus { font-size:7.5px; font-weight:bold; }
  hr.hdr-line { border:none; border-top:1.5px solid #000; margin:4px 0 6px 0; }

  /* Título do documento */
  .doc-title { text-align:center; font-size:9.5px; font-weight:bold; text-transform:uppercase;
    border:1px solid #000; padding:4px; background:#efefef; margin-bottom:8px; letter-spacing:0.5px; }

  /* Tabelas de campos */
  table { width:100%; border-collapse:collapse; margin-bottom:0; }
  td, th { border:1px solid #555; padding:2px 4px; vertical-align:top; }
  .lbl { font-size:6.5px; font-weight:bold; text-transform:uppercase; color:#333; display:block; margin-bottom:1px; }
  .val { font-size:8.5px; min-height:11px; display:block; }

  /* Seções */
  .sec-bar { background:#d0d0d0; font-weight:bold; font-size:7.5px; text-transform:uppercase;
    border:1px solid #555; border-bottom:none; padding:2px 4px; margin-top:6px; }
  .sec-body { border:1px solid #555; padding:6px; min-height:55px; font-size:8.5px;
    line-height:1.5; white-space:pre-wrap; margin-bottom:6px; background:#fff; }

  /* Assinaturas */
  .sigs { display:flex; justify-content:space-around; margin-top:35px; }
  .sig { text-align:center; width:32%; }
  .sig-line { border-top:1px solid #000; padding-top:3px; font-size:7.5px;
    font-weight:bold; text-transform:uppercase; margin-top:28px; }

  /* Parágrafos de texto corrido */
  .para { font-size:9px; text-align:justify; line-height:1.6; margin-bottom:8px; }
  .bold { font-weight:bold; }
  .right { text-align:right; }
`

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function hdr(): string {
  return `
  <div class="hdr">
    <img src="${LOGO_IFCE_BASE64}" width="48" height="48" alt=""/>
    <div class="hdr-txt">
      <div class="inst">Instituto Federal de Educação, Ciência e Tecnologia do Ceará</div>
      <div class="sub">Pró-Reitoria de Extensão</div>
      <div class="sub2">Diretoria de Extensão e Relações Empresariais</div>
      <div class="sub2">Coordenadoria de Estágios e Acompanhamento de Egressos de <strong>Maracanaú</strong></div>
      <div class="campus">Campus Maracanaú</div>
    </div>
    <img src="${BRASAO_BASE64}" width="48" height="48" alt=""/>
  </div>
  <hr class="hdr-line"/>`
}

function f(label: string, value?: string, pct?: string): string {
  const w = pct ? ` style="width:${pct}"` : ''
  return `<td${w}><span class="lbl">${label}</span><span class="val">${value || ''}</span></td>`
}

function row(...cells: string[]): string {
  return `<tr>${cells.join('')}</tr>`
}

function sec(title: string, content?: string): string {
  return `<div class="sec-bar">${title}</div>
  <div class="sec-body">${content || ''}</div>`
}

function sigs(...labels: string[]): string {
  return `<div class="sigs">${labels
    .map((l) => `<div class="sig"><div class="sig-line">${l}</div></div>`)
    .join('')}</div>`
}

function wrap(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="pt-BR">
  <head><meta charset="UTF-8"><style>${CSS}</style></head>
  <body>${hdr()}<div class="doc-title">${title}</div>${body}</body></html>`
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILDERS DE CADA DOCUMENTO
// ═══════════════════════════════════════════════════════════════════════════════

// 1. Relatório Mensal
export function buildMonthlyReportHTML(d: Record<string, string>): string {
  return wrap(
    'Relatório Mensal de Atividades',
    `
    <table>
      ${row(f('Nome do Discente', d.nome_estudante, '100%'))}
      ${row(f('Curso', d.curso_estudante, '70%'), f('Matrícula', d.matricula_estudante, '30%'))}
      ${row(f('Supervisor do Estágio', d.nome_supervisor, '50%'), f('Docente Orientador (IFCE)', d.nome_orientador, '50%'))}
      ${row(f('Data Inicial', fmt(d.inicio_periodo), '33%'), f('Data Final', fmt(d.fim_periodo), '33%'), f('Carga Horária no Período', (d.horas_mes || '') + ' h', '34%'))}
    </table>
    ${sec('1. Principais Atividades Desenvolvidas no Período', d.atividades)}
    ${sec('2. Dificuldades Encontradas', d.dificuldades)}
    ${sec('3. Soluções Adotadas', d.solucoes)}
    ${sigs('Supervisor do Estágio', 'Discente Estagiário')}`
  )
}

// 2. Relatório Final
export function buildFinalReportHTML(d: Record<string, string>): string {
  return wrap(
    'Relatório Final de Estágio',
    `
    <table>
      ${row(f('Nome do Discente', d.nome_estudante, '100%'))}
      ${row(f('Curso', d.curso_estudante, '70%'), f('Matrícula', d.matricula_estudante, '30%'))}
      ${row(f('Supervisor do Estágio', d.nome_supervisor, '50%'), f('Docente Orientador (IFCE)', d.nome_orientador, '50%'))}
      ${row(f('Período de Estágio', fmt(d.inicio_periodo) + ' a ' + fmt(d.fim_periodo), '70%'), f('C.H. Total', (d.horas_total || '') + ' h', '30%'))}
    </table>
    ${sec('1. Resumo das Atividades Desenvolvidas', d.atividades)}
    ${sec('2. Competências Adquiridas', d.competencias)}
    ${sec('3. Avaliação do Estágio', d.avaliacao)}
    ${sec('4. Conclusão', d.conclusao)}
    ${sigs('Supervisor do Estágio', 'Discente Estagiário', 'Docente Orientador')}`
  )
}

// 3. Relatório Semestral
export function buildSemesterReportHTML(d: Record<string, string>): string {
  return wrap(
    'Relatório Semestral de Estágio',
    `
    <table>
      ${row(f('Nome do Discente', d.nome_estudante, '100%'))}
      ${row(f('Curso', d.curso_estudante, '70%'), f('Matrícula', d.matricula_estudante, '30%'))}
      ${row(f('Supervisor do Estágio', d.nome_supervisor, '50%'), f('Docente Orientador (IFCE)', d.nome_orientador, '50%'))}
      ${row(f('Período', fmt(d.inicio_periodo) + ' a ' + fmt(d.fim_periodo), '70%'), f('C.H. Semestral', (d.horas_semestre || '') + ' h', '30%'))}
    </table>
    ${sec('1. Atividades Desenvolvidas no Semestre', d.atividades)}
    ${sec('2. Dificuldades e Soluções', d.dificuldades)}
    ${sec('3. Resultados Alcançados', d.resultados)}
    ${sigs('Supervisor do Estágio', 'Discente Estagiário')}`
  )
}

// 4. Termo de Compromisso
export function buildCommitmentTermHTML(d: Record<string, string>): string {
  return wrap(
    'Termo de Compromisso de Estágio',
    `
    <table>
      ${row(f('Nome do Discente', d.nome_estudante, '100%'))}
      ${row(f('Curso', d.curso_estudante, '70%'), f('Matrícula', d.matricula_estudante, '30%'))}
      ${row(f('CPF', d.cpf_estudante, '40%'), f('RG', d.rg_estudante, '30%'), f('Data de Nascimento', fmt(d.data_nascimento), '30%'))}
      ${row(f('Empresa / Instituição Concedente', d.empresa_nome, '70%'), f('CNPJ', d.empresa_cnpj, '30%'))}
      ${row(f('Endereço da Empresa', d.empresa_endereco, '100%'))}
      ${row(f('Setor de Estágio', d.empresa_setor, '50%'), f('Área de Atuação', d.area_atuacao, '50%'))}
      ${row(f('Supervisor do Estágio', d.nome_supervisor, '65%'), f('Cargo', d.cargo_supervisor, '35%'))}
      ${row(f('Docente Orientador (IFCE)', d.nome_orientador, '100%'))}
      ${row(f('Início do Estágio', fmt(d.inicio_estagio), '33%'), f('Término do Estágio', fmt(d.fim_estagio), '33%'), f('C.H. Semanal', (d.horas_semanais || '') + ' h', '34%'))}
      ${row(f('Valor da Bolsa (R$)', d.valor_bolsa, '50%'), f('Auxílio Transporte (R$)', d.valor_transporte, '50%'))}
    </table>
    ${sigs('Supervisor do Estágio', 'Discente Estagiário', 'Coordenador de Estágios')}`
  )
}

// 5. Termo Aditivo
export function buildAdditiveTermHTML(d: Record<string, string>): string {
  return wrap(
    'Termo Aditivo ao Contrato de Estágio',
    `
    <table>
      ${row(f('Nome do Discente', d.nome_estudante, '100%'))}
      ${row(f('Curso', d.curso_estudante, '70%'), f('Matrícula', d.matricula_estudante, '30%'))}
      ${row(f('Empresa / Instituição Concedente', d.empresa_nome, '100%'))}
      ${row(f('Motivo do Aditivo', d.motivo_aditivo, '100%'))}
      ${row(f('Nova Data de Término', fmt(d.nova_data_fim), '40%'), f('Nova C.H. Semanal', (d.nova_carga_horaria || '') + ' h', '30%'), f('', '', '30%'))}
      ${row(f('Novo Valor da Bolsa (R$)', d.novo_valor_bolsa, '50%'), f('Novo Aux. Transporte (R$)', d.novo_valor_transporte, '50%'))}
    </table>
    ${sec('Justificativa', d.justificativa)}
    ${sigs('Supervisor do Estágio', 'Discente Estagiário', 'Coordenador de Estágios')}`
  )
}

// 6. Declaração de Extensão / Prorrogação
export function buildExtensionDeclarationHTML(d: Record<string, string>): string {
  return wrap(
    'Declaração de Prorrogação de Estágio',
    `
    <table>
      ${row(f('Nome do Discente', d.nome_estudante, '100%'))}
      ${row(f('Curso', d.curso_estudante, '70%'), f('Matrícula', d.matricula_estudante, '30%'))}
      ${row(f('Empresa / Instituição Concedente', d.nome_empresa, '100%'))}
      ${row(f('Data Término Atual', fmt(d.data_final_atual), '50%'), f('Nova Data de Término', fmt(d.nova_data_final), '50%'))}
    </table>
    <br/>
    <p class="para">
      A empresa <strong>${d.nome_empresa}</strong> declara para os devidos fins que o estágio do(a) discente 
      <strong>${d.nome_estudante}</strong> será prorrogado até a data de <strong>${fmt(d.nova_data_final)}</strong>.
    </p>
    <p class="para right">${d.cidade || 'Maracanaú'} — CE, ${fmt(new Date().toISOString().slice(0, 10))}</p>
    ${sigs('Representante da Empresa', 'Discente Estagiário', 'Coordenador de Estágios')}`
  )
}

// 7. Declaração Profissional
export function buildProfessionalDeclarationHTML(d: Record<string, string>): string {
  return wrap(
    'Declaração de Estágio',
    `
    <br/>
    <p class="para">
      Declaramos que <strong>${d.nome_estudante || '________________________________'}</strong>,
      matriculado(a) no curso de <strong>${d.curso_estudante || '________________________________'}</strong>
      sob o número de matrícula <strong>${d.matricula_estudante || '__________'}</strong>,
      realizou estágio supervisionado nesta instituição no período de
      <strong>${fmt(d.inicio_estagio)}</strong> a <strong>${fmt(d.fim_estagio)}</strong>,
      totalizando <strong>${d.horas_total || '____'} horas</strong>.
    </p>
    <p class="para">
      O(A) estagiário(a) desempenhou suas atividades no setor de
      <strong>${d.setor || '________________________________'}</strong>,
      sob supervisão de <strong>${d.nome_supervisor || '________________________________'}</strong>.
    </p>
    <p class="para">Por ser expressão da verdade, firmamos a presente declaração.</p>
    <p class="para right">Maracanaú — CE, ${d.data_declaracao || fmt(new Date().toISOString().slice(0, 10))}</p>
    <br/>
    ${sigs('Supervisor do Estágio', 'Coordenador de Estágios IFCE')}`
  )
}

// 8. Solicitação de Matrícula em Estágio
export function buildInternshipRegistrationHTML(d: Record<string, string>): string {
  return wrap(
    'Solicitação de Matrícula em Estágio Curricular',
    `
    <table>
      ${row(f('Nome do Discente', d.nome_estudante, '100%'))}
      ${row(f('Curso', d.curso_estudante, '70%'), f('Matrícula', d.matricula_estudante, '30%'))}
      ${row(f('CPF', d.cpf_estudante, '40%'), f('E-mail', d.email_estudante, '60%'))}
      ${row(f('Telefone', d.telefone_estudante, '40%'), f('Semestre Atual', d.semestre_atual, '30%'), f('Turno', d.turno, '30%'))}
      ${row(f('Empresa / Instituição Concedente', d.empresa_nome, '100%'))}
      ${row(f('Endereço da Empresa', d.empresa_endereco, '70%'), f('Cidade', d.empresa_cidade, '30%'))}
      ${row(f('Início Pretendido', fmt(d.inicio_estagio), '33%'), f('Fim Pretendido', fmt(d.fim_estagio), '33%'), f('C.H. Semanal', (d.horas_semanais || '') + ' h', '34%'))}
    </table>
    ${sigs('Discente', 'Coordenador de Estágios')}`
  )
}

// 9. Requerimento de Estágio
export function buildInternshipRegistrationRequestHTML(d: Record<string, string>): string {
  return wrap(
    'Requerimento de Estágio Supervisionado',
    `
    <table>
      ${row(f('Nome do Discente', d.nome_estudante, '100%'))}
      ${row(f('Curso', d.curso_estudante, '70%'), f('Matrícula', d.matricula_estudante, '30%'))}
      ${row(f('CPF', d.cpf_estudante, '45%'), f('Telefone', d.telefone_estudante, '55%'))}
      ${row(f('Empresa / Instituição Concedente', d.empresa_nome, '100%'))}
      ${row(f('Supervisor do Estágio', d.nome_supervisor, '65%'), f('Cargo', d.cargo_supervisor, '35%'))}
      ${row(f('Início', fmt(d.inicio_estagio), '33%'), f('Término', fmt(d.fim_estagio), '33%'), f('C.H. Semanal', (d.horas_semanais || '') + ' h', '34%'))}
      ${row(f('Valor da Bolsa (R$)', d.valor_bolsa, '50%'), f('Aux. Transporte (R$)', d.valor_transporte, '50%'))}
    </table>
    ${sec('Atividades Previstas', d.atividades_previstas)}
    ${sigs('Discente', 'Supervisor do Estágio', 'Coordenador de Estágios')}`
  )
}

// 10. Termo de Realização
export function buildRealizationTermHTML(d: Record<string, string>): string {
  return wrap(
    'Termo de Realização de Estágio',
    `
    <table>
      ${row(f('Nome do Discente', d.nome_estudante, '100%'))}
      ${row(f('Curso', d.curso_estudante, '70%'), f('Matrícula', d.matricula_estudante, '30%'))}
      ${row(f('Empresa / Instituição Concedente', d.empresa_nome, '100%'))}
      ${row(f('Supervisor do Estágio', d.nome_supervisor, '100%'))}
      ${row(f('Início', fmt(d.inicio_estagio), '33%'), f('Término', fmt(d.fim_estagio), '33%'), f('C.H. Total', (d.horas_total || '') + ' h', '34%'))}
    </table>
    ${sec('Atividades Realizadas', d.atividades)}
    ${sigs('Supervisor do Estágio', 'Discente Estagiário')}`
  )
}

// 11. Termo de Rescisão
export function buildRescissionTermHTML(d: Record<string, string>): string {
  return wrap(
    'Termo de Rescisão de Estágio',
    `
    <table>
      ${row(f('Nome do Discente', d.nome_estudante, '100%'))}
      ${row(f('Curso', d.curso_estudante, '70%'), f('Matrícula', d.matricula_estudante, '30%'))}
      ${row(f('Empresa / Instituição Concedente', d.empresa_nome, '100%'))}
      ${row(f('Data de Início do Estágio', fmt(d.inicio_estagio), '50%'), f('Data da Rescisão', fmt(d.data_rescisao), '50%'))}
    </table>
    ${sec('Motivo da Rescisão', d.motivo_rescisao)}
    ${sigs('Supervisor do Estágio', 'Discente Estagiário', 'Coordenador de Estágios')}`
  )
}

// 12. Pedido de Equivalência
export function buildEquivalenceRequestHTML(d: Record<string, string>): string {
  return wrap(
    'Pedido de Aproveitamento / Equivalência de Estágio',
    `
    <table>
      ${row(f('Nome do Discente', d.nome_estudante, '100%'))}
      ${row(f('Curso', d.curso_estudante, '70%'), f('Matrícula', d.matricula_estudante, '30%'))}
      ${row(f('Empresa / Instituição', d.empresa_nome, '100%'))}
      ${row(f('Período Atividades', fmt(d.inicio_atividades) + ' a ' + fmt(d.fim_atividades), '70%'), f('C.H. Total', (d.total_hours || '') + ' h', '30%'))}
    </table>
    ${sec('Justificativa / Descrição das Atividades', d.justificativa)}
    ${sigs('Discente', 'Coordenador de Estágios')}`
  )
}

// 13. Avaliação do Estudante
export function buildStudentEvaluationHTML(d: Record<string, any>): string {
  return wrap(
    'Ficha de Avaliação do Estagiário',
    `
    <table>
      ${row(f('Nome do Discente', d.nome_estudante, '100%'))}
      ${row(f('Curso', d.curso_estudante, '70%'), f('Matrícula', d.matricula_estudante, '30%'))}
      ${row(f('Empresa / Instituição', d.empresa_nome, '100%'))}
      ${row(f('Supervisor Avaliador', d.nome_supervisor, '70%'), f('Cargo', d.cargo_supervisor, '30%'))}
      ${row(f('Período Avaliado', fmt(d.inicio_periodo) + ' a ' + fmt(d.fim_periodo), '100%'))}
    </table>
    ${sec('1. Pontualidade e Assiduidade', d.avaliacao_pontualidade)}
    ${sec('2. Postura Profissional', d.avaliacao_postura)}
    ${sec('3. Conhecimento Técnico', d.avaliacao_tecnico)}
    ${sec('4. Relacionamento Interpessoal', d.avaliacao_relacionamento)}
    ${sec('5. Considerações Gerais', d.consideracoes)}
    ${sigs('Supervisor Avaliador', 'Coordenador de Estágios')}`
  )
}

// generateHTMLPDF é exportado da engine unificada (pdf-engine.ts)
