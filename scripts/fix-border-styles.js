const fs = require('fs')
const path = require('path')

const templatesDir = path.join(process.cwd(), 'components/templates')
const files = fs.readdirSync(templatesDir).filter((file) => file.endsWith('.tsx'))

files.forEach((file) => {
  const filePath = path.join(templatesDir, file)
  let content = fs.readFileSync(filePath, 'utf8')
  let originalContent = content

  // Substituições de borda
  // border: 1 -> borderWidth: 1, borderStyle: 'solid'
  content = content.replace(/border:\s*1\s*,/g, "borderWidth: 1, borderStyle: 'solid',")

  // borderTop: 1 -> borderTopWidth: 1, borderTopStyle: 'solid'
  content = content.replace(/borderTop:\s*1\s*,/g, "borderTopWidth: 1, borderTopStyle: 'solid',")

  // borderBottom: 1 -> borderBottomWidth: 1, borderBottomStyle: 'solid'
  content = content.replace(
    /borderBottom:\s*1\s*,/g,
    "borderBottomWidth: 1, borderBottomStyle: 'solid',"
  )

  // borderLeft: 1 -> borderLeftWidth: 1, borderLeftStyle: 'solid'
  content = content.replace(/borderLeft:\s*1\s*,/g, "borderLeftWidth: 1, borderLeftStyle: 'solid',")

  // borderRight: 1 -> borderRightWidth: 1, borderRightStyle: 'solid'
  content = content.replace(
    /borderRight:\s*1\s*,/g,
    "borderRightWidth: 1, borderRightStyle: 'solid',"
  )

  // Casos onde pode não ter vírgula (último item do objeto), embora raro com prettier
  content = content.replace(/border:\s*1\s*}/g, "borderWidth: 1, borderStyle: 'solid' }")
  content = content.replace(/borderTop:\s*1\s*}/g, "borderTopWidth: 1, borderTopStyle: 'solid' }")
  content = content.replace(
    /borderBottom:\s*1\s*}/g,
    "borderBottomWidth: 1, borderBottomStyle: 'solid' }"
  )
  content = content.replace(
    /borderLeft:\s*1\s*}/g,
    "borderLeftWidth: 1, borderLeftStyle: 'solid' }"
  )
  content = content.replace(
    /borderRight:\s*1\s*}/g,
    "borderRightWidth: 1, borderRightStyle: 'solid' }"
  )

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content)
    console.log(`Updated styles in ${file}`)
  } else {
    console.log(`No changes needed for ${file}`)
  }
})
