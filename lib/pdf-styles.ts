/**
 * Estilos padronizados para documentos oficiais do IFCE
 * Baseado no modelo oficial de Solicitação de Cadastro no Estágio
 * 
 * Requisitos de Layout (Style Guide):
 * - Página: Tamanho A4, Margens (3cm Sup/Esq, 2cm Inf/Dir)
 * - Tipografia: Arial ou Times New Roman, 12pt corpo, negrito em Títulos/Labels
 * - Cabeçalho: Centralizado com logos e informações institucionais
 * - Tabelas: Bordas simples pretas (1px solid black) com border-collapse
 * - Justificação: Texto jurídico justificado (text-align: justify)
 */

export const PDF_STYLES = {
    // Dimensões A4 em mm
    page: {
        width: 210, // mm
        height: 297, // mm
        marginTop: 30, // 3cm
        marginLeft: 30, // 3cm
        marginBottom: 20, // 2cm
        marginRight: 20, // 2cm
    },

    // Tipografia
    typography: {
        fontFamily: "'Arial', 'Times New Roman', sans-serif",
        fontSize: {
            body: '12pt',
            label: '10pt',
            title: '14pt',
            subtitle: '12pt',
            small: '9pt',
        },
        lineHeight: '1.5',
    },

    // Cores
    colors: {
        text: '#000000',
        background: '#FFFFFF',
        border: '#000000',
        headerBg: '#F5F5F5',
    },

    // Bordas
    borders: {
        table: '1px solid #000000',
        input: '1px solid #000000',
    },
} as const

/**
 * CSS inline para documentos PDF oficiais do IFCE
 * Aplicado diretamente nos templates HTML
 */
export const OFFICIAL_PDF_CSS = `
  @page {
    size: A4;
    margin: 30mm 20mm 20mm 30mm; /* Superior, Direita, Inferior, Esquerda */
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: Arial, 'Times New Roman', sans-serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #000000;
    background: #FFFFFF;
  }

  /* Cabeçalho Oficial */
  .official-header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #000000;
  }

  .official-header .logos {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .official-header .logo {
    width: 80px;
    height: auto;
  }

  .official-header .institution-name {
    font-size: 14pt;
    font-weight: bold;
    text-transform: uppercase;
    margin: 5px 0;
  }

  .official-header .department {
    font-size: 11pt;
    margin: 3px 0;
  }

  .official-header .campus {
    font-size: 11pt;
    font-style: italic;
  }

  /* Título do Documento */
  .document-title {
    font-size: 14pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin: 20px 0;
    padding: 10px 0;
    border-top: 1px solid #000000;
    border-bottom: 1px solid #000000;
  }

  /* Tabelas */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
    page-break-inside: auto;
  }

  table, th, td {
    border: 1px solid #000000;
  }

  th, td {
    padding: 8px;
    text-align: left;
    vertical-align: top;
  }

  th {
    background-color: #F5F5F5;
    font-weight: bold;
    font-size: 10pt;
    text-transform: uppercase;
  }

  td {
    font-size: 12pt;
  }

  /* Labels dentro de células */
  .field-label {
    display: block;
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 3px;
    color: #000000;
  }

  .field-value {
    font-size: 12pt;
    font-weight: normal;
    min-height: 20px;
  }

  /* Campos de formulário */
  .form-field {
    margin-bottom: 10px;
  }

  .form-field input,
  .form-field textarea,
  .form-field select {
    width: 100%;
    padding: 5px;
    border: 1px solid #000000;
    font-family: Arial, sans-serif;
    font-size: 12pt;
    background: transparent;
  }

  /* Checkboxes e Radio buttons */
  .checkbox-group,
  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin: 10px 0;
  }

  .checkbox-item,
  .radio-item {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  input[type="checkbox"],
  input[type="radio"] {
    width: 15px;
    height: 15px;
    border: 1px solid #000000;
    margin-right: 5px;
  }

  /* Texto justificado (cláusulas jurídicas) */
  .justified-text {
    text-align: justify;
    text-justify: inter-word;
    margin-bottom: 15px;
  }

  /* Seções */
  .section {
    margin-bottom: 20px;
    page-break-inside: avoid;
  }

  .section-title {
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 10px;
    padding: 5px 0;
    border-bottom: 1px solid #000000;
  }

  /* Assinaturas */
  .signature-section {
    margin-top: 40px;
    page-break-inside: avoid;
  }

  .signature-line {
    border-top: 1px solid #000000;
    width: 60%;
    margin: 40px auto 5px;
    text-align: center;
  }

  .signature-label {
    text-align: center;
    font-size: 11pt;
    margin-top: 5px;
  }

  /* Quebras de página */
  .page-break-before {
    page-break-before: always;
  }

  .page-break-after {
    page-break-after: always;
  }

  .no-page-break {
    page-break-inside: avoid;
  }

  /* Grid para layout de campos */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }

  .grid-4 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 10px;
  }

  /* Observações e notas */
  .observation {
    font-size: 11pt;
    font-style: italic;
    margin-top: 10px;
    padding: 10px;
    border: 1px solid #000000;
    background-color: #F9F9F9;
  }

  /* Horários (tabela complexa) */
  .schedule-table {
    font-size: 10pt;
  }

  .schedule-table th {
    background-color: #E0E0E0;
    font-size: 9pt;
    padding: 5px;
  }

  .schedule-table td {
    text-align: center;
    padding: 5px;
    font-size: 10pt;
  }

  /* Impressão */
  @media print {
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }

    .no-print {
      display: none !important;
    }
  }
`

/**
 * Configurações padrão para html2pdf.js
 */
export const HTML2PDF_CONFIG = {
    margin: [30, 20, 20, 30], // [top, right, bottom, left] em mm
    filename: 'documento-ifce.pdf',
    image: {
        type: 'jpeg' as const,
        quality: 0.98,
    },
    html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        windowWidth: 794, // Largura A4 em pixels (210mm @ 96 DPI)
    },
    jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const,
        compress: true,
    },
    pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: ['.no-page-break', 'tr', '.avoid-break'],
    },
}

/**
 * Configurações padrão para Puppeteer
 */
export const PUPPETEER_CONFIG = {
    format: 'A4' as const,
    margin: {
        top: '30mm',
        right: '20mm',
        bottom: '20mm',
        left: '30mm',
    },
    printBackground: true,
    preferCSSPageSize: true,
}
