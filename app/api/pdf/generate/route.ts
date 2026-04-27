import { NextRequest, NextResponse } from 'next/server'
import { generatePDFFromSchema, generatePDFFromHTML } from '@/lib/pdf-server-generator'
import {
  buildMonthlyReportSchema,
  buildFinalReportSchema,
  buildSemesterReportSchema,
  buildCommitmentTermSchema,
  buildAdditiveTermSchema,
  buildExtensionDeclarationSchema,
  buildProfessionalDeclarationSchema,
  buildInternshipRegistrationSchema,
  buildInternshipRegistrationRequestSchema,
  buildRealizationTermSchema,
  buildRescissionTermSchema,
  buildEquivalenceRequestSchema,
  buildStudentEvaluationSchema,
} from '@/lib/pdf-schemas/templates'

// POST /api/pdf/generate - Generate PDF from JSON schema and data or HTML
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentType, data, options, html, filename } = body

    if (html) {
      // Support legacy/unified generatePDFServer which passes raw HTML
      const pdfBuffer = await generatePDFFromHTML(html, { ...options, filename })
      
      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename || options?.filename || 'document.pdf'}"`,
        },
      })
    }

    if (!documentType || !data) {
      return NextResponse.json({ error: 'documentType and data (or html) are required' }, { status: 400 })
    }

    // Map document types to their schema builders
    const schemaBuilders: Record<string, (data: any) => any> = {
      monthlyReport: buildMonthlyReportSchema,
      finalReport: buildFinalReportSchema,
      semesterReport: buildSemesterReportSchema,
      commitmentTerm: buildCommitmentTermSchema,
      additiveTerm: buildAdditiveTermSchema,
      extensionDeclaration: buildExtensionDeclarationSchema,
      professionalDeclaration: buildProfessionalDeclarationSchema,
      internshipRegistration: buildInternshipRegistrationSchema,
      internshipRegistrationRequest: buildInternshipRegistrationRequestSchema,
      realizationTerm: buildRealizationTermSchema,
      rescissionTerm: buildRescissionTermSchema,
      equivalenceRequest: buildEquivalenceRequestSchema,
      studentEvaluation: buildStudentEvaluationSchema,
    }

    const builder = schemaBuilders[documentType]
    if (!builder) {
      return NextResponse.json(
        { error: `Unsupported document type: ${documentType}` },
        { status: 400 }
      )
    }

    // Build schema with data
    const schema = builder(data)

    // Generate PDF
    const pdfBuffer = await generatePDFFromSchema(schema, data, options)

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${options?.filename || 'document.pdf'}"`,
      },
    })
  } catch (error: any) {
    console.error('❌ [PDF-GENERATE] Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    )
  }
}

// GET /api/pdf/generate - Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'PDF generation API is ready',
    supportedTypes: [
      'monthlyReport',
      'finalReport',
      'semesterReport',
      'commitmentTerm',
      'additiveTerm',
      'extensionDeclaration',
      'professionalDeclaration',
      'internshipRegistration',
      'internshipRegistrationRequest',
      'realizationTerm',
      'rescissionTerm',
      'equivalenceRequest',
      'studentEvaluation',
    ],
  })
}
