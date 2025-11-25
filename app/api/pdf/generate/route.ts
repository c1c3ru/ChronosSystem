import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(request: NextRequest) {
    try {
        const { html, filename } = await request.json()

        if (!html) {
            return NextResponse.json(
                { error: 'HTML content is required' },
                { status: 400 }
            )
        }

        // Lançar navegador Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })

        const page = await browser.newPage()

        // Definir conteúdo HTML
        await page.setContent(html, {
            waitUntil: 'networkidle0'
        })

        // Gerar PDF com configurações otimizadas para A4
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '15mm'
            },
            preferCSSPageSize: false
        })

        await browser.close()

        // Retornar PDF como resposta
        return new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename || 'document.pdf'}"`
            }
        })
    } catch (error) {
        console.error('Erro ao gerar PDF:', error)
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        )
    }
}
