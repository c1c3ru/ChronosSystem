import { generatePDFFromSchema } from './pdf-server-generator'
import { buildMonthlyReportSchema } from './pdf-schemas/templates'

async function testPdfGeneration() {
  console.log('🚀 Testing PDF Generation...')

  const schema = buildMonthlyReportSchema()
  const data = {
    nome_estudante: 'João da Silva',
    curso_estudante: 'Sistemas de Informação',
    matricula_estudante: '2023123456',
    nome_supervisor: 'Supervisor Teste',
    nome_orientador: 'Professor Orientador',
    inicio_periodo: '2024-01-01',
    fim_periodo: '2024-01-31',
    horas_mes: '120',
    atividades: 'Desenvolvimento de funcionalidades no sistema Chronos.',
    dificuldades: 'Nenhuma dificuldade relevante.',
    solucoes: 'Uso de documentação oficial e pesquisa.',
  }

  try {
    console.log('Generating PDF buffer...')
    const buffer = await generatePDFFromSchema(schema, data)
    console.log(`✅ PDF generated successfully! Size: ${buffer.length} bytes`)
  } catch (error) {
    console.error('❌ PDF generation failed:', error)
    process.exit(1)
  }
}

testPdfGeneration()
