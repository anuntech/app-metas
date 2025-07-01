# 🚀 Guia Rápido - Sistema de PDF Diário

Sistema automático para gerar PDFs diariamente às 11h e enviar para API externa.

## ✅ Status: FUNCIONANDO
- ✅ PDF gerado com sucesso
- ✅ Arquivo salvo em `public/pdfs/daily-reports/`
- ✅ APIs funcionando corretamente

## 🛠️ Configuração Rápida

### 1. Configurar WTS Chat API (OBRIGATÓRIO)

Adicione no seu `.env` ou `.env.local`:

```bash
# Habilitar em desenvolvimento
ENABLE_PDF_SCHEDULER=true

# WTS Chat API
EXTERNAL_API_URL=https://api.wts.chat/chat/v1/message/send
EXTERNAL_API_METHOD=POST
EXTERNAL_API_AUTH_TOKEN=pn_vJbb3rm1pPlJL0yiIW8ravlkQewNt3jL4rKk0qUPg

# Números de telefone (OBRIGATÓRIO)
WTS_FROM_PHONE=(11) 97199-7520
WTS_TO_PHONE=(11) 97997-9161,(11) 99999-9999,(11) 88888-8888

# Mensagem personalizada (OPCIONAL)
WTS_MESSAGE_TEXT=Relatório diário do painel de resultados
```

### 2. Testar o Sistema

```bash
# Teste rápido via curl
curl http://localhost:3000/api/pdf/daily-report

# Teste completo com script
node scripts/test-daily-pdf.js

# Apenas gerar PDF
node scripts/test-daily-pdf.js generate

# Executar agendador imediatamente
node scripts/test-daily-pdf.js schedule
```

## 📊 Como Funciona

1. **⏰ Agendamento**: Todo dia às 11:00 AM
2. **📅 Período**: Do dia 1 do mês até hoje
3. **💾 Salvamento**: `public/pdfs/daily-reports/`
4. **🌐 Envio**: POST para sua API externa com a URL do PDF

## 🔗 APIs Disponíveis

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/pdf/daily-report` | GET | Gera PDF do dia |
| `/api/schedule/daily-pdf` | GET | Testa agendador |
| `/api/schedule/daily-pdf` | POST | Executa imediatamente |

## 📄 Exemplo de PDF Gerado

**Arquivo**: `painel-resultados-2025-07-ate-2025-07-01.pdf`  
**URL**: `http://seu-dominio.com/pdfs/daily-reports/painel-resultados-2025-07-ate-2025-07-01.pdf`

## 📡 Payload Enviado para WTS Chat API

```json
{
  "body": {
    "text": "Relatório diário do painel de resultados",
    "fileUrl": "https://seu-dominio.com/pdfs/daily-reports/painel-resultados-2025-07-ate-2025-07-01.pdf"
  },
  "from": "(11) 97199-7520",
  "to": "(11) 97997-9161"
}
```

## 🧪 Testes Rápidos

### Teste WTS Chat API
1. Configure as variáveis no `.env`:
   ```bash
   EXTERNAL_API_URL=https://api.wts.chat/chat/v1/message/send
   EXTERNAL_API_AUTH_TOKEN=pn_vJbb3rm1pPlJL0yiIW8ravlkQewNt3jL4rKk0qUPg
   WTS_FROM_PHONE=(11) 97199-7520
   WTS_TO_PHONE=(11) 97997-9161
   ```

2. Execute o teste:
   ```bash
   node scripts/test-daily-pdf.js schedule
   ```

3. Verifique se recebeu a mensagem no WhatsApp com o PDF anexado

### Teste Manual da API WTS
```bash
curl --request POST \
     --url https://api.wts.chat/chat/v1/message/send \
     --header 'Authorization: pn_vJbb3rm1pPlJL0yiIW8ravlkQewNt3jL4rKk0qUPg' \
     --header 'accept: application/json' \
     --header 'content-type: application/*+json' \
     --data '{
       "body": {
         "text": "Teste manual",
         "fileUrl": "https://i0.wp.com/espaferro.com.br/wp-content/uploads/2024/06/placeholder.png?ssl=1"
       },
       "from": "(11) 97199-7520",
       "to": "(11) 97997-9161"
     }'
```

## 🔧 Comandos Úteis

```bash
# Ver PDFs gerados
ls -la public/pdfs/daily-reports/

# Ver logs do agendador
# (nos logs da aplicação Next.js)

# Limpar PDFs antigos
rm public/pdfs/daily-reports/*.pdf

# Verificar configuração
node -e "console.log(process.env.EXTERNAL_API_URL)"
```

## ⚠️ Próximos Passos

1. **Configure sua API externa** - substitua a URL de teste
2. **Teste em produção** - o agendador roda automaticamente às 11h
3. **Monitore os logs** - para verificar execução e erros
4. **Implemente limpeza** - para não acumular muitos PDFs

## 🆘 Problemas Comuns

**PDF não é gerado**
```bash
# Verifique se a API de dados está funcionando
curl http://localhost:3000/api/dashboard/progress
```

**Agendador não executa**
```bash
# Verifique se está habilitado
echo $ENABLE_PDF_SCHEDULER

# Deve mostrar logs no console:
# "🕐 Agendador de PDF diário iniciado"
```

**WTS Chat API não responde**
```bash
# Verificar variáveis de ambiente
echo "URL: $EXTERNAL_API_URL"
echo "Token: $EXTERNAL_API_AUTH_TOKEN"
echo "From: $WTS_FROM_PHONE"
echo "To: $WTS_TO_PHONE"

# Teste manual da API
curl --request POST \
     --url "$EXTERNAL_API_URL" \
     --header "Authorization: $EXTERNAL_API_AUTH_TOKEN" \
     --header 'accept: application/json' \
     --header 'content-type: application/*+json' \
     --data "{
       \"body\": {
         \"text\": \"Teste manual\",
         \"fileUrl\": \"https://example.com/test.pdf\"
       },
       \"from\": \"$WTS_FROM_PHONE\",
       \"to\": \"$WTS_TO_PHONE\"
     }"
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte: `README-SCHEDULER.md`

**Sistema criado e testado com sucesso! 🎉** 