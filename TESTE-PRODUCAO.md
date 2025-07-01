# 🚀 Teste Final em Produção

## 📋 Preparação

### 1. Fazer Deploy em Produção

Primeiro, faça o commit e deploy da aplicação:

```bash
# Adicionar todas as mudanças
git add .

# Commit das mudanças
git commit -m "Sistema de PDF automático com WTS Chat API completo"

# Push para produção (Vercel, Heroku, etc.)
git push origin main
```

### 2. Configurar Variáveis de Ambiente

No seu provedor de hospedagem (Vercel, Heroku, etc.), configure:

```bash
# URL de Produção
PRODUCTION_URL=https://seu-app.vercel.app
# ou
NEXTAUTH_URL=https://seu-app.vercel.app

# Agendador
ENABLE_PDF_SCHEDULER=true

# WTS Chat API
EXTERNAL_API_URL=https://api.wts.chat/chat/v1/message/send
EXTERNAL_API_METHOD=POST
EXTERNAL_API_AUTH_TOKEN=pn_vJbb3rm1pPlJL0yiIW8ravlkQewNt3jL4rKk0qUPg

# Números (separados por vírgula para múltiplos)
WTS_FROM_PHONE=(11) 97199-7520
WTS_TO_PHONE=(11) 97997-9161,(11) 99999-9999,(11) 88888-8888

# Mensagem (opcional)
WTS_MESSAGE_TEXT=📊 Relatório diário do painel de resultados
```

### 3. Configurar Localmente para Teste

No seu `.env.local`:

```bash
# IMPORTANTE: URL de produção (não localhost!)
PRODUCTION_URL=https://seu-app.vercel.app

# Mantém as outras configurações iguais
EXTERNAL_API_URL=https://api.wts.chat/chat/v1/message/send
EXTERNAL_API_AUTH_TOKEN=pn_vJbb3rm1pPlJL0yiIW8ravlkQewNt3jL4rKk0qUPg
WTS_FROM_PHONE=(11) 97199-7520
WTS_TO_PHONE=(11) 97997-9161,(11) 99999-9999
```

## 🧪 Executar Teste

Após o deploy estar ativo:

```bash
node scripts/production-test.js
```

## 📊 Resultado Esperado

```bash
🚀 TESTE DE AUTOMAÇÃO COMPLETA EM PRODUÇÃO
==========================================

🔍 1. VERIFICANDO CONFIGURAÇÃO...

✅ PRODUCTION_URL: https://seu-app.vercel.app
✅ EXTERNAL_API_URL: https://api.wts.chat/chat/v1/message/send
✅ EXTERNAL_API_AUTH_TOKEN: pn_vJbb3rm1pPlJL...
✅ WTS_FROM_PHONE: (11) 97199-7520
✅ WTS_TO_PHONE: (11) 97997-9161,(11) 99999-9999

📱 Números configurados: 2
   1. (11) 97997-9161
   2. (11) 99999-9999

🌍 URL de produção: https://seu-app.vercel.app

✅ Configuração OK!

📄 2. GERANDO PDF EM PRODUÇÃO...

🔗 Fazendo requisição para: https://seu-app.vercel.app/api/pdf/daily-report
✅ PDF gerado com sucesso!
📁 Arquivo: painel-resultados-2025-07-ate-2025-07-01.pdf
🔗 URL completa: https://seu-app.vercel.app/pdfs/daily-reports/painel-resultados-2025-07-ate-2025-07-01.pdf

📱 3. ENVIANDO VIA WTS PARA TODOS OS NÚMEROS...

📤 Enviando "painel-resultados-2025-07-ate-2025-07-01.pdf" para 2 número(s):

📞 Enviando para (11) 97997-9161 (1/2)...
✅ Sucesso para (11) 97997-9161
   ⏳ Aguardando 1 segundo...

📞 Enviando para (11) 99999-9999 (2/2)...
✅ Sucesso para (11) 99999-9999

📊 RESUMO DO ENVIO WTS:
✅ Sucessos: 2
❌ Erros: 0

✅ Números que receberam o PDF:
   - (11) 97997-9161
   - (11) 99999-9999

🔄 TESTANDO AUTOMAÇÃO COMPLETA (como será às 11h)...

🔗 Fazendo requisição para: https://seu-app.vercel.app/api/schedule/daily-pdf
✅ Fluxo da automação executado com sucesso!
📁 Arquivo gerado: painel-resultados-2025-07-ate-2025-07-01.pdf
📱 Números enviados: 2
❌ Erros: 0

==========================================
🎉 TESTE COMPLETO FINALIZADO!
==========================================

📋 RESUMO FINAL:
✅ PDF gerado: painel-resultados-2025-07-ate-2025-07-01.pdf
🔗 URL acessível: https://seu-app.vercel.app/pdfs/daily-reports/painel-resultados-2025-07-ate-2025-07-01.pdf
📱 WhatsApps enviados: 2/2
⏰ Automação às 11h: Funcionando

🎉 SUCESSO TOTAL! Sistema pronto para produção!
✅ Todos os números receberam o PDF
✅ Automação funcionando perfeitamente

🕐 A partir de agora, o sistema enviará automaticamente às 11h da manhã
```

## ✅ Verificações Finais

### 1. Conferir WhatsApp
- [ ] Recebeu mensagem em todos os números?
- [ ] PDF foi anexado corretamente?
- [ ] Mensagem está com o texto correto?

### 2. Conferir URL do PDF
- [ ] URL é acessível publicamente?
- [ ] PDF abre corretamente?
- [ ] Dados estão corretos?

### 3. Conferir Logs de Produção
- [ ] Aplicação iniciou o agendador?
- [ ] Sem erros nos logs?

## 🎯 Próximos Passos

Se o teste passou:

1. ✅ **Sistema configurado** - Automação ativa
2. ✅ **Agendador funcionando** - Executará às 11h da manhã
3. ✅ **PDFs sendo enviados** - Para todos os números
4. ✅ **URLs públicas** - WTS pode acessar os PDFs

### ⏰ A partir de agora:

**Todos os dias às 11h da manhã**, o sistema automaticamente:

1. Gera PDF do período (dia 1 do mês até hoje)
2. Salva em `public/pdfs/daily-reports/`
3. Envia via WhatsApp para todos os números configurados
4. Registra logs de sucesso/erro

## 🆘 Se algo der errado:

### PDF não gera
- Verificar se a aplicação está rodando
- Verificar se a API `/api/dashboard/progress` funciona
- Verificar dados no banco de dados

### WTS não envia
- Verificar se o token está correto
- Verificar se os números estão no formato correto
- Verificar se a URL do PDF é acessível publicamente

### Agendador não funciona
- Verificar se `ENABLE_PDF_SCHEDULER=true` em produção
- Verificar logs da aplicação
- Reiniciar a aplicação se necessário

## 🔧 Comandos Úteis

```bash
# Testar apenas a geração de PDF
curl https://seu-app.vercel.app/api/pdf/daily-report

# Testar agendador manualmente
curl -X POST https://seu-app.vercel.app/api/schedule/daily-pdf

# Ver logs (Vercel)
vercel logs seu-app

# Redeployar se necessário
vercel --prod
``` 