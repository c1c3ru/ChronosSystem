#!/bin/bash

# Script para auditar conformidade com Design Tokens
# Procura por classes hardcoded que deveriam usar tokens

echo "🔍 Auditando conformidade com Design Tokens..."
echo ""

# Cores hardcoded que deveriam usar tokens
echo "❌ Procurando por cores hardcoded (bg-green-*, bg-blue-*, bg-red-*, etc)..."
echo ""

HARDCODED_COLORS=$(grep -r "bg-\(green\|blue\|red\|yellow\|purple\|pink\|orange\)-[0-9]" \
  components/ app/ \
  --include="*.tsx" --include="*.ts" \
  --exclude-dir=".next" \
  --exclude-dir="node_modules" 2>/dev/null | wc -l)

if [ "$HARDCODED_COLORS" -gt 0 ]; then
  echo "⚠️  Encontradas $HARDCODED_COLORS ocorrências de cores hardcoded:"
  grep -r "bg-\(green\|blue\|red\|yellow\|purple\|pink\|orange\)-[0-9]" \
    components/ app/ \
    --include="*.tsx" --include="*.ts" \
    --exclude-dir=".next" \
    --exclude-dir="node_modules" 2>/dev/null | head -20
else
  echo "✅ Nenhuma cor hardcoded encontrada"
fi

echo ""
echo "---"
echo ""

# Espaçamento hardcoded
echo "❌ Procurando por espaçamento hardcoded (p-[0-9], m-[0-9], gap-[0-9])..."
echo ""

HARDCODED_SPACING=$(grep -r "className=\".*\(p-\|m-\|gap-\)[0-9]" \
  components/ app/ \
  --include="*.tsx" \
  --exclude-dir=".next" \
  --exclude-dir="node_modules" 2>/dev/null | wc -l)

if [ "$HARDCODED_SPACING" -gt 0 ]; then
  echo "⚠️  Encontradas $HARDCODED_SPACING ocorrências de espaçamento direto"
else
  echo "✅ Espaçamento usando tokens"
fi

echo ""
echo "---"
echo ""

# Componentes não reutilizáveis
echo "❌ Procurando por botões inline (não usando componente Button)..."
echo ""

INLINE_BUTTONS=$(grep -r "<button" \
  components/ app/documents/ \
  --include="*.tsx" \
  --exclude-dir=".next" \
  --exclude-dir="node_modules" 2>/dev/null | wc -l)

if [ "$INLINE_BUTTONS" -gt 0 ]; then
  echo "⚠️  Encontrados $INLINE_BUTTONS botões inline:"
  grep -r "<button" \
    components/ app/documents/ \
    --include="*.tsx" \
    --exclude-dir=".next" \
    --exclude-dir="node_modules" 2>/dev/null | head -10
else
  echo "✅ Todos os botões usam componente Button"
fi

echo ""
echo "---"
echo ""

# Resumo
echo "📊 RESUMO DA AUDITORIA"
echo ""
echo "Cores hardcoded: $HARDCODED_COLORS"
echo "Espaçamento direto: $HARDCODED_SPACING"
echo "Botões inline: $INLINE_BUTTONS"
echo ""

if [ "$HARDCODED_COLORS" -eq 0 ] && [ "$HARDCODED_SPACING" -eq 0 ] && [ "$INLINE_BUTTONS" -eq 0 ]; then
  echo "✅ Aplicação está em conformidade com Design Tokens!"
  exit 0
else
  echo "⚠️  Aplicação precisa de ajustes para conformidade com Design Tokens"
  exit 1
fi
