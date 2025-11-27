const fs = require('fs');
const path = require('path');

const documentsDir = path.join(process.cwd(), 'app/documents');
const folders = fs.readdirSync(documentsDir).filter(file => {
    const fullPath = path.join(documentsDir, file);
    return fs.statSync(fullPath).isDirectory();
});

const importLine = "import { maskCPF, maskCNPJ, maskCEP, maskPhone } from '@/lib/input-masks'";

const maskLogic = `    let maskedValue = value

    // Aplicar máscaras baseado no nome do campo
    if (name.includes('cpf')) {
      maskedValue = maskCPF(value)
    } else if (name.includes('cnpj')) {
      maskedValue = maskCNPJ(value)
    } else if (name.includes('zip') || name.includes('cep')) {
      maskedValue = maskCEP(value)
    } else if (name.includes('phone') || name.includes('telefone')) {
      maskedValue = maskPhone(value)
    }

    // Atualizar o valor do input com a máscara
    if (maskedValue !== value && e.target instanceof HTMLInputElement) {
      e.target.value = maskedValue
    }
`;

folders.forEach(folder => {
    const pagePath = path.join(documentsDir, folder, 'page.tsx');

    if (!fs.existsSync(pagePath)) {
        console.log(`⏭️  Pulando ${folder} (sem page.tsx)`);
        return;
    }

    let content = fs.readFileSync(pagePath, 'utf8');

    // Verificar se já tem o import
    if (content.includes('input-masks')) {
        console.log(`✅ ${folder} já tem máscaras`);
        return;
    }

    // Adicionar import após outros imports
    const lastImportMatch = content.match(/import .+ from .+\n(?!import)/);
    if (lastImportMatch) {
        const insertPos = lastImportMatch.index + lastImportMatch[0].length;
        content = content.slice(0, insertPos) + importLine + '\n' + content.slice(insertPos);
    }

    // Procurar handleInputChange e adicionar lógica de máscara
    const handleInputChangeRegex = /const handleInputChange = \(e: React\.ChangeEvent<[^>]+>\) => \{\s*const \{ name, value, type \} = e\.target/;
    const match = content.match(handleInputChangeRegex);

    if (match) {
        const insertPos = match.index + match[0].length;
        content = content.slice(0, insertPos) + '\n' + maskLogic + content.slice(insertPos);

        // Substituir setFormData para usar maskedValue
        content = content.replace(
            /setFormData\(\(prev: any\) => \(\{ \.\.\.prev, \[name\]: value \}\)\)/g,
            'setFormData((prev: any) => ({ ...prev, [name]: maskedValue }))'
        );

        fs.writeFileSync(pagePath, content);
        console.log(`✅ Máscaras adicionadas em ${folder}`);
    } else {
        console.log(`⚠️  ${folder}: handleInputChange não encontrado`);
    }
});
