const fs = require('fs');
const path = require('path');

const templatesDir = path.join(process.cwd(), 'components/templates');
const files = fs.readdirSync(templatesDir).filter(file => file.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(templatesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Ignorar se já tiver o import (como no InternshipRegistrationDocument.tsx que acabei de editar)
    if (content.includes("import { getAssetUrl }")) {
        console.log(`Skipping ${file} (already updated)`);
        return;
    }

    // Adicionar import
    const importStatement = "import { getAssetUrl } from '@/lib/pdf-generator-react'";
    if (content.includes("import { Document")) {
        content = content.replace(
            "import { Document",
            `${importStatement}\nimport { Document`
        );
    } else if (content.includes("import React")) {
        content = content.replace(
            "import React from 'react'",
            `import React from 'react'\n${importStatement}`
        );
    }

    // Substituir src="..." por src={getAssetUrl("...")}
    // Regex para capturar src="/assets/..." ou src='/assets/...'
    content = content.replace(/src="(\/assets\/[^"]+)"/g, 'src={getAssetUrl("$1")}');
    content = content.replace(/src='(\/assets\/[^']+)'/g, "src={getAssetUrl('$1')}");

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
