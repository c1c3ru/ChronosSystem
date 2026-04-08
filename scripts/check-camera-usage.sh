#!/bin/bash

# Script para verificar quais aplicativos estão usando a câmera
# Uso: ./scripts/check-camera-usage.sh

echo "🔍 Verificando uso da câmera..."
echo ""

# Verificar processos que podem estar usando a câmera
echo "📹 Processos relacionados à câmera:"
ps aux | grep -i -E "(camera|video|webcam|chrome|firefox|safari)" | grep -v grep

echo ""
echo "🌐 Abas do navegador abertas:"
# Chrome
if pgrep chrome > /dev/null; then
    echo "  ✅ Chrome está rodando"
    chrome_tabs=$(pgrep chrome | wc -l)
    echo "     Processos Chrome: $chrome_tabs"
fi

# Firefox
if pgrep firefox > /dev/null; then
    echo "  ✅ Firefox está rodando"
    firefox_tabs=$(pgrep firefox | wc -l)
    echo "     Processos Firefox: $firefox_tabs"
fi

echo ""
echo "🎥 Dispositivos de vídeo:"
ls -la /dev/video* 2>/dev/null || echo "  ❌ Nenhum dispositivo de vídeo encontrado"

echo ""
echo "🔒 Verificando permissões:"
if command -v lsof > /dev/null; then
    echo "  Processos usando dispositivos de vídeo:"
    sudo lsof /dev/video* 2>/dev/null || echo "  ✅ Nenhum processo usando câmera"
else
    echo "  ⚠️ lsof não disponível para verificar uso detalhado"
fi

echo ""
echo "💡 SOLUÇÕES:"
echo "1. Feche outras abas do navegador que podem estar usando a câmera"
echo "2. Feche aplicativos como Zoom, Teams, Skype, etc."
echo "3. Reinicie o navegador completamente"
echo "4. Se necessário, reinicie o sistema"
