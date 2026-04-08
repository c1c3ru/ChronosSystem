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

    // Adicionar : any ao data = { ...formData }
    const pattern = /const data = \{ \.\.\.formData \}/g;

    if (pattern.test(content)) {
        content = content.replace(pattern, 'const data: any = { ...formData }');
        fs.writeFileSync(pagePath, content);
        console.log(`✅ ${folder}: adicionado tipo any`);
        totalFixed++;
    } else if (content.includes('const data: any = { ...formData }')) {
        console.log(`✓  ${folder}: já tem tipo any`);
    }
});

console.log(`\n✨ Total de arquivos corrigidos: ${totalFixed}`);
