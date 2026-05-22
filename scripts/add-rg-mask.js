const fs = require('fs')
const path = require('path')

const documentsDir = path.join(process.cwd(), 'app/documents')
const folders = fs.readdirSync(documentsDir).filter((file) => {
  const fullPath = path.join(documentsDir, file)
  return fs.statSync(fullPath).isDirectory()
})

let totalFixed = 0

folders.forEach((folder) => {
  const pagePath = path.join(documentsDir, folder, 'page.tsx')

  if (!fs.existsSync(pagePath)) {
    return
  }

  let content = fs.readFileSync(pagePath, 'utf8')
  let modified = false

  // 1. Adicionar import de maskRG se não existir
  if (!content.includes('maskRG')) {
    // Encontrar a linha de import das máscaras
    const importPattern = /import \{ ([^}]+) \} from '@\/lib\/input-masks'/
    const match = content.match(importPattern)

    if (match) {
      const currentImports = match[1]
      // Adicionar maskRG após maskCPF
      const newImports = currentImports.replace('maskCPF', 'maskCPF, maskRG')
      content = content.replace(importPattern, `import { ${newImports} } from '@/lib/input-masks'`)
      modified = true
    }
  }

  // 2. Adicionar lógica de máscara de RG no handleInputChange
  // Procurar onde está a lógica de CPF
  const cpfPattern = /(if \(name\.includes\('cpf'\)\) \{\s+maskedValue = maskCPF\(value\)\s+})/

  if (cpfPattern.test(content) && !content.includes("name.includes('rg')")) {
    content = content.replace(
      cpfPattern,
      `if (name.includes('cpf')) {
      maskedValue = maskCPF(value)
    } else if (name.includes('rg')) {
      maskedValue = maskRG(value)
    }`
    )
    modified = true
  }

  if (modified) {
    fs.writeFileSync(pagePath, content)
    console.log(`✅ ${folder}: adicionada máscara de RG`)
    totalFixed++
  } else {
    console.log(`✓  ${folder}: já tem máscara de RG ou não precisa`)
  }
})

console.log(`\n✨ Total de arquivos corrigidos: ${totalFixed}`)
