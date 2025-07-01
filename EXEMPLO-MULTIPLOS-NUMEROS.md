# 📱 Exemplo: Envio para Múltiplos Números

## 🔧 Configuração de Exemplo

```bash
# No seu arquivo .env
ENABLE_PDF_SCHEDULER=true
EXTERNAL_API_URL=https://api.wts.chat/chat/v1/message/send
EXTERNAL_API_METHOD=POST
EXTERNAL_API_AUTH_TOKEN=pn_vJbb3rm1pPlJL0yiIW8ravlkQewNt3jL4rKk0qUPg

# Enviar para 4 números diferentes
WTS_FROM_PHONE=(11) 97199-7520
WTS_TO_PHONE=(11) 97997-9161,(11) 99999-9999,(11) 88888-8888,(11) 77777-7777

WTS_MESSAGE_TEXT=📊 Relatório diário do painel de resultados
```

## 🚀 Execução Automática (11h da manhã)

```bash
=== INICIANDO TAREFA DIÁRIA DE PDF ===
Horário: 01/07/2025, 11:00:00

1. Gerando PDF diário...
✅ PDF gerado com sucesso: painel-resultados-2025-07-ate-2025-07-01.pdf

2. URL do PDF: https://seudominio.com/pdfs/daily-reports/painel-resultados-2025-07-ate-2025-07-01.pdf

3. Enviando para WTS Chat API...
📱 Enviando para 4 número(s): (11) 97997-9161, (11) 99999-9999, (11) 88888-8888, (11) 77777-7777

📤 Enviando para (11) 97997-9161 (1/4)...
✅ PDF enviado com sucesso para (11) 97997-9161

📤 Enviando para (11) 99999-9999 (2/4)...
✅ PDF enviado com sucesso para (11) 99999-9999

📤 Enviando para (11) 88888-8888 (3/4)...
✅ PDF enviado com sucesso para (11) 88888-8888

📤 Enviando para (11) 77777-7777 (4/4)...
✅ PDF enviado com sucesso para (11) 77777-7777

📊 RESUMO DO ENVIO:
✅ Sucessos: 4
❌ Erros: 0

✅ Números enviados com sucesso:
  - (11) 97997-9161
  - (11) 99999-9999
  - (11) 88888-8888
  - (11) 77777-7777

✅ PDF enviado via WTS Chat com sucesso
=== TAREFA DIÁRIA CONCLUÍDA COM SUCESSO ===
```

## 🧪 Teste Manual

```bash
# Testar configuração
node scripts/test-wts-config.js

# Resultado esperado:
🚀 TESTE DE CONFIGURAÇÃO WTS CHAT API

🔍 VERIFICANDO CONFIGURAÇÃO WTS CHAT API
============================================
📋 VARIÁVEIS OBRIGATÓRIAS:
✅ EXTERNAL_API_URL: https://api.wts.chat...
✅ EXTERNAL_API_AUTH_TOKEN: pn_vJbb3rm1pPlJL0yiI...
✅ WTS_FROM_PHONE: (11) 97199-7520
✅ WTS_TO_PHONE: (11) 97997-9161,(...

✅ CONFIGURAÇÃO COMPLETA!

🧪 TESTANDO WTS CHAT API...
📱 Testando envio para 4 número(s): (11) 97997-9161, (11) 99999-9999, (11) 88888-8888, (11) 77777-7777

📤 Testando (11) 97997-9161 (1/4)...
✅ Sucesso para (11) 97997-9161 - Status: 200
📤 Testando (11) 99999-9999 (2/4)...
✅ Sucesso para (11) 99999-9999 - Status: 200
📤 Testando (11) 88888-8888 (3/4)...
✅ Sucesso para (11) 88888-8888 - Status: 200
📤 Testando (11) 77777-7777 (4/4)...
✅ Sucesso para (11) 77777-7777 - Status: 200

📊 RESUMO DO TESTE:
✅ Sucessos: 4
❌ Erros: 0

✅ TESTE WTS CHAT SUCESSO!
📱 Verifique se recebeu as mensagens no WhatsApp (4 números)

🎉 TUDO CONFIGURADO CORRETAMENTE!
✅ Sistema pronto para enviar PDFs via WhatsApp
```

## ⚠️ Cenário com Erros

Se algum número tiver problema:

```bash
📱 Enviando para 4 número(s): (11) 97997-9161, (11) 99999-9999, (11) 88888-8888, (11) 77777-7777

📤 Enviando para (11) 97997-9161 (1/4)...
✅ PDF enviado com sucesso para (11) 97997-9161

📤 Enviando para (11) 99999-9999 (2/4)...
❌ Erro ao enviar para (11) 99999-9999: Erro na WTS Chat API para (11) 99999-9999: 400 - Invalid phone number

📤 Enviando para (11) 88888-8888 (3/4)...
✅ PDF enviado com sucesso para (11) 88888-8888

📤 Enviando para (11) 77777-7777 (4/4)...
✅ PDF enviado com sucesso para (11) 77777-7777

📊 RESUMO DO ENVIO:
✅ Sucessos: 3
❌ Erros: 1

❌ Números com erro:
  - (11) 99999-9999: Erro na WTS Chat API para (11) 99999-9999: 400 - Invalid phone number

✅ Números enviados com sucesso:
  - (11) 97997-9161
  - (11) 88888-8888
  - (11) 77777-7777
```

## 📋 Payload Enviado (para cada número)

```json
{
  "body": {
    "text": "📊 Relatório diário do painel de resultados",
    "fileUrl": "https://seudominio.com/pdfs/daily-reports/painel-resultados-2025-07-ate-2025-07-01.pdf"
  },
  "from": "(11) 97199-7520",
  "to": "(11) 97997-9161"  // Um para cada número
}
```

## 🕐 Funcionalidades

- ✅ **Delay entre envios**: 1 segundo entre cada número (evita rate limit)
- ✅ **Logs detalhados**: Progresso individual para cada número  
- ✅ **Tolerância a falhas**: Continua enviando mesmo se um número falhar
- ✅ **Resumo final**: Mostra sucessos e erros
- ✅ **Flexibilidade**: Aceita espaços na configuração dos números

## 🔧 Comandos Úteis

```bash
# Ver configuração atual
echo "Números: $WTS_TO_PHONE"

# Contar quantos números
echo $WTS_TO_PHONE | tr ',' '\n' | wc -l

# Testar apenas configuração
node scripts/test-wts-config.js

# Executar envio imediato
node scripts/test-daily-pdf.js schedule
``` 