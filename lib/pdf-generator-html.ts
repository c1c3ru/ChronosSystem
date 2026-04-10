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

// 1. Relatório Mensal - Modelo IFCE
export function buildMonthlyReportHTML(d: Record<string, string>): string {
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
      .activities-table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
      }
      .activities-table th,
      .activities-table td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: left;
        font-size: 10px;
      }
      .activities-table th {
        background: #f0f0f0;
        font-weight: bold;
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
    </style>
  </head>
  <body>
    <div class="header">
      <h1>RELATÓRIO MENSAL DE ATIVIDADES</h1>
      <h2>Instituto Federal do Ceará - Campus Maracanaú</h2>
    </div>

    <div class="section">
      <div class="section-title">1. DADOS DO ESTAGIÁRIO</div>
      <div class="form-grid">
        <div class="form-field" style="grid-column: span 2;">
          <div class="field-label">Nome Completo</div>
          <div class="field-value">${d.nome_estudante || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Matrícula</div>
          <div class="field-value">${d.matricula_estudante || ''}</div>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-field">
          <div class="field-label">Curso</div>
          <div class="field-value">${d.curso_estudante || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Período de Referência</div>
          <div class="field-value">${d.periodo_referencia || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">2. DADOS DA EMPRESA</div>
      <div class="form-grid">
        <div class="form-field" style="grid-column: span 2;">
          <div class="field-label">Razão Social</div>
          <div class="field-value">${d.empresa_nome || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">CNPJ</div>
          <div class="field-value">${d.empresa_cnpj || ''}</div>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <div class="field-label">Supervisor do Estágio</div>
          <div class="field-value">${d.nome_supervisor || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Cargo do Supervisor</div>
          <div class="field-value">${d.cargo_supervisor || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Setor</div>
          <div class="field-value">${d.setor_supervisor || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">3. ATIVIDADES DESENVOLVIDAS</div>
      <table class="activities-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Atividade Desenvolvida</th>
            <th>Horas</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${d.data_atividade1 || ''}</td>
            <td>${d.atividade1 || ''}</td>
            <td>${d.horas_atividade1 || ''}</td>
            <td>${d.observacoes1 || ''}</td>
          </tr>
          <tr>
            <td>${d.data_atividade2 || ''}</td>
            <td>${d.atividade2 || ''}</td>
            <td>${d.horas_atividade2 || ''}</td>
            <td>${d.observacoes2 || ''}</td>
          </tr>
          <tr>
            <td>${d.data_atividade3 || ''}</td>
            <td>${d.atividade3 || ''}</td>
            <td>${d.horas_atividade3 || ''}</td>
            <td>${d.observacoes3 || ''}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">4. RESUMO DO PERÍODO</div>
      <div class="form-grid-2">
        <div class="form-field">
          <div class="field-label">Total de Horas no Mês</div>
          <div class="field-value">${d.total_horas || ''} horas</div>
        </div>
        <div class="form-field">
          <div class="field-label">Carga Horária Prevista</div>
          <div class="field-value">${d.carga_horaria_prevista || ''} horas</div>
        </div>
      </div>
    </div>

    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Assinatura do Estagiário(a)</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Assinatura do Supervisor(a)</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Assinatura do Coordenador(a)</div>
      </div>
    </div>
  </body>
  </html>
  `
}

// 2. Relatório Final - Modelo IFCE
export function buildFinalReportHTML(d: Record<string, string>): string {
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
      .text-area {
        border: 1px solid #ccc;
        padding: 8px;
        min-height: 60px;
        background: #f9f9f9;
        font-size: 10px;
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
    </style>
  </head>
  <body>
    <div class="header">
      <h1>RELATÓRIO FINAL DE ESTÁGIO</h1>
      <h2>Instituto Federal do Ceará - Campus Maracanaú</h2>
    </div>

    <div class="section">
      <div class="section-title">1. DADOS DO ESTAGIÁRIO</div>
      <div class="form-grid">
        <div class="form-field" style="grid-column: span 2;">
          <div class="field-label">Nome Completo</div>
          <div class="field-value">${d.nome_estudante || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Matrícula</div>
          <div class="field-value">${d.matricula_estudante || ''}</div>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-field">
          <div class="field-label">Curso</div>
          <div class="field-value">${d.curso_estudante || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Data de Conclusão</div>
          <div class="field-value">${d.data_conclusao || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">2. DADOS DO ESTÁGIO</div>
      <div class="form-grid">
        <div class="form-field" style="grid-column: span 2;">
          <div class="field-label">Empresa Concedente</div>
          <div class="field-value">${d.empresa_nome || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Carga Horária Total</div>
          <div class="field-value">${d.carga_horaria_total || ''} horas</div>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <div class="field-label">Período do Estágio</div>
          <div class="field-value">${d.periodo_estagio || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Supervisor</div>
          <div class="field-value">${d.nome_supervisor || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Setor</div>
          <div class="field-value">${d.setor_supervisor || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">3. ATIVIDADES DESENVOLVIDAS</div>
      <div class="text-area">${d.atividades_desenvolvidas || ''}</div>
    </div>

    <div class="section">
      <div class="section-title">4. PRINCIPAIS APRENDIZADOS</div>
      <div class="text-area">${d.aprendizados || ''}</div>
    </div>

    <div class="section">
      <div class="section-title">5. CONTRIBUIÇÕES PARA A EMPRESA</div>
      <div class="text-area">${d.contribuicoes || ''}</div>
    </div>

    <div class="section">
      <div class="section-title">6. AVALIAÇÃO GERAL DO ESTÁGIO</div>
      <div class="text-area">${d.avaliacao_geral || ''}</div>
    </div>

    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Assinatura do Estagiário(a)</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Assinatura do Supervisor(a)</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Assinatura do Coordenador(a)</div>
      </div>
    </div>
  </body>
  </html>
  `
}

// 5. Termo Aditivo - Modelo IFCE
export function buildAdditiveTermHTML(d: Record<string, string>): string {
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
      .text-area {
        border: 1px solid #ccc;
        padding: 8px;
        min-height: 60px;
        background: #f9f9f9;
        font-size: 10px;
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
    </style>
  </head>
  <body>
    <div class="header">
      <h1>TERMO ADITIVO AO CONTRATO DE ESTÁGIO</h1>
      <h2>Instituto Federal do Ceará - Campus Maracanaú</h2>
    </div>

    <div class="section">
      <div class="section-title">1. IDENTIFICAÇÃO DAS PARTES</div>
      <div class="form-grid">
        <div class="form-field" style="grid-column: span 2;">
          <div class="field-label">Estagiário(a)</div>
          <div class="field-value">${d.nome_estudante || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Matrícula</div>
          <div class="field-value">${d.matricula_estudante || ''}</div>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-field">
          <div class="field-label">Curso</div>
          <div class="field-value">${d.curso_estudante || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Empresa Concedente</div>
          <div class="field-value">${d.empresa_nome || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">2. DADOS DO TERMO ORIGINAL</div>
      <div class="form-grid-2">
        <div class="form-field">
          <div class="field-label">Data de Início Original</div>
          <div class="field-value">${d.inicio_estagio || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Data de Término Original</div>
          <div class="field-value">${d.fim_estagio || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">3. NOVAS CONDIÇÕES</div>
      <div class="form-grid">
        <div class="form-field">
          <div class="field-label">Nova Data de Início</div>
          <div class="field-value">${d.novo_inicio || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Nova Data de Término</div>
          <div class="field-value">${d.novo_fim || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Período de Prorrogação</div>
          <div class="field-value">${d.prazo_prorrogacao || ''}</div>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-field">
          <div class="field-label">Nova Carga Horária Semanal</div>
          <div class="field-value">${d.nova_carga_horaria || ''} horas</div>
        </div>
        <div class="form-field">
          <div class="field-label">Novo Valor da Bolsa</div>
          <div class="field-value">R$ ${d.novo_valor_bolsa || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">4. JUSTIFICATIVA DA PRORROGAÇÃO</div>
      <div class="text-area">${d.justificativa || ''}</div>
    </div>

    <div class="section">
      <div class="section-title">5. DISPOSIÇÕES GERAIS</div>
      <div class="text-area">
        As demais cláusulas e condições do Termo de Compromisso de Estágio original permanecem inalteradas, 
        mantendo-se plena validade e eficácia entre as partes. O presente Termo Aditivo passa a integrar 
        o contrato original para todos os fins de direito.
      </div>
    </div>

    <div class="dates-section">
      <div class="date-box">
        <div class="field-label">DATA DE ASSINATURA</div>
        <div class="date-line"></div>
      </div>
      <div class="date-box">
        <div class="field-label">LOCAL</div>
        <div class="date-line">Maracanaú - CE</div>
      </div>
    </div>

    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Estagiário(a)</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Responsável Legal<br>da Empresa</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Coordenador(a)<br>de Estágios</div>
      </div>
    </div>
  </body>
  </html>
  `
}

// 12. Pedido de Equivalência - Modelo IFCE
export function buildEquivalenceRequestHTML(d: Record<string, string>): string {
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
      .text-area {
        border: 1px solid #ccc;
        padding: 8px;
        min-height: 60px;
        background: #f9f9f9;
        font-size: 10px;
      }
      .signature-section {
        margin-top: 40px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
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
    </style>
  </head>
  <body>
    <div class="header">
      <h1>PEDIDO DE APROVEITAMENTO/EQUIVALÊNCIA DE ESTÁGIO</h1>
      <h2>Instituto Federal do Ceará - Campus Maracanaú</h2>
    </div>

    <div class="section">
      <div class="section-title">1. DADOS DO DISCENTE</div>
      <div class="form-grid">
        <div class="form-field" style="grid-column: span 2;">
          <div class="field-label">Nome Completo</div>
          <div class="field-value">${d.nome_estudante || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Matrícula</div>
          <div class="field-value">${d.matricula_estudante || ''}</div>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-field">
          <div class="field-label">Curso</div>
          <div class="field-value">${d.curso_estudante || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Período</div>
          <div class="field-value">${d.periodo_curso || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">2. DADOS DO ESTÁGIO</div>
      <div class="form-grid">
        <div class="form-field" style="grid-column: span 2;">
          <div class="field-label">Empresa / Instituição</div>
          <div class="field-value">${d.empresa_nome || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">CNPJ</div>
          <div class="field-value">${d.empresa_cnpj || ''}</div>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-field">
          <div class="field-label">Período das Atividades</div>
          <div class="field-value">${d.inicio_atividades || ''} a ${d.fim_atividades || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Carga Horária Total</div>
          <div class="field-value">${d.total_hours || ''} horas</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">3. JUSTIFICATIVA / DESCRIÇÃO DAS ATIVIDADES</div>
      <div class="text-area">${d.justificativa || ''}</div>
    </div>

    <div class="section">
      <div class="section-title">4. DISCIPLINAS ENVOLVIDAS</div>
      <div class="form-grid">
        <div class="form-field">
          <div class="field-label">Disciplina 1</div>
          <div class="field-value">${d.disciplina1 || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Disciplina 2</div>
          <div class="field-value">${d.disciplina2 || ''}</div>
        </div>
        <div class="form-field">
          <div class="field-label">Disciplina 3</div>
          <div class="field-value">${d.disciplina3 || ''}</div>
        </div>
      </div>
    </div>

    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Discente</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Coordenador(a) de Estágios</div>
      </div>
    </div>
  </body>
  </html>
  `
}
