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

    // Padrão 1: FormData sendo usado em handleGeneratePDF
    const formDataPattern1 = /const currentFormData = new FormData\(formRef\.current\)\s+const data = Object\.fromEntries\(currentFormData\.entries\(\)\)/g;

    if (formDataPattern1.test(content)) {
        content = content.replace(
            formDataPattern1,
            '// Usar o estado formData em vez de FormData para capturar radio buttons e checkboxes\n      const data = { ...formData }'
        );
        modified = true;
    }

    // Padrão 2: Adicionar schedule ou outros dados após
    // Já está sendo tratado no padrão acima

    if (modified) {
        fs.writeFileSync(pagePath, content);
        console.log(`✅ ${folder}: FormData → formData state`);
        totalFixed++;
    } else if (content.includes('const data = { ...formData }') || content.includes('formData,')) {
        console.log(`✓  ${folder}: já usa formData state`);
    } else {
        console.log(`⚠️  ${folder}: padrão não encontrado`);
    }
});

console.log(`\n✨ Total de arquivos corrigidos: ${totalFixed}`);
