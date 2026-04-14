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

// ─── CSS PADRÃO IFCE (baseado no formulário oficial) ────────────────────────
const CSS = `
  @page { margin: 10mm 12mm 12mm 12mm; size: A4 portrait; }
  html, body { margin:0; padding:0; background:#fff; }
  * { box-sizing:border-box; font-family:Arial,Helvetica,sans-serif; font-size:8px; color:#000; }
  body { padding:8px 10px 10px 10px; background:#fff; }

  .page {
    width:100%;
    background:#fff;
  }

  /* ── Cabeçalho institucional ── */
  .hdr {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:8px;
    margin-bottom:6px;
  }
  .hdr-logo { width:54px; height:54px; object-fit:contain; flex-shrink:0; }
  .hdr-txt {
    flex:1;
    text-align:center;
    line-height:1.2;
    padding:0 4px;
  }
  .hdr-txt .pro-reitoria,
  .hdr-txt .coordenacao,
  .hdr-txt .campus-line,
  .hdr-txt .setor-line {
    text-transform:uppercase;
    color:#000;
  }
  .hdr-txt .pro-reitoria { font-size:9px; font-weight:bold; }
  .hdr-txt .coordenacao { font-size:8px; }
  .hdr-txt .campus-line { font-size:9px; font-weight:bold; margin-top:2px; }
  .hdr-txt .setor-line { font-size:8px; }
  hr.hdr-line { border:none; border-top:1px solid #000; margin:4px 0 6px 0; }

  /* ── Título do documento ── */
  .doc-title {
    text-align:center;
    font-size:11px;
    font-weight:bold;
    text-transform:uppercase;
    margin:2px 0 8px 0;
    letter-spacing:0.2px;
  }

  /* ── Tabelas e células ── */
  table { width:100%; border-collapse:collapse; table-layout:fixed; margin:0; }
  td, th { border:1px solid #000; padding:2px 3px; vertical-align:top; }
  th { background:#d9d9d9; font-size:6.5px; font-weight:bold; text-transform:uppercase; }
  .lbl {
    font-size:5.8px;
    font-weight:bold;
    text-transform:uppercase;
    display:block;
    line-height:1.05;
    margin-bottom:1px;
  }
  .val {
    font-size:8px;
    min-height:12px;
    display:block;
    line-height:1.2;
    word-break:break-word;
  }

  /* ── Opções e marcações ── */
  .chk-group {
    display:flex;
    flex-direction:column;
    gap:1px;
    font-size:6.8px;
    line-height:1.2;
    padding:1px 0;
  }
  .chk-item { display:flex; align-items:flex-start; gap:3px; }
  .chk-box {
    width:8px;
    height:8px;
    border:1px solid #000;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
    font-size:7px;
    line-height:1;
  }

  /* ── Seções ── */
  .sec-bar {
    background:#d9d9d9;
    border:1px solid #000;
    border-bottom:none;
    padding:2px 4px;
    margin-top:4px;
    font-size:6.5px;
    font-weight:bold;
    text-transform:uppercase;
    line-height:1.1;
  }
  .sec-body {
    border:1px solid #000;
    padding:4px;
    min-height:42px;
    font-size:8px;
    line-height:1.35;
    white-space:pre-wrap;
    margin-bottom:4px;
    background:#fff;
  }

  .triple-box {
    display:grid;
    grid-template-columns:1fr 1fr 1.25fr;
    border:1px solid #000;
    margin-bottom:4px;
  }
  .triple-box-head {
    background:#d9d9d9;
    border-bottom:1px solid #000;
    font-size:6.3px;
    font-weight:bold;
    text-transform:uppercase;
    text-align:center;
    padding:2px 3px;
    line-height:1.1;
  }
  .triple-box-head:not(:last-child),
  .triple-box-body:not(:last-child) { border-right:1px solid #000; }
  .triple-box-body { padding:4px; }

  /* ── Assinaturas ── */
  .sig-date-row {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:0;
    margin-top:6px;
    border:1px solid #000;
    border-bottom:none;
  }
  .sig-date-box {
    padding:3px 6px;
    min-height:18px;
    font-size:7px;
    font-weight:bold;
    text-transform:uppercase;
    display:flex;
    align-items:center;
    gap:6px;
  }
  .sig-date-box + .sig-date-box { border-left:1px solid #000; }
  .sig-date-label { font-size:7px; font-weight:bold; display:inline; }
  .sig-date-val {
    flex:1;
    display:inline-block;
    text-align:center;
    letter-spacing:0.5px;
    min-height:10px;
  }
  .sigs {
    display:grid;
    grid-template-columns:repeat(var(--sig-cols, 2), 1fr);
    border:1px solid #000;
    min-height:62px;
  }
  .sig {
    text-align:center;
    padding:24px 6px 6px 6px;
    display:flex;
    align-items:flex-end;
    justify-content:center;
  }
  .sig + .sig { border-left:1px solid #000; }
  .sig-line {
    border-top:1px solid #000;
    padding-top:3px;
    width:100%;
    font-size:6.5px;
    font-weight:bold;
    text-transform:uppercase;
  }

  /* ── Observação e texto corrido ── */
  .obs {
    font-size:6.8px;
    margin-top:5px;
    line-height:1.3;
  }
  .obs strong { font-size:6.8px; }
  .para { font-size:8px; text-align:justify; line-height:1.4; margin:4px 0; }
  .bold { font-weight:bold; }
  .right { text-align:right; }
`

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function hdr(): string {
  return `
  <div class="hdr">
    <img src="${LOGO_IFCE_BASE64}" class="hdr-logo" alt="Logo IFCE"/>
    <div class="hdr-txt">
      <div class="pro-reitoria">Pró-Reitoria de Extensão</div>
      <div class="coordenacao">Coordenação de Estágios e Acompanhamento de Egressos</div>
      <div class="campus-line">IFCE Campus Maracanaú</div>
      <div class="setor-line">Setor de Acompanhamento de Estágio</div>
    </div>
    <img src="${BRASAO_BASE64}" class="hdr-logo" alt="Brasão República"/>
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

/**
 * Área de assinaturas com data padrão IFCE:
 * "SOLICITAÇÃO EM ___/___ / _____   AUTORIZAÇÃO EM ___/___ / _____"
 * seguida das linhas de assinaturas
 */
function sigs(...labels: string[]): string {
  return `
  <div class="sigs" style="--sig-cols:${labels.length}">
    ${labels.map((l) => `<div class="sig"><div class="sig-line">${l}</div></div>`).join('')}
  </div>`
}

/**
 * Bloco de datas de solicitação/autorização com assinaturas abaixo
 * (padrão do formulário oficial IFCE)
 */
function sigBlock(sigLabels: string[], obs?: string): string {
  const datesRow = `
  <div class="sig-date-row">
    <div class="sig-date-box">
      <span class="sig-date-label">SOLICITAÇÃO EM</span>
      <span class="sig-date-val">____/____/______</span>
    </div>
    <div class="sig-date-box">
      <span class="sig-date-label">AUTORIZAÇÃO EM</span>
      <span class="sig-date-val">____/____/______</span>
    </div>
  </div>`
  const lines = sigs(...sigLabels)
  const note = obs ? `<p class="obs"><strong>Observação:</strong> ${obs}</p>` : ''
  return datesRow + lines + note
}

function wrap(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="pt-BR">
  <head><meta charset="UTF-8"><style>${CSS}</style></head>
  <body><div class="page">${hdr()}<div class="doc-title">${title}</div>${body}</div></body></html>`
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILDERS DE CADA DOCUMENTO
// ═══════════════════════════════════════════════════════════════════════════════

// 1. Relatório Mensal - Modelo IFCE
export function buildMonthlyReportHTML(d: Record<string, string>): string {
  return wrap(
    'RELATÓRIO MENSAL DE ATIVIDADES',
    `
  <table>
    <tbody>
      ${row(f('Nome', d.nome_estudante, '50%'), f('Matrícula', d.matricula_estudante, '20%'), f('Curso', d.curso_estudante, '30%'))}
      ${row(f('Empresa', d.empresa_nome, '40%'), f('CNPJ', d.empresa_cnpj, '20%'), f('Período', d.periodo_referencia || `${fmt(d.inicio_periodo || '')} a ${fmt(d.fim_periodo || '')}`, '40%'))}
      ${row(f('Supervisor', d.nome_supervisor, '40%'), f('Cargo', d.cargo_supervisor, '30%'), f('C.H. Mensal', d.horas_mes ? `${d.horas_mes} h` : '', '30%'))}
      ${row(f('Docente Orientador', d.nome_orientador || ''))}
    </tbody>
  </table>

  ${sec('1. PRINCIPAIS ATIVIDADES DESENVOLVIDAS', d.atividades || '')}
  ${sec('2. DIFICULDADES ENCONTRADAS', d.dificuldades || '')}
  ${sec('3. SOLUÇÕES ADOTADAS', d.solucoes || '')}

  ${sigBlock(['Supervisor do Estágio', 'Discente Estagiário'], 'Relatório referente ao período de estágio supervisionado.')}
`
  )
}

// 2. Relatório Final - Modelo IFCE
export function buildFinalReportHTML(d: Record<string, string>): string {
  return wrap(
    'RELATÓRIO FINAL DE ESTÁGIO',
    `
  <table>
    <tbody>
      ${row(f('Nome', d.nome_estudante, '50%'), f('Matrícula', d.matricula_estudante, '20%'), f('Curso', d.curso_estudante, '30%'))}
      ${row(f('Empresa', d.empresa_nome, '40%'), f('CNPJ', d.empresa_cnpj, '20%'), f('Setor', d.setor_supervisor || '', '40%'))}
      ${row(f('Supervisor', d.nome_supervisor, '40%'), f('Cargo', d.cargo_supervisor, '30%'), f('C.H. Total', d.horas_total ? `${d.horas_total} h` : '', '30%'))}
      ${row(f('Período', `${fmt(d.inicio_estagio || '')} a ${fmt(d.fim_estagio || '')}`))}
      ${row(f('Docente Orientador', d.nome_orientador || ''))}
    </tbody>
  </table>

  ${sec('1. RESUMO DAS ATIVIDADES DESENVOLVIDAS', d.atividades || d.atividades_desenvolvidas || '')}
  ${sec('2. COMPETÊNCIAS ADQUIRIDAS', d.competencias || d.aprendizados || '')}
  ${sec('3. AVALIAÇÃO DO ESTÁGIO', d.avaliacao || d.avaliacao_geral || '')}
  ${sec('4. CONCLUSÃO', d.conclusao || d.contribuicoes || '')}

  ${sigBlock(['Supervisor do Estágio', 'Discente Estagiário', 'Docente Orientador'], 'Relatório final do estágio supervisionado realizado.')}
`
  )
}

// 5. Termo Aditivo - Modelo IFCE
export function buildAdditiveTermHTML(d: Record<string, string>): string {
  return wrap(
    'TERMO ADITIVO AO CONTRATO DE ESTÁGIO',
    `
  <table>
    <tbody>
      ${row(f('Discente', d.nome_estudante, '40%'), f('Matrícula', d.matricula_estudante, '20%'), f('Curso', d.curso_estudante, '40%'))}
      ${row(f('Empresa', d.empresa_nome, '50%'), f('CNPJ', d.empresa_cnpj, '25%'), f('Telefone', d.empresa_telefone || '', '25%'))}
    </tbody>
  </table>

  <div class="sec-bar">ALTERAÇÕES CONTRATUAIS</div>
  <table>
    <tbody>
      ${row(f('Motivo do Aditivo', d.motivo_aditivo || d.justificativa || ''))}
      ${row(f('Nova Data de Término', fmt(d.nova_data_fim || d.novo_fim || '')), f('Nova C.H. Semanal', d.nova_carga_horaria ? `${d.nova_carga_horaria} h` : ''), f('Período Prorrogação', d.prazo_prorrogacao || ''))}
      ${row(f('Novo Valor Bolsa (R$)', d.novo_valor_bolsa || ''), f('Novo Aux. Transporte (R$)', d.novo_valor_transporte || ''))}
    </tbody>
  </table>

  ${sec('JUSTIFICATIVA', d.justificativa || '')}

  ${sigBlock(['Supervisor do Estágio', 'Discente Estagiário', 'Coordenador de Estágios'], 'As demais cláusulas do Termo de Compromisso permanecem inalteradas.')}
`
  )
}

// 12. Pedido de Equivalência - Modelo IFCE
export function buildEquivalenceRequestHTML(d: Record<string, string>): string {
  return wrap(
    'PEDIDO DE APROVEITAMENTO / EQUIVALÊNCIA DE ESTÁGIO',
    `
  <table>
    <tbody>
      ${row(f('Nome', d.nome_estudante, '50%'), f('Matrícula', d.matricula_estudante, '20%'), f('CPF', d.cpf_estudante, '30%'))}
      ${row(f('Curso', d.curso_estudante, '40%'), f('Período', d.periodo_curso || d.semestre_atual || '', '30%'), f('C.H. Total', d.total_hours ? `${d.total_hours} h` : '', '30%'))}
    </tbody>
  </table>

  <table>
    <tbody>
      ${row(f('Empresa / Instituição', d.empresa_nome, '50%'), f('CNPJ', d.empresa_cnpj, '25%'), f('Período', `${fmt(d.inicio_atividades || '')} a ${fmt(d.fim_atividades || '')}`, '25%'))}
    </tbody>
  </table>

  ${sec('JUSTIFICATIVA / DESCRIÇÃO DAS ATIVIDADES', d.justificativa || '')}

  ${sigBlock(['Discente', 'Coordenador de Estágios'], 'Solicito o aproveitamento/equivalência das atividades descritas acima.')}
`
  )
}

// Funções adicionais para compatibilidade com testes
export function buildSemesterReportHTML(d: Record<string, string>): string {
  return wrap(
    'RELATÓRIO SEMESTRAL DE ESTÁGIO',
    `
  <table>
    <tbody>
      ${row(f('Nome', d.nome_estudante, '50%'), f('Matrícula', d.matricula_estudante, '20%'), f('Curso', d.curso_estudante, '30%'))}
      ${row(f('Empresa', d.empresa_nome, '40%'), f('Supervisor', d.nome_supervisor, '30%'), f('C.H. Semestral', d.horas_semestre ? `${d.horas_semestre} h` : '', '30%'))}
      ${row(f('Período', `${fmt(d.inicio_periodo || '')} a ${fmt(d.fim_periodo || '')}`), f('Docente Orientador', d.nome_orientador || ''))}
    </tbody>
  </table>

  ${sec('1. ATIVIDADES DESENVOLVIDAS NO SEMESTRE', d.atividades || '')}
  ${sec('2. DIFICULDADES E SOLUÇÕES', d.dificuldades || '')}
  ${sec('3. RESULTADOS ALCANÇADOS', d.resultados || '')}

  ${sigBlock(['Supervisor do Estágio', 'Discente Estagiário'], 'Relatório semestral de acompanhamento de estágio.')}
`
  )
}

export function buildExtensionDeclarationHTML(d: Record<string, string>): string {
  return wrap(
    'DECLARAÇÃO DE PRORROGAÇÃO DE ESTÁGIO',
    `
  <table>
    <tbody>
      ${row(f('Discente', d.nome_estudante, '40%'), f('Matrícula', d.matricula_estudante, '20%'), f('Curso', d.curso_estudante, '40%'))}
      ${row(f('Empresa', d.nome_empresa || d.empresa_nome, '50%'), f('CNPJ', d.empresa_cnpj || '', '25%'), f('Data Término Atual', fmt(d.data_final_atual || ''), '25%'))}
      ${row(f('Nova Data de Término', fmt(d.nova_data_final || '')))}
    </tbody>
  </table>

  <div class="para">
    A empresa <strong>${d.nome_empresa || d.empresa_nome || ''}</strong> declara para os devidos fins que o estágio do(a)
    discente <strong>${d.nome_estudante || ''}</strong>, matrícula ${d.matricula_estudante || ''}, do curso
    ${d.curso_estudante || ''}, será prorrogado até a data de <strong>${fmt(d.nova_data_final || '')}</strong>.
  </div>

  ${sigBlock(['Representante da Empresa', 'Discente Estagiário', 'Coordenador de Estágios'], 'Declaração válida para fins de comprovação de prorrogação de estágio.')}
`
  )
}

export function buildProfessionalDeclarationHTML(d: Record<string, string>): string {
  return wrap(
    'DECLARAÇÃO DE ESTÁGIO',
    `
  <table>
    <tbody>
      ${row(f('Discente', d.nome_estudante, '40%'), f('Matrícula', d.matricula_estudante, '20%'), f('Curso', d.curso_estudante, '40%'))}
      ${row(f('Período', `${fmt(d.inicio_estagio || '')} a ${fmt(d.fim_estagio || '')}`, '30%'), f('C.H. Total', d.horas_total ? `${d.horas_total} h` : '', '20%'), f('Setor', d.setor || '', '50%'))}
      ${row(f('Supervisor', d.nome_supervisor, '40%'), f('Cargo', d.cargo_supervisor || '', '30%'), f('Empresa', d.empresa_nome || '', '30%'))}
    </tbody>
  </table>

  <div class="para">
    Declaramos que <strong>${d.nome_estudante || ''}</strong>, matriculado(a) no curso de
    <strong>${d.curso_estudante || ''}</strong> sob o número de matrícula ${d.matricula_estudante || ''},
    realizou estágio supervisionado nesta instituição no período de ${fmt(d.inicio_estagio || '')} a
    ${fmt(d.fim_estagio || '')}, totalizando <strong>${d.horas_total || ''} horas</strong>.
  </div>

  ${sigBlock(['Supervisor do Estágio', 'Coordenador de Estágios IFCE'], 'Declaração emitida para fins de comprovação de atividades de estágio.')}
`
  )
}

export function buildInternshipRegistrationHTML(d: Record<string, any>): string {
  // Helper para checkbox estilizada IFCE
  function chk(label: string, checked = false): string {
    return `<span class="chk-item"><span class="chk-box">${checked ? '✕' : ''}</span>${label}</span>`
  }

  // Mapear cor/raça
  const corRacaMap: Record<string, boolean> = {
    amarelo: d.cor_raca === 'amarelo',
    branco: d.cor_raca === 'branco',
    indigena: d.cor_raca === 'indigena',
    pardo: d.cor_raca === 'pardo',
    preto: d.cor_raca === 'preto',
    nao_declara: d.cor_raca === 'nao_declarar' || !d.cor_raca,
  }

  // Mapear etnia
  const etniaMap: Record<string, boolean> = {
    indigena: d.etnia === 'indigena',
    quilombola: d.etnia === 'quilombola',
    outra: d.etnia === 'outra',
    nao_declara: d.etnia === 'nao_declarar' || !d.etnia,
  }

  // Mapear deficiências
  const defMap: Record<string, boolean> = {
    alta_habilidade: d.def_alta_habilidade === 'true' || d.def_alta_habilidade === true,
    auditiva: d.def_auditiva === 'true' || d.def_auditiva === true,
    intelectual: d.def_intelectual === 'true' || d.def_intelectual === true,
    motora: d.def_motora === 'true' || d.def_motora === true,
    visual_baixa: d.def_visual_baixa === 'true' || d.def_visual_baixa === true,
    visual: d.def_visual === 'true' || d.def_visual === true,
    surdocegueira: d.def_surdocegueira === 'true' || d.def_surdocegueira === true,
    nenhuma:
      !d.def_alta_habilidade &&
      !d.def_auditiva &&
      !d.def_intelectual &&
      !d.def_motora &&
      !d.def_visual_baixa &&
      !d.def_visual &&
      !d.def_surdocegueira,
  }

  return wrap(
    'SOLICITAÇÃO DE MATRÍCULA EM ESTÁGIO CURRICULAR',
    `
  <table>
    <tbody>
      ${row(f('Nome', d.nome_estudante, '50%'), f('Matrícula', d.matricula_estudante, '20%'), f('CPF', d.cpf_estudante, '30%'))}
      ${row(f('Curso', d.curso_estudante, '40%'), f('Semestre Atual', d.semestre_atual, '20%'), f('Turno', d.turno, '40%'))}
      ${row(f('Endereço', d.endereco, '40%'), f('Bairro', d.bairro, '25%'), f('Município-UF', d.municipio_uf, '35%'))}
      ${row(f('CEP', d.cep), f('Telefone', d.telefone_estudante), f('E-mail', d.email_estudante))}
      ${row(f('Nome Social', d.nome_social || 'N/A'))}
    </tbody>
  </table>

  <div class="sec-bar">COR / RAÇA</div>
  <div class="sec-body">
    <div class="chk-group" style="flex-direction:row;flex-wrap:wrap;gap:4px 12px;">
      ${chk('( ) Amarelo(a)', corRacaMap.amarelo)}
      ${chk('( ) Branco(a)', corRacaMap.branco)}
      ${chk('( ) Indígena', corRacaMap.indigena)}
      ${chk('( ) Pardo(a)', corRacaMap.pardo)}
      ${chk('( ) Preto(a)', corRacaMap.preto)}
      ${chk('( ) Prefiro não declarar', corRacaMap.nao_declara)}
    </div>
  </div>

  <div class="sec-bar">ETNIA</div>
  <div class="sec-body">
    <div class="chk-group" style="flex-direction:row;flex-wrap:wrap;gap:4px 12px;">
      ${chk('( ) Indígena', etniaMap.indigena)}
      ${chk('( ) Quilombola', etniaMap.quilombola)}
      ${chk('( ) Outra', etniaMap.outra)}
      ${chk('( ) Prefiro não declarar', etniaMap.nao_declara)}
    </div>
    ${d.etnia_outra ? `<div style="margin-top:4px;font-size:7px;">Outra: ${d.etnia_outra}</div>` : ''}
    ${d.comunidade_etnia ? `<div style="margin-top:2px;font-size:7px;">Comunidade: ${d.comunidade_etnia}</div>` : ''}
  </div>

  <div class="sec-bar">PESSOA COM DEFICIÊNCIA (Se houver)</div>
  <div class="sec-body">
    <div class="chk-group" style="flex-direction:row;flex-wrap:wrap;gap:4px 10px;">
      ${chk('Alta habilidade/superdotação', defMap.alta_habilidade)}
      ${chk('Deficiência auditiva', defMap.auditiva)}
      ${chk('Deficiência intelectual', defMap.intelectual)}
      ${chk('Deficiência motora', defMap.motora)}
      ${chk('Def. visual/baixa visão', defMap.visual_baixa)}
      ${chk('Deficiência visual', defMap.visual)}
      ${chk('Surdocegueira', defMap.surdocegueira)}
      ${chk('Nenhuma', defMap.nenhuma)}
    </div>
  </div>

  <div class="sec-bar">DADOS DA EMPRESA CONCEDENTE</div>
  <table>
    <tbody>
      ${row(f('Razão Social', d.empresa_nome, '50%'), f('CNPJ', d.empresa_cnpj, '25%'), f('Telefone', d.empresa_telefone || '', '25%'))}
      ${row(f('Endereço', d.empresa_endereco, '50%'), f('Cidade', d.empresa_cidade || '', '25%'), f('UF', d.empresa_uf || '', '25%'))}
    </tbody>
  </table>

  <div class="sec-bar">SUPERVISOR DO ESTÁGIO</div>
  <table>
    <tbody>
      ${row(f('Nome', d.nome_supervisor, '40%'), f('Cargo', d.cargo_supervisor, '30%'), f('E-mail', d.email_supervisor || '', '30%'))}
    </tbody>
  </table>

  <div class="sec-bar">INFORMAÇÕES DO ESTÁGIO</div>
  <table>
    <tbody>
      ${row(
      f(
        'Tipo',
        d.tipo_estagio === 'Obrigatório'
          ? '(X) Obrigatório ( ) Não Obrigatório'
          : '( ) Obrigatório (X) Não Obrigatório',
        '30%'
      ),
      f('Data Início', fmt(d.data_inicio), '25%'),
      f('Data Fim', fmt(d.data_fim), '25%'),
      f('C.H. Semanal', d.carga_horaria ? `${d.carga_horaria} h` : '', '20%')
    )}
    </tbody>
  </table>

  ${sigBlock(['Discente', 'Coordenador(a) de Estágios'], 'Declaro que as informações acima são verdadeiras e me comprometo a atualizá-las quando necessário.')}
`
  )
}

export function buildRealizationTermHTML(d: Record<string, string>): string {
  return wrap(
    'TERMO DE REALIZAÇÃO DE ESTÁGIO',
    `
  <table>
    <tbody>
      ${row(f('Discente', d.nome_estudante, '40%'), f('Matrícula', d.matricula_estudante, '20%'), f('Curso', d.curso_estudante, '40%'))}
      ${row(f('Empresa', d.empresa_nome, '40%'), f('Supervisor', d.nome_supervisor, '30%'), f('Cargo', d.cargo_supervisor || '', '30%'))}
      ${row(f('Período', `${fmt(d.inicio_estagio || '')} a ${fmt(d.fim_estagio || '')}`, '40%'), f('C.H. Total', d.horas_total ? `${d.horas_total} h` : '', '30%'), f('C.H. Semanal', d.horas_semanais ? `${d.horas_semanais} h` : '', '30%'))}
    </tbody>
  </table>

  ${sec('ATIVIDADES REALIZADAS', d.atividades || '')}

  ${sigBlock(['Supervisor do Estágio', 'Discente Estagiário'], 'Termo que atesta a realização das atividades de estágio descritas.')}
`
  )
}

export function buildRescissionTermHTML(d: Record<string, string>): string {
  return wrap(
    'TERMO DE RESCISÃO DE ESTÁGIO',
    `
  <table>
    <tbody>
      ${row(f('Discente', d.nome_estudante, '40%'), f('Matrícula', d.matricula_estudante, '20%'), f('Curso', d.curso_estudante, '40%'))}
      ${row(f('Empresa', d.empresa_nome, '50%'), f('Data de Início', fmt(d.inicio_estagio || ''), '25%'), f('Data da Rescisão', fmt(d.data_rescisao || ''), '25%'))}
    </tbody>
  </table>

  ${sec('MOTIVO DA RESCISÃO', d.motivo_rescisao || '')}

  ${sigBlock(['Supervisor do Estágio', 'Discente Estagiário', 'Coordenador de Estágios'], 'Termo de rescisão do contrato de estágio.')}
`
  )
}

export function buildStudentEvaluationHTML(d: Record<string, any>): string {
  return wrap(
    'FICHA DE AVALIAÇÃO DO ESTAGIÁRIO',
    `
  <table>
    <tbody>
      ${row(f('Discente', d.nome_estudante, '40%'), f('Matrícula', d.matricula_estudante, '20%'), f('Curso', d.curso_estudante, '40%'))}
      ${row(f('Empresa', d.empresa_nome, '40%'), f('Supervisor', d.nome_supervisor, '30%'), f('Cargo', d.cargo_supervisor || '', '30%'))}
      ${row(f('Período Avaliado', `${fmt(d.inicio_periodo || '')} a ${fmt(d.fim_periodo || '')}`))}
    </tbody>
  </table>

  <table>
    <tbody>
      ${row(f('1. Pontualidade e Assiduidade', d.avaliacao_pontualidade || ''))}
      ${row(f('2. Postura Profissional', d.avaliacao_postura || ''))}
      ${row(f('3. Conhecimento Técnico', d.avaliacao_tecnico || ''))}
      ${row(f('4. Relacionamento Interpessoal', d.avaliacao_relacionamento || ''))}
    </tbody>
  </table>

  ${sec('5. CONSIDERAÇÕES GERAIS', d.consideracoes || d.consideracoes_finais || '')}

  ${sigBlock(['Supervisor Avaliador', 'Coordenador de Estágios'], 'Avaliação de desempenho do estagiário referente ao período informado.')}
`
  )
}

export function buildCommitmentTermHTML(d: Record<string, string>): string {
  return wrap(
    'TERMO DE COMPROMISSO DE ESTÁGIO',
    `
  <table>
    <tbody>
      ${row(f('Discente', d.nome_estudante, '40%'), f('Matrícula', d.matricula_estudante, '20%'), f('CPF', d.cpf_estudante, '20%'), f('Curso', d.curso_estudante, '20%'))}
      ${row(f('Empresa', d.empresa_nome, '40%'), f('CNPJ', d.empresa_cnpj, '20%'), f('Endereço', d.empresa_endereco || '', '40%'))}
    </tbody>
  </table>

  <div class="sec-bar">DETALHES DO ESTÁGIO</div>
  <table>
    <tbody>
      ${row(f('Início', fmt(d.inicio_estagio || '')), f('Término', fmt(d.fim_estagio || '')), f('C.H. Semanal', d.horas_semanais ? `${d.horas_semanais} h` : ''))}
      ${row(f('Modalidade', d.modalidade_estagio === 'remoto' ? '(X) Remoto ( ) Presencial' : '( ) Remoto (X) Presencial'), f('Valor Bolsa (R$)', d.valor_bolsa || ''), f('Aux. Transporte (R$)', d.valor_transporte || ''))}
    </tbody>
  </table>

  <div class="sec-bar">DOCENTE ORIENTADOR</div>
  <table>
    <tbody>
      ${row(f('Nome', d.nome_orientador || '', '50%'), f('Telefone', d.telefone_orientador || '', '25%'), f('E-mail', d.email_orientador || '', '25%'))}
    </tbody>
  </table>

  <div class="sec-bar">SUPERVISOR DO ESTÁGIO</div>
  <table>
    <tbody>
      ${row(f('Nome', d.nome_supervisor, '40%'), f('Cargo', d.cargo_supervisor, '30%'), f('Telefone', d.telefone_supervisor || '', '15%'), f('E-mail', d.email_supervisor || '', '15%'))}
    </tbody>
  </table>

  ${sec('PLANO DE ATIVIDADES', d.plano_atividades || '')}

  ${sigBlock(['Supervisor do Estágio', 'Discente Estagiário', 'Coordenador de Estágios'], 'Pelo presente Termo de Compromisso, as partes ajustam o estágio nas condições acima.')}
`
  )
}

export function buildInternshipRegistrationRequestHTML(d: Record<string, string>): string {
  // Helper para checkbox estilizada IFCE
  function chk(label: string, checked = false): string {
    return `<span class="chk-item"><span class="chk-box">${checked ? '✕' : ''}</span>${label}</span>`
  }

  // Mapear cor/raça
  const corRacaMap: Record<string, boolean> = {
    amarelo: d.cor_raca === 'amarelo',
    branco: d.cor_raca === 'branco',
    indigena: d.cor_raca === 'indigena',
    pardo: d.cor_raca === 'pardo',
    preto: d.cor_raca === 'preto',
    nao_declara: d.cor_raca === 'nao_declarar' || !d.cor_raca,
  }

  // Mapear etnia
  const etniaMap: Record<string, boolean> = {
    indigena: d.etnia === 'indigena',
    quilombola: d.etnia === 'quilombola',
    outra: d.etnia === 'outra',
    nao_declara: d.etnia === 'nao_declarar' || !d.etnia,
  }

  // Mapear deficiências
  const defMap: Record<string, boolean> = {
    alta_habilidade: d.deficiencia?.includes('alta_habilidade'),
    auditiva: d.deficiencia?.includes('auditiva'),
    intelectual: d.deficiencia?.includes('intelectual'),
    motora: d.deficiencia?.includes('motora'),
    visual_baixa: d.deficiencia?.includes('visual_baixa'),
    visual: d.deficiencia?.includes('visual'),
    surdocegueira: d.deficiencia?.includes('surdocegueira'),
    nenhuma: !d.deficiencia || d.deficiencia.length === 0,
  }

  // Montar grid de horários
  const diasSemana = [
    { key: 'segunda', label: 'SEGUNDA' },
    { key: 'terca', label: 'TERÇA' },
    { key: 'quarta', label: 'QUARTA' },
    { key: 'quinta', label: 'QUINTA' },
    { key: 'sexta', label: 'SEXTA' },
    { key: 'sabado', label: 'SÁBADO' },
    { key: 'domingo', label: 'DOMINGO' },
  ]

  const horarioRows = diasSemana
    .map(
      (dia) => `
  <tr>
    <td style="font-size:7px;font-weight:bold;">${dia.label}</td>
    <td>${d[`horario_${dia.key}_inicio`] || ''}</td>
    <td>${d[`horario_${dia.key}_fim`] || ''}</td>
  </tr>`
    )
    .join('')

  // Montar turnos - espera dados no formato turnos_primeira_segunda, etc.
  const turnosPrimeira = diasSemana
    .map(
      (dia) => `
    <td>${d[`turnos_primeira_${dia.key}`] === 'sim' || d[`turnos_primeira_${dia.key}`] ? '✕' : ''}</td>`
    )
    .join('')

  const turnosSegunda = diasSemana
    .map(
      (dia) => `
    <td>${d[`turnos_segunda_${dia.key}`] === 'sim' || d[`turnos_segunda_${dia.key}`] ? '✕' : ''}</td>`
    )
    .join('')

  const turnosTerceira = diasSemana
    .map(
      (dia) => `
    <td>${d[`turnos_terceira_${dia.key}`] === 'sim' || d[`turnos_terceira_${dia.key}`] ? '✕' : ''}</td>`
    )
    .join('')

  return wrap(
    'SOLICITAÇÃO DE CADASTRO NO ESTÁGIO',
    `
  <table>
    <tbody>
      ${row(f('Nome', d.nome_estudante, '60%'), f('Matrícula', d.matricula_estudante, '15%'), f('CPF', d.cpf_estudante, '25%'))}
      ${row(f('Curso', d.curso_estudante), f('Nome Social', d.nome_social, '50%'))}
      ${row(f('Endereço', d.endereco, '50%'), f('Bairro', d.bairro, '25%'), f('Município-UF', d.municipio_uf, '25%'))}
      ${row(f('CEP', d.cep), f('Telefone', d.telefone_estudante), f('E-mail Institucional', d.email_institucional))}
      ${row(f('E-mail Pessoal', d.email_pessoal))}
    </tbody>
  </table>

  <div class="sec-bar">COR / RAÇA</div>
  <div class="sec-body">
    <div class="chk-group" style="flex-direction:row;flex-wrap:wrap;gap:4px 12px;">
      ${chk('( ) Amarelo(a)', corRacaMap.amarelo)}
      ${chk('( ) Branco(a)', corRacaMap.branco)}
      ${chk('( ) Indígena', corRacaMap.indigena)}
      ${chk('( ) Pardo(a)', corRacaMap.pardo)}
      ${chk('( ) Preto(a)', corRacaMap.preto)}
      ${chk('( ) Prefiro não declarar', corRacaMap.nao_declara)}
    </div>
  </div>

  <div class="sec-bar">ETNIA</div>
  <div class="sec-body">
    <div class="chk-group" style="flex-direction:row;flex-wrap:wrap;gap:4px 12px;">
      ${chk('( ) Indígena', etniaMap.indigena)}
      ${chk('( ) Quilombola', etniaMap.quilombola)}
      ${chk('( ) Outra', etniaMap.outra)}
      ${chk('( ) Prefiro não declarar', etniaMap.nao_declara)}
    </div>
    ${d.etnia_outra ? `<div style="margin-top:4px;font-size:7px;">Outra: ${d.etnia_outra}</div>` : ''}
    ${d.comunidade_etnia ? `<div style="margin-top:2px;font-size:7px;">Comunidade: ${d.comunidade_etnia}</div>` : ''}
  </div>

  <div class="sec-bar">PESSOA COM DEFICIÊNCIA (Se houver)</div>
  <div class="sec-body">
    <div class="chk-group" style="flex-direction:row;flex-wrap:wrap;gap:4px 10px;">
      ${chk('Alta habilidade/superdotação', defMap.alta_habilidade)}
      ${chk('Deficiência auditiva', defMap.auditiva)}
      ${chk('Deficiência intelectual', defMap.intelectual)}
      ${chk('Deficiência motora', defMap.motora)}
      ${chk('Def. visual/baixa visão', defMap.visual_baixa)}
      ${chk('Deficiência visual', defMap.visual)}
      ${chk('Surdocegueira', defMap.surdocegueira)}
      ${chk('Nenhuma', defMap.nenhuma)}
    </div>
  </div>

  <div class="sec-bar">UNIDADE CONCEDENTE / EMPRESA</div>
  <table>
    <tbody>
      ${row(f('Nome Fantasia / Razão Social', d.empresa_nome, '50%'), f('CNPJ / Registro Conselho', d.empresa_cnpj, '25%'), f('Telefone', d.empresa_telefone || '', '25%'))}
      ${row(f('Endereço', d.empresa_endereco, '40%'), f('Bairro', d.empresa_bairro, '20%'), f('Município-UF', d.empresa_municipio_uf, '20%'), f('CEP', d.empresa_cep, '20%'))}
      ${row(f('E-mail', d.empresa_email || ''))}
    </tbody>
  </table>

  <div class="sec-bar">RESPONSÁVEL LEGAL DA UNIDADE CONCEDENTE</div>
  <table>
    <tbody>
      ${row(f('Nome', d.responsavel_legal, '50%'), f('Cargo / Qualificação', d.cargo_responsavel, '25%'), f('CPF', d.cpf_responsavel, '25%'))}
      ${row(f('Telefone', d.telefone_responsavel || ''))}
    </tbody>
  </table>

  <div class="sec-bar">SUPERVISOR DO ESTÁGIO NA UNIDADE CONCEDENTE</div>
  <table>
    <tbody>
      ${row(f('Nome', d.nome_supervisor, '40%'), f('Cargo', d.cargo_supervisor, '30%'), f('Setor de Realização', d.setor_supervisor || d.setor_realizacao || '', '30%'))}
    </tbody>
  </table>

  <div class="sec-bar">INFORMAÇÕES DO ESTÁGIO</div>
  <table>
    <tbody>
      ${row(
      f(
        'Tipo de Estágio',
        d.tipo_estagio === 'Obrigatório'
          ? '(X) Obrigatório ( ) Não Obrigatório'
          : '( ) Obrigatório (X) Não Obrigatório',
        '40%'
      ),
      f(
        'Forma',
        d.forma_estagio === 'Presencial'
          ? '(X) Presencial ( ) Remoto'
          : '( ) Presencial (X) Remoto',
        '30%'
      ),
      f('Carga Horária Semanal', d.horas_semanais ? `${d.horas_semanais} h` : '', '30%')
    )}
      ${row(f('Data Inicial', fmt(d.inicio_estagio)), f('Data Final Prevista', fmt(d.fim_estagio)))}
    </tbody>
  </table>

  <div class="sec-bar">GRADE DE HORÁRIOS</div>
  <table>
    <thead>
      <tr>
        <th style="width:22%;background:#e0e0e0;font-size:7px;">DIA</th>
        <th style="width:20%;background:#e0e0e0;font-size:7px;">HORÁRIO INÍCIO</th>
        <th style="width:20%;background:#e0e0e0;font-size:7px;">HORÁRIO FINAL</th>
      </tr>
    </thead>
    <tbody>
      ${horarioRows}
    </tbody>
  </table>

  <div class="sec-bar">TURNOS</div>
  <table>
    <thead>
      <tr>
        <th style="background:#e0e0e0;font-size:7px;">TURNO</th>
        <th style="background:#e0e0e0;font-size:7px;">SEG</th>
        <th style="background:#e0e0e0;font-size:7px;">TER</th>
        <th style="background:#e0e0e0;font-size:7px;">QUA</th>
        <th style="background:#e0e0e0;font-size:7px;">QUI</th>
        <th style="background:#e0e0e0;font-size:7px;">SEX</th>
        <th style="background:#e0e0e0;font-size:7px;">SÁB</th>
        <th style="background:#e0e0e0;font-size:7px;">DOM</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="font-size:7px;font-weight:bold;">1ª TURNO</td>
        ${turnosPrimeira}
      </tr>
      <tr>
        <td style="font-size:7px;font-weight:bold;">2ª TURNO</td>
        ${turnosSegunda}
      </tr>
      <tr>
        <td style="font-size:7px;font-weight:bold;">3ª TURNO</td>
        ${turnosTerceira}
      </tr>
    </tbody>
  </table>

  ${sigBlock(['Discente', 'Responsável Legal', 'Supervisor do Estágio'], 'Declaro que as informações acima são verdadeiras e me comprometo a atualizá-las quando necessário.')}
`
  )
}

// Test comment for CI/CD validation
