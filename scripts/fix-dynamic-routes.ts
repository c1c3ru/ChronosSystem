import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

async function fixDynamicRoutes() {
  console.log('🔧 Corrigindo rotas dinâmicas...')

  // Encontrar todas as rotas de API
  const apiRoutes = await glob('app/api/**/route.ts', {
    cwd: process.cwd(),
    absolute: true,
  })

  let fixedCount = 0

  for (const routePath of apiRoutes) {
    try {
      const content = fs.readFileSync(routePath, 'utf8')

      // Verificar se usa getServerSession e não tem dynamic export
      if (content.includes('getServerSession') && !content.includes('export const dynamic')) {
        console.log(`📝 Corrigindo: ${path.relative(process.cwd(), routePath)}`)

        // Encontrar a posição após os imports
        const lines = content.split('\n')
        let insertIndex = 0

        // Encontrar o final dos imports
        for (let i = 0; i < lines.length; i++) {
          if (
            lines[i].startsWith('import ') ||
            lines[i].startsWith('//') ||
            lines[i].trim() === ''
          ) {
            insertIndex = i + 1
          } else {
            break
          }
        }

        // Inserir a configuração dinâmica
        lines.splice(
          insertIndex,
          0,
          '',
          '// Force dynamic rendering',
          "export const dynamic = 'force-dynamic'"
        )

        const newContent = lines.join('\n')
        fs.writeFileSync(routePath, newContent)
        fixedCount++
      }
    } catch (error) {
      console.error(`❌ Erro ao processar ${routePath}:`, error)
    }
  }

  console.log(`✅ ${fixedCount} rotas corrigidas!`)
}

fixDynamicRoutes().catch(console.error)
