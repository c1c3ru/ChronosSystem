/**
 * Gerador de PDF usando html2pdf.js
 * NÃO usa WebAssembly — compatível com qualquer CSP
 */

import { LOGO_IFCE_BASE64, BRASAO_BASE64 } from './pdf-assets'

function formatDate(dateStr?: string): string {
  if (!dateStr) return '___/___/_____'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

// ─── CSS base compartilhado entre todos os templates ────────────────────────
const BASE_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 10px; color: #000; background: #fff; padding: 25px; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
  .header img { width: 55px; height: 55px; object-fit: contain; }
  .header-text { text-align: center; flex: 1; padding: 0 10px; }
  .header-text p { font-size: 8px; line-height: 1.6; }
  .header-text strong { font-size: 9px; display: block; margin-bottom: 2px; }
  h1.doc-title { font-size: 11px; text-align: center; text-transform: uppercase; font-weight: bold; margin: 12px 0; border: 1px solid #000; padding: 5px; background: #f0f0f0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  table td { border: 1px solid #000; padding: 5px 7px; font-size: 9px; vertical-align: top; }
  .field-label { font-size: 7px; font-weight: bold; text-transform: uppercase; color: #555; margin-bottom: 2px; }
  .field-value { font-size: 9px; min-height: 13px; }
  .section-title { font-size: 9px; font-weight: bold; text-transform: uppercase; background: #e0e0e0; border: 1px solid #000; padding: 4px 7px; }
  .section-content { border: 1px solid #000; border-top: none; padding: 8px; min-height: 65px; font-size: 9px; line-height: 1.5; white-space: pre-wrap; margin-bottom: 10px; }
  .signatures { display: flex; justify-content: space-around; margin-top: 45px; }
  .sig-box { text-align: center; width: 38%; }
  .sig-line { border-top: 1px solid #000; padding-top: 5px; font-size: 8px; font-weight: bold; text-transform: uppercase; margin-top: 35px; }
`

function header(): string {
  return `
    <div class="header">
      <img src="${LOGO_IFCE_BASE64}" alt="Logo IFCE" />
      <div class="header-text">
        <strong>PRÓ-REITORIA DE EXTENSÃO</strong>
        <p>COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS</p>
        <p>IFCE Campus Maracanaú</p>
        <p>Setor de Acompanhamento de Estágio</p>
      </div>
      <img src="${BRASAO_BASE64}" alt="Brasão IFCE" />
    </div>`
}

function field(label: string, value?: string, colSpan?: number): string {
  const tdAttr = colSpan ? ` colspan="${colSpan}"` : ''
  return `<td${tdAttr}><div class="field-label">${label}</div><div class="field-value">${value || ''}</div></td>`
}

function section(title: string, content?: string): string {
  return `
    <div class="section-title">${title}</div>
    <div class="section-content">${content || ''}</div>`
}

function signatures(...labels: string[]): string {
  return `<div class="signatures">${labels.map(l => `<div class="sig-box"><div class="sig-line">${l}</div></div>`).join('')}</div>`
}

function wrapHTML(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${BASE_CSS}</style></head><body>${header()}<h1 class="doc-title">${title}</h1>${body}</body></html>`
}

// ─── RELATÓRIO MENSAL ────────────────────────────────────────────────────────
export function buildMonthlyReportHTML(data: Record<string, string>): string {
  return wrapHTML('Relatório Mensal de Atividades', `
    <table>
      <tr>${field('Nome do Discente', data.nome_estudante, 2)}</tr>
      <tr>
        ${field('Curso', data.curso_estudante)}
        ${field('Matrícula', data.matricula_estudante)}
      </tr>
      <tr>
        ${field('Supervisor do Estágio', data.nome_supervisor)}
        ${field('Docente Orientador (IFCE)', data.nome_orientador)}
      </tr>
      <tr>
        ${field('Data Inicial Parcial', formatDate(data.inicio_periodo))}
        ${field('Data Final Parcial', formatDate(data.fim_periodo))}
        ${field('Carga Horária no Período', data.horas_mes ? data.horas_mes + ' horas' : '')}
      </tr>
    </table>
    ${section('1. Principais Atividades Desenvolvidas no Período', data.atividades)}
    ${section('2. Dificuldades Encontradas', data.dificuldades)}
    ${section('3. Soluções Adotadas', data.solucoes)}
    ${signatures('Supervisor do Estágio', 'Discente Estagiário')}
  `)
}

// ─── RELATÓRIO FINAL ─────────────────────────────────────────────────────────
export function buildFinalReportHTML(data: Record<string, string>): string {
  return wrapHTML('Relatório Final de Estágio', `
    <table>
      <tr>${field('Nome do Discente', data.nome_estudante, 2)}</tr>
      <tr>
        ${field('Curso', data.curso_estudante)}
        ${field('Matrícula', data.matricula_estudante)}
      </tr>
      <tr>
        ${field('Supervisor do Estágio', data.nome_supervisor)}
        ${field('Docente Orientador (IFCE)', data.nome_orientador)}
      </tr>
      <tr>
        ${field('Período Total de Estágio', formatDate(data.inicio_periodo) + ' a ' + formatDate(data.fim_periodo), 2)}
      </tr>
      <tr>${field('Carga Horária Total', data.horas_total ? data.horas_total + ' horas' : '', 2)}</tr>
    </table>
    ${section('1. Resumo das Atividades Desenvolvidas', data.atividades)}
    ${section('2. Competências Adquiridas', data.competencias)}
    ${section('3. Avaliação do Estágio', data.avaliacao)}
    ${section('4. Conclusão', data.conclusao)}
    ${signatures('Supervisor do Estágio', 'Discente Estagiário', 'Docente Orientador')}
  `)
}

// ─── RELATÓRIO SEMESTRAL ─────────────────────────────────────────────────────
export function buildSemesterReportHTML(data: Record<string, string>): string {
  return wrapHTML('Relatório Semestral de Estágio', `
    <table>
      <tr>${field('Nome do Discente', data.nome_estudante, 2)}</tr>
      <tr>
        ${field('Curso', data.curso_estudante)}
        ${field('Matrícula', data.matricula_estudante)}
      </tr>
      <tr>
        ${field('Supervisor do Estágio', data.nome_supervisor)}
        ${field('Docente Orientador (IFCE)', data.nome_orientador)}
      </tr>
      <tr>
        ${field('Período', formatDate(data.inicio_periodo) + ' a ' + formatDate(data.fim_periodo))}
        ${field('Carga Horária Semestral', data.horas_semestre ? data.horas_semestre + ' horas' : '')}
      </tr>
    </table>
    ${section('1. Atividades Desenvolvidas no Semestre', data.atividades)}
    ${section('2. Dificuldades e Soluções', data.dificuldades)}
    ${section('3. Resultados Alcançados', data.resultados)}
    ${signatures('Supervisor do Estágio', 'Discente Estagiário')}
  `)
}

// ─── FUNÇÃO GERADORA PRINCIPAL ───────────────────────────────────────────────
export async function generateHTMLPDF(html: string, filename: string): Promise<void> {
  const { default: html2pdf } = await import('html2pdf.js')

  // Usar iframe para renderizar o HTML completo com estilos aplicados corretamente
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;top:0;left:-9999px;width:210mm;height:297mm;border:none;visibility:hidden;'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (!doc) {
    document.body.removeChild(iframe)
    throw new Error('Não foi possível criar o iframe para o PDF')
  }

  doc.open()
  doc.write(html)
  doc.close()

  // Aguardar imagens carregarem (base64 é imediato, mas o layout precisa estabilizar)
  await new Promise(resolve => setTimeout(resolve, 800))

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 794, // largura A4 em px a 96dpi
    },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  }

  try {
    await html2pdf().set(opt).from(doc.body).save()
  } finally {
    document.body.removeChild(iframe)
  }
}
