const fs = require('fs');
const path = require('path');

const documentsDir = path.join(process.cwd(), 'app/documents');
const folders = fs.readdirSync(documentsDir).filter(file => {
    const fullPath = path.join(documentsDir, file);
    return fs.statSync(fullPath).isDirectory();
});

let totalRenamed = 0;

folders.forEach(folder => {
    const pagePath = path.join(documentsDir, folder, 'page.tsx');

    if (!fs.existsSync(pagePath)) {
        return;
    }

    let content = fs.readFileSync(pagePath, 'utf8');

    // Verificar se usa handleChange (não handleInputChange)
    if (content.includes('handleChange') && !content.includes('handleInputChange')) {
        // Renomear a declaração da função
        content = content.replace(
            /const handleChange = /g,
            'const handleInputChange = '
        );

        // Renomear todas as chamadas onChange={handleChange}
        content = content.replace(
            /onChange=\{handleChange\}/g,
            'onChange={handleInputChange}'
        );

        // Renomear handleScheduleChange se existir (não deve ser afetado)
        // Já está correto, pois é específico

        fs.writeFileSync(pagePath, content);
        console.log(`✅ ${folder}: handleChange → handleInputChange`);
        totalRenamed++;
    } else if (content.includes('handleInputChange')) {
        console.log(`✓  ${folder}: já usa handleInputChange`);
    }
});

console.log(`\n✨ Total de arquivos padronizados: ${totalRenamed}`);
