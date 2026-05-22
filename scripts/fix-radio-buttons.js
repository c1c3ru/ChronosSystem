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

  // Verificar se já tem tratamento de radio
  if (content.includes("} else if (type === 'radio')")) {
    console.log(`✓  ${folder}: já tem tratamento de radio buttons`)
    return
  }

  // Padrão 1: checkbox com value/''
  const pattern1 =
    /if \(type === 'checkbox'\) \{\s+const checked = \(e\.target as HTMLInputElement\)\.checked\s+setFormData\(\(prev: any\) => \(\{ \.\.\.prev, \[name\]: checked \? value : '' \}\)\)\s+\} else \{/g

  // Padrão 2: checkbox com 'true'/'false'
  const pattern2 =
    /if \(type === 'checkbox'\) \{\s+const checked = \(e\.target as HTMLInputElement\)\.checked\s+setFormData\(\(prev: any\) => \(\{ \.\.\.prev, \[name\]: checked \? 'true' : 'false' \}\)\)\s+\} else \{/g

  let modified = false

  if (pattern1.test(content)) {
    content = content.replace(
      pattern1,
      `if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev: any) => ({ ...prev, [name]: checked ? value : '' }))
    } else if (type === 'radio') {
      // Radio buttons: sempre salvar o value quando selecionado
      setFormData((prev: any) => ({ ...prev, [name]: value }))
    } else {`
    )
    modified = true
  } else if (pattern2.test(content)) {
    content = content.replace(
      pattern2,
      `if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev: any) => ({ ...prev, [name]: checked ? 'true' : 'false' }))
    } else if (type === 'radio') {
      // Radio buttons: sempre salvar o value quando selecionado
      setFormData((prev: any) => ({ ...prev, [name]: value }))
    } else {`
    )
    modified = true
  }

  if (modified) {
    fs.writeFileSync(pagePath, content)
    console.log(`✅ ${folder}: adicionado tratamento de radio buttons`)
    totalFixed++
  } else {
    console.log(`⚠️  ${folder}: padrão não encontrado`)
  }
})

console.log(`\n✨ Total de arquivos corrigidos: ${totalFixed}`)
