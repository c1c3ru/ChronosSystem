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

    // 1. Adicionar import de maskCurrency se não existir
    if (!content.includes('maskCurrency')) {
        // Encontrar a linha de import das máscaras
        const importPattern = /import \{ ([^}]+) \} from '@\/lib\/input-masks'/;
        const match = content.match(importPattern);

        if (match) {
            const currentImports = match[1];
            const newImports = currentImports + ', maskCurrency';
            content = content.replace(importPattern, `import { ${newImports} } from '@/lib/input-masks'`);
            modified = true;
        }
    }

    // 2. Adicionar lógica de máscara de moeda no handleInputChange
    // Procurar onde está a lógica de máscaras
    const maskLogicPattern = /(} else if \(name\.includes\('phone'\) \|\| name\.includes\('telefone'\)\) \{\s+maskedValue = maskPhone\(value\)\s+})/;

    if (maskLogicPattern.test(content) && !content.includes("name.includes('value')")) {
        content = content.replace(
            maskLogicPattern,
            `} else if (name.includes('phone') || name.includes('telefone')) {
      maskedValue = maskPhone(value)
    } else if (name.includes('value') || name.includes('valor')) {
      maskedValue = maskCurrency(value)
    }`
        );
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(pagePath, content);
        console.log(`✅ ${folder}: adicionada máscara de moeda`);
        totalFixed++;
    } else {
        console.log(`✓  ${folder}: já tem máscara de moeda ou não precisa`);
    }
});

console.log(`\n✨ Total de arquivos corrigidos: ${totalFixed}`);
