const fs = require('fs')
const path = require('path')

const logoPath = path.join(process.cwd(), 'public/assets/logoifce.png')
const brasaoPath = path.join(process.cwd(), 'public/assets/brasao.png')

const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' })
const brasaoBase64 = fs.readFileSync(brasaoPath, { encoding: 'base64' })

console.log('LOGO_IFCE_BASE64:')
console.log(`data:image/png;base64,${logoBase64}`)
console.log('\nBRASAO_BASE64:')
console.log(`data:image/png;base64,${brasaoBase64}`)
