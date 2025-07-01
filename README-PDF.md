# Geração de PDF do Painel de Resultados

Este projeto inclui um sistema completo para gerar PDFs do painel de resultados usando `@react-pdf/renderer`.

## 📁 Estrutura dos Arquivos

```
components/
  └── pdf-painel-resultados.tsx    # Componente PDF que replica o layout
app/api/pdf/painel-resultados/
  └── route.ts                     # API route para gerar PDFs
examples/
  └── pdf-generation-example.ts    # Exemplos de uso
```

## 🚀 Como Usar

### 1. Instalação

A biblioteca `@react-pdf/renderer` já está instalada no projeto:

```bash
npm install @react-pdf/renderer
```

### 2. API Endpoints

#### GET `/api/pdf/painel-resultados`
Gera um PDF inline para visualização no navegador.

**Parâmetros:**
- `startDate`: Data de início (ISO string)
- `endDate`: Data de fim (ISO string)

**Exemplo:**
```
GET /api/pdf/painel-resultados?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z
```

#### POST `/api/pdf/painel-resultados`
Gera um PDF para download.

**Body:**
```json
{
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "filename": "painel-resultados.pdf"
}
```

### 3. Uso no Frontend

```typescript
import { downloadPDF, generatePDFInline } from '@/examples/pdf-generation-example';

// Para baixar o PDF
await downloadPDF(new Date('2024-01-01'), new Date('2024-12-31'));

// Para abrir o PDF em nova aba
const pdfUrl = generatePDFInline(new Date('2024-01-01'), new Date('2024-12-31'));
window.open(pdfUrl, '_blank');
```

### 4. Integração com o Componente Existente

Para integrar com o componente `painel-resultados.tsx` existente, substitua a função de exportação atual:

```typescript
// No seu componente painel-resultados.tsx
import { downloadPDF } from '@/examples/pdf-generation-example';

const handlePDFExport = async () => {
  try {
    setIsExporting(true);
    
    const filename = `painel-resultados-${formatPeriod(dateRange[0].startDate, dateRange[0].endDate).replace(/\s+/g, '-').toLowerCase()}.pdf`;
    
    await downloadPDF(dateRange[0].startDate, dateRange[0].endDate, filename);
    
    addToast({
      title: "Sucesso!",
      message: "PDF exportado com sucesso!",
      type: "success",
      duration: 3000,
    });
  } catch (error) {
    addToast({
      title: "Erro",
      message: "Erro ao gerar PDF",
      type: "error",
      duration: 5000,
    });
  } finally {
    setIsExporting(false);
  }
}
```

## 🎨 Customização do Layout PDF

O componente `pdf-painel-resultados.tsx` pode ser customizado editando:

### Estilos
```typescript
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  // ... outros estilos
});
```

### Cores dos Cards
```typescript
const getProgressColor = (progress: number, isNegative: boolean = false) => {
  if (isNegative) {
    if (progress >= 100) return '#ef4444'; // red
    if (progress >= 80) return '#f59e0b'; // amber
    return '#10b981'; // green
  } else {
    if (progress >= 100) return '#10b981'; // green
    if (progress >= 80) return '#f59e0b'; // amber
    return '#ef4444'; // red
  }
};
```

### Adicionando Novos Elementos
Para adicionar logos, headers customizados ou outras informações:

```typescript
// No componente PDFPainelResultados
<Page size="A4" style={styles.page}>
  {/* Header personalizado */}
  <View style={styles.customHeader}>
    <Text>Minha Empresa</Text>
    {/* <Image src="/logo.png" style={styles.logo} /> */}
  </View>
  
  {/* Conteúdo existente */}
  <View style={styles.header}>
    {/* ... */}
  </View>
</Page>
```

## 🔧 Funcionalidades

### ✅ Implementado
- [x] Replicação completa do layout do painel de resultados
- [x] Formatação de moeda e porcentagens
- [x] Cálculo de dias úteis e corridos
- [x] Cards de progresso com cores baseadas no desempenho
- [x] Seção de unidades com métricas detalhadas
- [x] API route para geração GET e POST
- [x] Funções utilitárias para uso no frontend
- [x] Transformação de dados da API existente

### 🚀 Possíveis Melhorias
- [ ] Adicionar gráficos usando `recharts` ou similar
- [ ] Suporte para múltiplas páginas
- [ ] Personalização de fontes
- [ ] Adicionar watermark
- [ ] Cache de PDFs gerados
- [ ] Compressão de PDFs

## 🐛 Solução de Problemas

### Erro de Tipagem
Se encontrar erros de tipagem com `renderToBuffer`, use:
```typescript
await renderToBuffer(
  React.createElement(PDFPainelResultados, { data: pdfData }) as any
);
```

### Layout Quebrado
Verifique se:
- As widths dos containers somam 100%
- Não há elementos com width/height absolutos
- Os dados estão no formato correto

### Performance
Para grandes volumes de dados:
- Considere paginação
- Use cache para dados frequentemente acessados
- Gere PDFs em background jobs

## 📝 Exemplo Completo

Veja o arquivo `examples/pdf-generation-example.ts` para exemplos completos de uso.

## 🌐 URLs de Teste

Depois de implementar, você pode testar com URLs como:

```
# Visualizar PDF inline
http://localhost:3000/api/pdf/painel-resultados?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z

# Via POST (usar Postman/Insomnia)
POST http://localhost:3000/api/pdf/painel-resultados
Content-Type: application/json

{
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "filename": "teste.pdf"
} 