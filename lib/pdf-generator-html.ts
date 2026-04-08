/**
 * Gerador de PDF usando html2pdf.js
 * NÃO usa WebAssembly - compatível com qualquer CSP
 */

export interface MonthlyReportData {
  nome_estudante?: string
  curso_estudante?: string
  matricula_estudante?: string
  nome_supervisor?: string
  nome_orientador?: string
  inicio_periodo?: string
  fim_periodo?: string
  horas_mes?: string
  atividades?: string
  dificuldades?: string
  solucoes?: string
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '___/___/_____'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function buildMonthlyReportHTML(data: MonthlyReportData): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 10px; color: #000; background: #fff; padding: 20px; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
  .header img { width: 55px; height: 55px; object-fit: contain; }
  .header-text { text-align: center; flex: 1; padding: 0 10px; }
  .header-text p { font-size: 8px; line-height: 1.5; }
  .header-text strong { font-size: 9px; display: block; margin-bottom: 2px; }
  h1 { font-size: 12px; text-align: center; text-transform: uppercase; font-weight: bold; margin: 15px 0; border: 1px solid #000; padding: 6px; background: #f0f0f0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  table td, table th { border: 1px solid #000; padding: 5px 7px; font-size: 9px; vertical-align: top; }
  .field-label { font-size: 7px; font-weight: bold; text-transform: uppercase; color: #444; margin-bottom: 2px; }
  .field-value { font-size: 9px; min-height: 14px; }
  .section { margin-bottom: 10px; }
  .section-title { font-size: 9px; font-weight: bold; text-transform: uppercase; background: #e0e0e0; border: 1px solid #000; padding: 4px 7px; margin-bottom: 0; }
  .section-content { border: 1px solid #000; border-top: none; padding: 8px; min-height: 70px; font-size: 9px; line-height: 1.5; white-space: pre-wrap; }
  .signatures { display: flex; justify-content: space-around; margin-top: 40px; }
  .sig-box { text-align: center; width: 40%; }
  .sig-line { border-top: 1px solid #000; padding-top: 5px; font-size: 8px; font-weight: bold; text-transform: uppercase; }
</style>
</head>
<body>
  <div class="header">
    <img src="${data.logo_base64 || ''}" alt="Logo IFCE" />
    <div class="header-text">
      <strong>PRÓ-REITORIA DE EXTENSÃO</strong>
      <p>COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS</p>
      <p>IFCE Campus Maracanaú</p>
      <p>Setor de Acompanhamento de Estágio</p>
    </div>
    <img src="${data.brasao_base64 || ''}" alt="Brasão IFCE" />
  </div>

  <h1>Relatório Mensal de Atividades</h1>

  <table>
    <tr>
      <td style="width:75%">
        <div class="field-label">Nome do Discente</div>
        <div class="field-value">${data.nome_estudante || ''}</div>
      </td>
      <td style="width:25%">
        <div class="field-label">Matrícula</div>
        <div class="field-value">${data.matricula_estudante || ''}</div>
      </td>
    </tr>
    <tr>
      <td colspan="2">
        <div class="field-label">Curso</div>
        <div class="field-value">${data.curso_estudante || ''}</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="field-label">Supervisor do Estágio (Empresa/IFCE)</div>
        <div class="field-value">${data.nome_supervisor || ''}</div>
      </td>
      <td>
        <div class="field-label">Docente Orientador (IFCE)</div>
        <div class="field-value">${data.nome_orientador || ''}</div>
      </td>
    </tr>
    <tr>
      <td style="width:35%">
        <div class="field-label">Data Inicial Parcial</div>
        <div class="field-value">${formatDate(data.inicio_periodo)}</div>
      </td>
      <td style="width:35%">
        <div class="field-label">Data Final Parcial</div>
        <div class="field-value">${formatDate(data.fim_periodo)}</div>
      </td>
      <td style="width:30%">
        <div class="field-label">Carga Horária no Período</div>
        <div class="field-value">${data.horas_mes || ''} horas</div>
      </td>
    </tr>
  </table>

  <div class="section">
    <div class="section-title">1. Principais Atividades Desenvolvidas no Período</div>
    <div class="section-content">${data.atividades || ''}</div>
  </div>

  <div class="section">
    <div class="section-title">2. Dificuldades Encontradas</div>
    <div class="section-content">${data.dificuldades || ''}</div>
  </div>

  <div class="section">
    <div class="section-title">3. Soluções Adotadas</div>
    <div class="section-content">${data.solucoes || ''}</div>
  </div>

  <div class="signatures">
    <div class="sig-box">
      <br/><br/>
      <div class="sig-line">Supervisor do Estágio</div>
    </div>
    <div class="sig-box">
      <br/><br/>
      <div class="sig-line">Discente Estagiário</div>
    </div>
  </div>
</body>
</html>`
}

export async function generateHTMLPDF(html: string, filename: string): Promise<void> {
  const html2pdf = (await import('html2pdf.js')).default

  const container = document.createElement('div')
  container.innerHTML = html
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  document.body.appendChild(container)

  const opt = {
    margin: [10, 10, 10, 10],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }

  try {
    await html2pdf().set(opt).from(container).save()
  } finally {
    document.body.removeChild(container)
  }
}
