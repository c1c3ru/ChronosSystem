#!/usr/bin/env node

/**
 * Script para remover código duplicado do Puppeteer das páginas
 */

const fs = require('fs')
const path = require('path')

const PAGES_DIR = path.join(__dirname, '../app/documents')

// Lista de páginas para limpar
const PAGES_TO_CLEAN = [
  'additive-term',
  'commitment-term',
  'internship-registration',
  'internship-registration-request',
]

console.log('🧹 Limpando código duplicado do Puppeteer...\n')

function cleanPage(pageName) {
  const pagePath = path.join(PAGES_DIR, pageName, 'page.tsx')

  if (!fs.existsSync(pagePath)) {
    console.log(`⚠️  Página ${pageName} não encontrada`)
    return false
  }

  let content = fs.readFileSync(pagePath, 'utf-8')

  // Verificar se tem código do Puppeteer
  if (!content.includes('generatePDFWithPuppeteer')) {
    console.log(`✅ ${pageName} já está limpa`)
    return true
  }

  console.log(`🔄 Limpando ${pageName}...`)

  // Remover imports do Puppeteer
  content = content.replace(/import.*?pdf-generator-puppeteer.*?\n/g, '')
  content = content.replace(/import.*?generatePDFWithPuppeteer.*?\n/g, '')

  // Remover templateRef
  content = content.replace(/const templateRef = useRef<HTMLDivElement>\(null\)\n\s*/g, '')

  // Encontrar e remover código duplicado do Puppeteer
  // Procurar por padrão: setFormData(data) até o final do try-catch duplicado
  const puppeteerPattern =
    /\/\/\s*Atualizar estado[\s\S]*?await generatePDFWithPuppeteer[\s\S]*?}\s*catch[\s\S]*?}\s*}/
  content = content.replace(puppeteerPattern, '')

  // Remover template oculto (se existir)
  content = content.replace(
    /\s*{\/\*\s*Template Oculto[\s\S]*?\*\/}\s*<div[^>]*ref={templateRef}[\s\S]*?<\/div>/g,
    ''
  )

  // Salvar arquivo limpo
  fs.writeFileSync(pagePath, content)
  console.log(`   ✅ ${pageName} limpa com sucesso!`)

  return true
}

let cleanedCount = 0

for (const pageName of PAGES_TO_CLEAN) {
  if (cleanPage(pageName)) {
    cleanedCount++
  }
}

console.log(`\n✅ Limpeza concluída! ${cleanedCount}/${PAGES_TO_CLEAN.length} páginas limpas.`)
