# ⚙️ Configuração WTS Chat API

## 📋 Variáveis Necessárias

Adicione estas variáveis no seu arquivo `.env` ou `.env.local`:

```bash
# Agendador
ENABLE_PDF_SCHEDULER=true

# WTS Chat API
EXTERNAL_API_URL=https://api.wts.chat/chat/v1/message/send
EXTERNAL_API_METHOD=POST
EXTERNAL_API_AUTH_TOKEN=pn_vJbb3rm1pPlJL0yiIW8ravlkQewNt3jL4rKk0qUPg

# ADICIONAR ESTAS VARIÁVEIS:
WTS_FROM_PHONE=(11) 97199-7520
WTS_TO_PHONE=(11) 97997-9161,(11) 99999-9999,(11) 88888-8888
WTS_MESSAGE_TEXT=Relatório diário do painel de resultados
```

### 📞 Múltiplos Números

Para enviar para **múltiplos números**, separe os telefones com vírgula:

```bash
# Um número apenas
WTS_TO_PHONE=(11) 97997-9161

# Múltiplos números
WTS_TO_PHONE=(11) 97997-9161,(11) 99999-9999,(11) 88888-8888

# Com espaços (serão removidos automaticamente)
WTS_TO_PHONE=(11) 97997-9161, (11) 99999-9999, (11) 88888-8888
```

## 🧪 Testar Configuração

Após adicionar as variáveis, teste:

```bash
# 1. Verificar configuração
node scripts/test-wts-config.js

# 2. Testar envio completo
node scripts/test-daily-pdf.js schedule
```

## ✅ Status Esperado

O teste deve mostrar:
```
✅ EXTERNAL_API_URL: https://api.wts.chat...
✅ EXTERNAL_API_AUTH_TOKEN: pn_vJbb3rm1pPlJL0yiI...
✅ WTS_FROM_PHONE: (11) 97199-7520
✅ WTS_TO_PHONE: (11) 97997-9161
✅ WTS_MESSAGE_TEXT: Relatório diário do painel de resultados
```

## 🚀 Como Funciona

1. **⏰ Às 11h da manhã** - Sistema gera PDF automaticamente
2. **📄 PDF criado** - Do dia 1 do mês até hoje
3. **💾 Arquivo salvo** - Em `public/pdfs/daily-reports/`
4. **📱 WhatsApp enviado** - Com PDF anexado para o número configurado

## 📱 Exemplo de Mensagem

Cada WhatsApp receberá:
- **Texto**: "Relatório diário do painel de resultados"
- **Anexo**: PDF do painel de resultados
- **De**: (11) 97199-7520
- **Para**: Todos os números configurados em `WTS_TO_PHONE`

### 📊 Log de Envio

O sistema mostrará o progresso:
```
📱 Enviando para 3 número(s): (11) 97997-9161, (11) 99999-9999, (11) 88888-8888
📤 Enviando para (11) 97997-9161 (1/3)...
✅ PDF enviado com sucesso para (11) 97997-9161
📤 Enviando para (11) 99999-9999 (2/3)...
✅ PDF enviado com sucesso para (11) 99999-9999
📤 Enviando para (11) 88888-8888 (3/3)...
✅ PDF enviado com sucesso para (11) 88888-8888

📊 RESUMO DO ENVIO:
✅ Sucessos: 3
❌ Erros: 0
``` 