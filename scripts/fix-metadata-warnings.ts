import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

async function fixMetadataWarnings() {
  console.log('🔧 Corrigindo warnings de metadata...')
  
  // Encontrar todos os arquivos TSX/TS no app
  const files = await glob('app/**/*.{ts,tsx}', { 
    cwd: process.cwd(),
    absolute: true 
  })
  
  let fixedCount = 0
  
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      let newContent = content
      let hasChanges = false
      
      // Verificar se tem metadata com viewport ou themeColor
      if (content.includes('export const metadata') && 
          (content.includes('viewport:') || content.includes('themeColor:'))) {
        
        console.log(`📝 Verificando: ${path.relative(process.cwd(), filePath)}`)
        
        // Se já tem import de Viewport, pular
        if (content.includes('import type { Metadata, Viewport }') || 
            content.includes('export const viewport')) {
          continue
        }
        
        // Adicionar import do Viewport se necessário
        if (content.includes('import type { Metadata }')) {
          newContent = newContent.replace(
            'import type { Metadata }',
            'import type { Metadata, Viewport }'
          )
          hasChanges = true
        }
        
        // Extrair viewport e themeColor do metadata
        const metadataMatch = newContent.match(/export const metadata: Metadata = \{([\s\S]*?)\}/m)
        if (metadataMatch) {
          let metadataContent = metadataMatch[1]
          let viewportConfig = ''
          
          // Extrair viewport
          const viewportMatch = metadataContent.match(/viewport:\s*['"`]([^'"`]+)['"`],?\s*\n?/m)
          if (viewportMatch) {
            viewportConfig += `  width: 'device-width',\n  initialScale: 1,\n`
            metadataContent = metadataContent.replace(viewportMatch[0], '')
            hasChanges = true
          }
          
          // Extrair themeColor
          const themeColorMatch = metadataContent.match(/themeColor:\s*['"`]([^'"`]+)['"`],?\s*\n?/m)
          if (themeColorMatch) {
            viewportConfig += `  themeColor: '${themeColorMatch[1]}',\n`
            metadataContent = metadataContent.replace(themeColorMatch[0], '')
            hasChanges = true
          }
          
          if (hasChanges) {
            // Reconstruir metadata sem viewport e themeColor
            const newMetadata = `export const metadata: Metadata = {${metadataContent}}`
            newContent = newContent.replace(metadataMatch[0], newMetadata)
            
            // Adicionar viewport export
            if (viewportConfig) {
              const viewportExport = `\nexport const viewport: Viewport = {\n${viewportConfig}}\n`
              newContent = newContent.replace(newMetadata, newMetadata + viewportExport)
            }
          }
        }
        
        if (hasChanges) {
          fs.writeFileSync(filePath, newContent)
          console.log(`✅ Corrigido: ${path.relative(process.cwd(), filePath)}`)
          fixedCount++
        }
      }
    } catch (error) {
      console.error(`❌ Erro ao processar ${filePath}:`, error)
    }
  }
  
  console.log(`✅ ${fixedCount} arquivos corrigidos!`)
  
  // Limpar cache do Next.js
  console.log('🧹 Limpando cache do Next.js...')
  try {
    if (fs.existsSync('.next')) {
      fs.rmSync('.next', { recursive: true, force: true })
      console.log('✅ Cache limpo!')
    }
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error)
  }
}

fixMetadataWarnings().catch(console.error)
