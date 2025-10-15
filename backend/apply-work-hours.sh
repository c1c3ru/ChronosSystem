#!/bin/bash

echo "🚀 Aplicando Sistema de Carga Horária..."
echo ""

# Gerar Prisma Client
echo "📦 Gerando Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Erro ao gerar Prisma Client"
    exit 1
fi

echo "✅ Prisma Client gerado com sucesso!"
echo ""

# Aplicar migração
echo "🗄️  Aplicando migração no banco de dados..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Erro ao aplicar migração"
    echo ""
    echo "💡 Tente criar uma nova migração:"
    echo "   npx prisma migrate dev --name add_work_hours"
    exit 1
fi

echo "✅ Migração aplicada com sucesso!"
echo ""

echo "🎉 Sistema de Carga Horária instalado!"
echo ""
echo "📝 Próximos passos:"
echo "  1. Reinicie o backend: npm run start:dev"
echo "  2. Teste os endpoints: curl http://localhost:4000/api/work-hours/daily"
echo "  3. Configure contratos dos estagiários via PATCH /users/:id"
echo ""
echo "📚 Documentação:"
echo "  - WORK_HOURS.md"
echo "  - IMPLEMENTACAO_CARGA_HORARIA.md"
