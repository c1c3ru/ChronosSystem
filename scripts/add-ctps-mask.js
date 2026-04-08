const fs = require('fs');
const path = require('path');

const documentsDir = path.join(process.cwd(), 'app/documents');
const folders = fs.readdirSync(documentsDir).filter(file => {
    const fullPath = path.join(documentsDir, file);
    return fs.statSync(fullPath).isDirectory();
});

let totalFixed = 0;

folders.forEach(folder => {
    const pagePath = path.join(documentsDir, folder, 'page.tsx');

    if (!fs.existsSync(pagePath)) {
        return;
    }

    let content = fs.readFileSync(pagePath, 'utf8');
    let modified = false;

    // 1. Adicionar import de maskCTPS se não existir
    if (!content.includes('maskCTPS')) {
        const importPattern = /import \{ ([^}]+) \} from '@\/lib\/input-masks'/;
        const match = content.match(importPattern);

        if (match) {
            const currentImports = match[1];
            const newImports = currentImports.replace('maskRG', 'maskRG, maskCTPS');
            content = content.replace(importPattern, `import { ${newImports} } from '@/lib/input-masks'`);
            modified = true;
        }
    }

    // 2. Adicionar lógica de máscara de CTPS no handleInputChange
    const rgPattern = /(} else if \(name\.includes\('rg'\)\) \{\s+maskedValue = maskRG\(value\)\s+})/;

    if (rgPattern.test(content) && !content.includes("name.includes('ctps')")) {
        content = content.replace(
            rgPattern,
            `} else if (name.includes('rg')) {
      maskedValue = maskRG(value)
    } else if (name.includes('ctps') || name.includes('carteira')) {
      maskedValue = maskCTPS(value)
    }`
        );
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(pagePath, content);
        console.log(`✅ ${folder}: adicionada máscara de CTPS`);
        totalFixed++;
    } else {
        console.log(`✓  ${folder}: já tem máscara de CTPS ou não precisa`);
    }
});

console.log(`\n✨ Total de arquivos corrigidos: ${totalFixed}`);
