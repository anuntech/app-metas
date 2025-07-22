#!/bin/bash

echo "🚀 Iniciando ambiente de teste local + ngrok"
echo "============================================="

# Verificar se ngrok está instalado
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok não está instalado"
    echo "💡 Instale com: sudo snap install ngrok (Linux) ou brew install ngrok (Mac)"
    exit 1
fi

# Verificar se npm/node está disponível
if ! command -v npm &> /dev/null; then
    echo "❌ npm não está instalado"
    exit 1
fi

echo "✅ Dependências verificadas"

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo "🧹 Limpando processos..."
    kill $SERVER_PID 2>/dev/null || true
    kill $NGROK_PID 2>/dev/null || true
    echo "✅ Processos finalizados"
    exit 0
}

# Configurar trap para limpar ao sair
trap cleanup SIGINT SIGTERM

# Iniciar servidor de desenvolvimento
echo "📦 Iniciando servidor Next.js..."
npm run dev &
SERVER_PID=$!

# Aguardar o servidor iniciar
echo "⏳ Aguardando servidor iniciar..."
sleep 10

# Verificar se o servidor está rodando
if ! curl -s http://localhost:3000/api/health > /dev/null; then
    echo "❌ Servidor não iniciou corretamente"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Servidor rodando em http://localhost:3000"

# Iniciar ngrok
echo "🌐 Iniciando ngrok..."
ngrok http 3000 --log=stdout &
NGROK_PID=$!

# Aguardar ngrok iniciar
echo "⏳ Aguardando ngrok iniciar..."
sleep 5

# Verificar se ngrok está rodando
if ! curl -s http://localhost:4040/api/tunnels > /dev/null; then
    echo "❌ ngrok não iniciou corretamente"
    kill $SERVER_PID 2>/dev/null || true
    kill $NGROK_PID 2>/dev/null || true
    exit 1
fi

echo "✅ ngrok rodando - Dashboard: http://localhost:4040"

# Mostrar URL do ngrok
echo ""
echo "🔍 Buscando URL pública do ngrok..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[] | select(.proto=="https") | .public_url' 2>/dev/null)

if [ -n "$NGROK_URL" ] && [ "$NGROK_URL" != "null" ]; then
    echo "✅ URL pública: $NGROK_URL"
else
    echo "⚠️ Não foi possível obter a URL do ngrok automaticamente"
    echo "   Verifique em: http://localhost:4040"
fi

echo ""
echo "🎯 AMBIENTE PRONTO!"
echo "=================="
echo "🏠 Local:   http://localhost:3000"
echo "🌐 Público: $NGROK_URL"
echo "📊 Ngrok:   http://localhost:4040"
echo ""
echo "💡 Para executar os testes, abra outro terminal e rode:"
echo "   node scripts/test-local-with-ngrok.js"
echo ""
echo "⏹️ Pressione Ctrl+C para parar tudo"

# Aguardar indefinidamente
wait 