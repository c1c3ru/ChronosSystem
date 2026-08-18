const fs = require('fs')
const path = require('path')

const filePath = path.join(
  __dirname,
  '..',
  'app/documents/internship-registration-request/page.tsx'
)
let content = fs.readFileSync(filePath, 'utf8')

const conflictRegex = /<<<<<<< HEAD[\s\S]*?=======([\s\S]*?)>>>>>>> main/
if (conflictRegex.test(content)) {
  content = content.replace(conflictRegex, '$1')
  fs.writeFileSync(filePath, content, 'utf8')
  console.log('Conflict resolved successfully!')
} else {
  console.log('No conflict pattern found!')
}
