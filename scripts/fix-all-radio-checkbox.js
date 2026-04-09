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
    console.log(`✓  ${folder}: já tem tratamento completo`)
    return
  }

  let modified = false

  // Padrão 1: checkbox com value/'' (adicionar radio)
  const pattern1 =
    /if \(type === 'checkbox'\) \{\s+const checked = \(e\.target as HTMLInputElement\)\.checked\s+setFormData\(\(prev: any\) => \(\{ \.\.\.prev, \[name\]: checked \? value : '' \}\)\)\s+\} else \{/g

  // Padrão 2: checkbox com 'true'/'false' (adicionar radio)
  const pattern2 =
    /if \(type === 'checkbox'\) \{\s+const checked = \(e\.target as HTMLInputElement\)\.checked\s+setFormData\(\(prev: any\) => \(\{ \.\.\.prev, \[name\]: checked \? 'true' : 'false' \}\)\)\s+\} else \{/g

  // Padrão 3: sem tratamento de checkbox/radio (adicionar tudo)
  const pattern3 = /setFormData\(prev => \(\{ \.\.\.prev, \[name\]: maskedValue \}\)\)\s+\}/
  const pattern3Alt =
    /setFormData\(\(prev: any\) => \(\{ \.\.\.prev, \[name\]: maskedValue \}\)\)\s+\}/

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
  } else if (pattern3.test(content)) {
    content = content.replace(
      pattern3,
      `// Tratamento especial para checkboxes e radio buttons
    const { type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked ? value : '' }))
    } else if (type === 'radio') {
      // Radio buttons: sempre salvar o value quando selecionado
      setFormData(prev => ({ ...prev, [name]: value }))
    } else {
      setFormData(prev => ({ ...prev, [name]: maskedValue }))
    }
  }`
    )
    modified = true
  } else if (pattern3Alt.test(content)) {
    content = content.replace(
      pattern3Alt,
      `// Tratamento especial para checkboxes e radio buttons
    const { type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev: any) => ({ ...prev, [name]: checked ? value : '' }))
    } else if (type === 'radio') {
      // Radio buttons: sempre salvar o value quando selecionado
      setFormData((prev: any) => ({ ...prev, [name]: value }))
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: maskedValue }))
    }
  }`
    )
    modified = true
  }

  if (modified) {
    fs.writeFileSync(pagePath, content)
    console.log(`✅ ${folder}: adicionado tratamento de radio/checkbox`)
    totalFixed++
  } else {
    console.log(`⚠️  ${folder}: padrão não encontrado ou já corrigido`)
  }
})

console.log(`\n✨ Total de arquivos corrigidos: ${totalFixed}`)
