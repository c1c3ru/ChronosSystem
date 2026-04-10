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
  @page { margin: 12mm 15mm 12mm 15mm; size: A4 portrait; }
  html, body { margin:0; padding:0; background:#fff; }
  * { box-sizing:border-box; font-family:Arial,Helvetica,sans-serif; font-size:8px; color:#000; }
  body { padding:12px 16px; background:#fff; }

  /* ── Cabeçalho institucional (padrão IFCE oficial) ── */
  .hdr {
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom:3px;
    gap:6px;
  }
  .hdr-logo { width:52px; height:52px; object-fit:contain; flex-shrink:0; }
  .hdr-txt {
    text-align:center;
    flex:1;
    line-height:1.45;
    padding:0 6px;
  }
  .hdr-txt .pro-reitoria {
    font-size:8px;
    font-weight:bold;
    text-transform:uppercase;
  }
  .hdr-txt .coordenacao {
    font-size:7px;
    text-transform:uppercase;
  }
  .hdr-txt .campus-line {
    font-size:8px;
    font-weight:bold;
  }
  .hdr-txt .setor-line {
    font-size:7px;
  }
  hr.hdr-line { border:none; border-top:1.5px solid #000; margin:5px 0 6px 0; }

  /* ── Título do documento (sem fundo cinza, apenas negrito/maiúsculo) ── */
  .doc-title {
    text-align:center;
    font-size:10px;
    font-weight:bold;
    text-transform:uppercase;
    text-decoration:underline;
    margin-bottom:7px;
    letter-spacing:0.4px;
  }

  /* ── Tabelas de campos ── */
  table { width:100%; border-collapse:collapse; margin-bottom:0; }
  td, th { border:1px solid #000; padding:2px 4px; vertical-align:top; }
  .lbl {
    font-size:6px;
    font-weight:bold;
    text-transform:uppercase;
    color:#000;
    display:block;
    margin-bottom:1px;
  }
  .val { font-size:8px; min-height:12px; display:block; }

  /* ── Checkbox style (radio IFCE) ── */
  .chk-group {
    display:flex;
    flex-direction:column;
    gap:1px;
    font-size:7px;
    padding:2px 0;
  }
  .chk-item { display:flex; align-items:center; gap:3px; }
  .chk-box {
    width:8px; height:8px;
    border:1px solid #000;
    display:inline-block;
    flex-shrink:0;
  }

  /* ── Seções com barra cinza ── */
  .sec-bar {
    background:#c0c0c0;
    font-weight:bold;
    font-size:7px;
    text-transform:uppercase;
    border:1px solid #000;
    border-bottom:none;
    padding:2px 4px;
    margin-top:5px;
  }
  .sec-body {
    border:1px solid #000;
    padding:5px;
    min-height:50px;
    font-size:8px;
    line-height:1.5;
    white-space:pre-wrap;
    margin-bottom:5px;
    background:#fff;
  }

  /* ── Área de assinaturas ── */
  .sig-area {
    margin-top:30px;
    border:1px solid #000;
    padding:5px;
    min-height:40px;
  }
  .sigs { display:flex; justify-content:space-around; margin-top:20px; }
  .sig { text-align:center; width:45%; }
  .sig-line {
    border-top:1px solid #000;
    padding-top:3px;
    font-size:7px;
    font-weight:bold;
    text-transform:uppercase;
    margin-top:22px;
  }
  .sig-date-row {
    display:flex;
    justify-content:space-between;
    gap:8px;
    margin-top:10px;
  }
  .sig-date-box {
    border:1px solid #000;
    padding:2px 4px;
    flex:1;
    font-size:7px;
  }
  .sig-date-label { font-size:6px; font-weight:bold; display:block; }
  .sig-date-val { font-size:7.5px; min-height:12px; display:block; }

  /* ── Observação de rodapé ── */
  .obs {
    font-size:7px;
    font-style:italic;
    margin-top:10px;
    line-height:1.4;
  }
  .obs strong { font-size:7px; }

  /* ── Parágrafos de texto corrido ── */
  .para { font-size:8.5px; text-align:justify; line-height:1.6; margin-bottom:8px; }
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
  const cols = labels.length <= 2 ? '48%' : '30%'
  return `
  <div class="sigs">
    ${labels.map((l) => `<div class="sig" style="width:${cols}"><div class="sig-line">${l}</div></div>`).join('')}
  </div>`
}

/**
 * Bloco de datas de solicitação/autorização com assinaturas abaixo
 * (padrão do formulário oficial IFCE)
 */
function sigBlock(sigLabels: string[], obs?: string): string {
  const datesRow = `
  <div class="sig-date-row" style="margin-top:25px;">
    <div class="sig-date-box">
      <span class="sig-date-label">SOLICITAÇÃO EM</span>
      <span class="sig-date-val">____/____/________</span>
    </div>
    <div class="sig-date-box">
      <span class="sig-date-label">AUTORIZAÇÃO EM</span>
      <span class="sig-date-val">____/____/________</span>
    </div>
  </div>`
  const lines = sigs(...sigLabels)
  const note = obs ? `<p class="obs"><strong>Observação:</strong> ${obs}</p>` : ''
  return datesRow + lines + note
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
    ${sigBlock(['Supervisor do Estágio', 'Discente Estagiário'])}`
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
    ${sigBlock(['Supervisor do Estágio', 'Discente Estagiário', 'Docente Orientador'])}`
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
    ${sigBlock(['Supervisor do Estágio', 'Discente Estagiário'])}`
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
    ${sigBlock(
      ['Supervisor do Estágio', 'Discente Estagiário', 'Coordenador de Estágios'],
      'As atividades de estágio supervisionado só podem ser <strong>iniciadas após o cadastro</strong> do Termo de Compromisso de Estágio no sistema competente.'
    )}`
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
    ${sigBlock(['Supervisor do Estágio', 'Discente Estagiário', 'Coordenador de Estágios'])}`
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
    ${sigBlock(['Representante da Empresa', 'Discente Estagiário', 'Coordenador de Estágios'])}`
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
    ${sigBlock(['Supervisor do Estágio', 'Coordenador de Estágios IFCE'])}`
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
    ${sigBlock(
      ['Discente', 'Coordenador de Estágios'],
      'As atividades de estágio supervisionado só podem ser <strong>iniciadas após o cadastro</strong> do Termo de Compromisso de Estágio no sistema competente.'
    )}`
  )
}

// 9. Solicitação de Cadastro no Estágio - Modelo IFCE
export function buildInternshipRegistrationRequestHTML(data: Record<string, string>): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      @page { margin: 20mm; }
      body { 
        font-family: Arial, sans-serif; 
        font-size: 12px; 
        line-height: 1.4;
        margin: 0;
        padding: 0;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #333;
        padding-bottom: 20px;
      }
      .header h1 {
        font-size: 16px;
        font-weight: bold;
        margin: 0;
        text-transform: uppercase;
      }
      .header h2 {
        font-size: 14px;
        font-weight: bold;
        margin: 5px 0;
      }
      .section {
        margin-bottom: 20px;
      }
      .section-title {
        font-weight: bold;
        font-size: 12px;
        margin-bottom: 10px;
        text-transform: uppercase;
        border-bottom: 1px solid #ccc;
        padding-bottom: 3px;
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 15px;
      }
      .form-grid-2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin-bottom: 15px;
      }
      .form-field {
        margin-bottom: 8px;
      }
      .field-label {
        font-weight: bold;
        font-size: 10px;
        margin-bottom: 2px;
      }
      .field-value {
        border: 1px solid #ccc;
        padding: 4px;
        min-height: 16px;
        background: #f9f9f9;
      }
      .checkbox-group {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin: 10px 0;
      }
      .checkbox-item {
        display: flex;
        align-items: center;
        font-size: 10px;
      }
      .checkbox-item input {
        margin-right: 4px;
      }
      .schedule-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 5px;
        margin: 10px 0;
      }
      .schedule-day {
        text-align: center;
      }
      .schedule-day-label {
        font-weight: bold;
        font-size: 9px;
        margin-bottom: 3px;
      }
      .schedule-time {
        border: 1px solid #ccc;
        padding: 2px;
        height: 15px;
        font-size: 9px;
        margin-bottom: 2px;
      }
      .signature-section {
        margin-top: 40px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
      .signature-box {
        text-align: center;
      }
      .signature-line {
        border-bottom: 1px solid #000;
        margin: 30px 0 5px 0;
        height: 40px;
      }
      .signature-label {
        font-size: 10px;
        font-weight: bold;
      }
      .dates-section {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin: 20px 0;
      }
      .date-box {
        text-align: center;
      }
      .date-line {
        border-bottom: 1px solid #000;
        margin: 20px 0 5px 0;
        height: 20px;
      }
      .observation {
        border: 1px solid #ccc;
        padding: 10px;
        min-height: 40px;
        margin: 15px 0;
        font-style: italic;
        font-size: 10px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>SOLICITAÇÃO DE CADASTRO NO ESTÁGIO</h1>
      <h2>Instituto Federal do Ceará - Campus Maracanaú</h2>
    </div>

    <div class="section">
      <div class="section-title">1. DADOS PESSOAIS</div>
      <div class="form-grid">
        <div class="form-field" style="grid-column: span 2;">
          <div class="field-label">Nome Completo</div>
          <div class="field-value">${data.nome_estudante || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">CPF</div>
          <div class="field-value">${data.cpf_estudante || ''}</div>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <div class="field-label">Nome Social</div>
          <div class="field-value">${data.nome_social || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Curso</div>
          <div class="field-value">${data.curso_estudante || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Matrícula</div>
          <div class="field-value">${data.matricula_estudante || ''}</div>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-field" style="grid-column: span 3;">
          <div class="field-label">Endereço</div>
          <div class="field-value">${data.endereco || ''}</div>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <div class="field-label">Bairro</div>
          <div class="field-value">${data.bairro || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Município-UF</div>
          <div class="field-value">${data.municipio_uf || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">CEP</div>
          <div class="field-value">${data.cep || ''}</div>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <div class="field-label">Telefone</div>
          <div class="field-value">${data.telefone_estudante || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">E-mail Institucional</div>
          <div class="field-value">${data.email_institucional || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">E-mail Pessoal</div>
          <div class="field-value">${data.email_pessoal || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">2. COR/RAÇA E ETNIA</div>
      <div class="form-grid-2">
        <div class="form-field">
          <div class="field-label">Cor/Raça</div>
          <div class="field-value">${data.cor_raca || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Etnia</div>
          <div class="field-value">${data.etnia || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">3. TIPO DE ESTÁGIO</div>
      <div class="form-grid-2">
        <div class="form-field">
          <div class="field-label">Tipo de Estágio</div>
          <div class="field-value">${data.tipo_estagio || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Forma de Estágio</div>
          <div class="field-value">${data.forma_estagio || ''}</div>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <div class="field-label">Data Inicial</div>
          <div class="field-value">${data.inicio_estagio || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Carga Horária Semanal</div>
          <div class="field-value">${data.horas_semanais || ''} horas</div>
        </div>
        <div class="form-field">
          <div class="field-label">Data Final Prevista</div>
          <div class="field-value">${data.fim_estagio || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">4. DISTRIBUIÇÃO DA CARGA HORÁRIA DIÁRIA</div>
      <div class="schedule-grid">
        <div class="schedule-day">
          <div class="schedule-day-label">Segunda</div>
          <div class="schedule-time">${data.horario_segunda_inicio || ''}</div>
          <div class="schedule-time">${data.horario_segunda_fim || ''}</div>
        </div>
        <div class="schedule-day">
          <div class="schedule-day-label">Terça</div>
          <div class="schedule-time">${data.horario_terca_inicio || ''}</div>
          <div class="schedule-time">${data.horario_terca_fim || ''}</div>
        </div>
        <div class="schedule-day">
          <div class="schedule-day-label">Quarta</div>
          <div class="schedule-time">${data.horario_quarta_inicio || ''}</div>
          <div class="schedule-time">${data.horario_quarta_fim || ''}</div>
        </div>
        <div class="schedule-day">
          <div class="schedule-day-label">Quinta</div>
          <div class="schedule-time">${data.horario_quinta_inicio || ''}</div>
          <div class="schedule-time">${data.horario_quinta_fim || ''}</div>
        </div>
        <div class="schedule-day">
          <div class="schedule-day-label">Sexta</div>
          <div class="schedule-time">${data.horario_sexta_inicio || ''}</div>
          <div class="schedule-time">${data.horario_sexta_fim || ''}</div>
        </div>
        <div class="schedule-day">
          <div class="schedule-day-label">Sábado</div>
          <div class="schedule-time">${data.horario_sabado_inicio || ''}</div>
          <div class="schedule-time">${data.horario_sabado_fim || ''}</div>
        </div>
        <div class="schedule-day">
          <div class="schedule-day-label">Domingo</div>
          <div class="schedule-time">${data.horario_domingo_inicio || ''}</div>
          <div class="schedule-time">${data.horario_domingo_fim || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">5. UNIDADE CONCEDENTE</div>
      <div class="form-grid-2">
        <div class="form-field">
          <div class="field-label">Nome Fantasia / Razão Social</div>
          <div class="field-value">${data.empresa_nome || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">CNPJ / Registro no Conselho</div>
          <div class="field-value">${data.empresa_cnpj || ''}</div>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-field" style="grid-column: span 3;">
          <div class="field-label">Endereço</div>
          <div class="field-value">${data.empresa_endereco || ''}</div>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <div class="field-label">Bairro</div>
          <div class="field-value">${data.empresa_bairro || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Município-UF</div>
          <div class="field-value">${data.empresa_municipio_uf || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">CEP</div>
          <div class="field-value">${data.empresa_cep || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">6. RESPONSÁVEL LEGAL E SUPERVISOR</div>
      <div class="form-grid-2">
        <div class="form-field">
          <div class="field-label">Responsável Legal</div>
          <div class="field-value">${data.responsavel_legal || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Cargo / Qualificação</div>
          <div class="field-value">${data.cargo_responsavel || ''}</div>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-field">
          <div class="field-label">Supervisor(a) do Estágio</div>
          <div class="field-value">${data.nome_supervisor || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Cargo do Supervisor</div>
          <div class="field-value">${data.cargo_supervisor || ''}</div>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <div class="field-label">Setor de Realização</div>
          <div class="field-value">${data.setor_supervisor || ''}</div>
        </div>
      </div>
    </div>

    <div class="dates-section">
      <div class="date-box">
        <div class="field-label">SOLICITAÇÃO EM</div>
        <div class="date-line"></div>
      </div>
      <div class="date-box">
        <div class="field-label">AUTORIZAÇÃO EM</div>
        <div class="date-line"></div>
      </div>
    </div>

    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Assinatura do Estagiário(a)</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Assinatura do Responsável Legal</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Assinatura do Supervisor(a)</div>
      </div>
    </div>

    <div class="observation">
      Observação: Este formulário deve ser preenchido com todas as informações corretas e apresentado na coordenação de estágios.
    </div>
  </body>
  </html>
  `
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
    ${sigBlock(['Supervisor do Estágio', 'Discente Estagiário'])}`
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
    ${sigBlock(['Supervisor do Estágio', 'Discente Estagiário', 'Coordenador de Estágios'])}`
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
    ${sigBlock(['Discente', 'Coordenador de Estágios'])}`
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
    ${sigBlock(['Supervisor Avaliador', 'Coordenador de Estágios'])}`
  )
}

// generateHTMLPDF é exportado da engine unificada (pdf-engine.ts)
