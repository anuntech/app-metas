# Agendador de PDF Diário

Sistema automatizado para gerar PDFs diariamente às 11h da manhã e enviar para uma API externa.

## 🕐 Funcionamento

- **Agendamento**: Todos os dias às 11:00 AM (fuso horário de São Paulo)
- **Período**: Do dia 1 do mês atual até o dia atual
- **Arquivo**: Salvo em `public/pdfs/daily-reports/`
- **Envio**: URL enviada automaticamente para API externa

## 📁 Estrutura dos Arquivos

```
lib/
  ├── daily-pdf-scheduler.ts    # Sistema de agendamento
  └── init-scheduler.ts         # Inicializador automático
app/api/
  ├── pdf/daily-report/        # API para gerar PDF diário
  └── schedule/daily-pdf/       # API para controle manual
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```bash
# Agendador
ENABLE_PDF_SCHEDULER="true"  # Habilita o agendador em desenvolvimento

# WTS Chat API (obrigatório para envio automático)
EXTERNAL_API_URL="https://api.wts.chat/chat/v1/message/send"
EXTERNAL_API_METHOD="POST"
EXTERNAL_API_AUTH_TOKEN="pn_vJbb3rm1pPlJL0yiIW8ravlkQewNt3jL4rKk0qUPg"

# Números de telefone (obrigatório)
WTS_FROM_PHONE="(11) 97199-7520"
WTS_TO_PHONE="(11) 97997-9161,(11) 99999-9999,(11) 88888-8888"

# Mensagem personalizada (opcional)
WTS_MESSAGE_TEXT="Relatório diário do painel de resultados"
```

### 2. Exemplos de Configuração de API Externa

#### Webhook Zapier/Make.com
```bash
EXTERNAL_API_URL="https://hooks.zapier.com/hooks/catch/123456/abcdef"
EXTERNAL_API_METHOD="POST"
```

#### API com Bearer Token
```bash
EXTERNAL_API_URL="https://api.yourservice.com/webhooks/pdf"
EXTERNAL_API_METHOD="POST"
EXTERNAL_API_AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### API com API Key
```bash
EXTERNAL_API_URL="https://your-api.com/receive-pdf"
EXTERNAL_API_METHOD="POST"
EXTERNAL_API_KEY="sk_live_1234567890abcdef"
```

#### API com Headers Customizados
```bash
EXTERNAL_API_URL="https://custom-api.com/pdf-endpoint"
EXTERNAL_API_METHOD="POST"
EXTERNAL_API_HEADERS='{"X-Webhook-Source": "dashboard", "X-Report-Type": "daily"}'
```

## 🚀 Inicialização

### Automática
O agendador é inicializado automaticamente quando a aplicação inicia:

```typescript
// Importar em qualquer arquivo servidor (app.ts, layout.tsx, etc.)
import '@/lib/init-scheduler';
```

### Manual via API
```bash
# Testar a tarefa
GET /api/schedule/daily-pdf

# Executar imediatamente
POST /api/schedule/daily-pdf
```

## 📊 Payload Enviado para WTS Chat API

```json
{
  "body": {
    "text": "Relatório diário do painel de resultados",
    "fileUrl": "https://yourdomain.com/pdfs/daily-reports/painel-resultados-2024-12-ate-2024-12-15.pdf"
  },
  "from": "(11) 97199-7520",
  "to": "(11) 97997-9161"
}
```

## 🔧 APIs Disponíveis

### 1. Gerar PDF Diário
```bash
GET /api/pdf/daily-report
```
**Resposta:**
```json
{
  "success": true,
  "message": "PDF diário gerado com sucesso",
  "data": {
    "filename": "painel-resultados-2024-12-ate-2024-12-15.pdf",
    "publicUrl": "/pdfs/daily-reports/painel-resultados-2024-12-ate-2024-12-15.pdf",
    "filePath": "/path/to/public/pdfs/daily-reports/painel-resultados-2024-12-ate-2024-12-15.pdf"
  }
}
```

### 2. Controle do Agendador
```bash
# Teste manual
GET /api/schedule/daily-pdf

# Execução imediata
POST /api/schedule/daily-pdf
```

## 🧪 Testando o Sistema

### 1. Teste Local
```bash
# Habilitar agendador em desenvolvimento
echo "ENABLE_PDF_SCHEDULER=true" >> .env.local

# Configurar API externa de teste
echo "EXTERNAL_API_URL=https://webhook.site/your-unique-url" >> .env.local

# Reiniciar aplicação
npm run dev
```

### 2. Teste Manual via API
```bash
curl http://localhost:3000/api/schedule/daily-pdf
```

### 3. Verificar Logs
Os logs mostrarão:
```
🕐 Agendador de PDF diário iniciado
📅 Executará todos os dias às 11:00 AM
✅ Agendador configurado e ativo
```

## 📂 Estrutura de Arquivos Gerados

```
public/
└── pdfs/
    └── daily-reports/
        ├── painel-resultados-2024-12-ate-2024-12-01.pdf
        ├── painel-resultados-2024-12-ate-2024-12-02.pdf
        ├── painel-resultados-2024-12-ate-2024-12-03.pdf
        └── ...
```

**Padrão do nome**: `painel-resultados-{ANO-MES}-ate-{ANO-MES-DIA}.pdf`

## ⚠️ Considerações

### Produção
- O agendador é habilitado automaticamente em produção
- Certifique-se de configurar `EXTERNAL_API_URL`
- Monitore os logs para erros

### Desenvolvimento
- Por padrão, desabilitado em desenvolvimento
- Para habilitar: `ENABLE_PDF_SCHEDULER=true`
- Use webhook.site para testes de API externa

### Limpeza de Arquivos
Os PDFs se acumulam ao longo do tempo. Considere implementar limpeza automática:
- Manter apenas últimos 30 dias
- Mover arquivos antigos para storage cloud

## 🐛 Troubleshooting

### Agendador não executa
```bash
# Verificar se está habilitado
echo $ENABLE_PDF_SCHEDULER

# Verificar logs da aplicação
# Deve mostrar: "Agendador de PDF diário iniciado"
```

### Erro na API externa
```bash
# Testar URL manualmente
curl -X POST $EXTERNAL_API_URL \
  -H "Content-Type: application/json" \
  -d '{"test": "payload"}'
```

### PDF não é gerado
```bash
# Testar API diretamente
curl http://localhost:3000/api/pdf/daily-report
```

## 🔄 Monitoramento

Para produção, considere adicionar:
- Logs estruturados (Winston)
- Alertas de erro (email/Slack)
- Métricas de execução
- Health checks

## 📈 Próximos Passos

- [ ] Notificações de erro via email/Slack
- [ ] Dashboard de monitoramento
- [ ] Limpeza automática de arquivos antigos
- [ ] Retry automático em caso de falha
- [ ] Compressão de PDFs para economizar espaço 