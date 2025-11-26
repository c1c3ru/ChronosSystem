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

        console.log('🚀 Iniciando geração de PDF com Puppeteer...')
        console.log('📄 Nome do arquivo:', filename)

        // Lançar navegador Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        })

        console.log('✅ Navegador Puppeteer iniciado')

        const page = await browser.newPage()

        // Aguardar recursos carregarem (incluindo imagens)
        await page.setContent(html, {
            waitUntil: ['load', 'domcontentloaded'],
            timeout: 60000
        })

        // Aguardar um pouco mais para garantir que imagens e fontes carreguem
        await new Promise(resolve => setTimeout(resolve, 2000))

        console.log('✅ Conteúdo HTML carregado')

        // Gerar PDF com configurações otimizadas para A4
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            },
            preferCSSPageSize: true
        })

        console.log('✅ PDF gerado com sucesso, tamanho:', pdfBuffer.length, 'bytes')

        await browser.close()

        // Retornar PDF como resposta
        return new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename || 'document.pdf'}"`
            }
        })
    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorStack = error instanceof Error ? error.stack : ''

        console.error('Stack trace:', errorStack)

        return NextResponse.json(
            {
                error: 'Failed to generate PDF',
                details: errorMessage,
                stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
            },
            { status: 500 }
        )
    }
}
