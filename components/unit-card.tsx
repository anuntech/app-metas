import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface UnitCardProps {
  name: string
  faturamento: {
    atual: string
    meta: string
    progresso: number
    isNegative?: boolean
  }
  despesa: {
    atual: string
    meta: string
    progresso: number
    valorReais?: string
    isNegative: boolean
  }
  inadimplencia: {
    atual: string
    meta: string
    progresso: number
    valorReais?: string
    isNegative: boolean
  }
}

export function UnitCard({ name, faturamento, despesa, inadimplencia }: UnitCardProps) {
  // Cap progress values to 100% for proper display
  // When isNegative is true but progress is 0, show full red bar (100%)
  const faturamentoProgress = Math.min(faturamento.progresso, 100);
  const despesaProgress = despesa.isNegative && despesa.progresso === 0 ? 100 : Math.min(despesa.progresso, 100);
  const inadimplenciaProgress = inadimplencia.isNegative && inadimplencia.progresso === 0 ? 100 : Math.min(inadimplencia.progresso, 100);
  
  // Debug info (can be removed after fixing)
  console.log(`${name} - Despesa progress: ${despesa.progresso}, isNegative: ${despesa.isNegative}, using progress: ${despesaProgress}`);
  
  return (
    <Card>
      <CardHeader className="pb-2 pt-2 bg-brand-blue">
        <CardTitle className="text-lg font-medium text-white">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Faturamento */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="text-sm font-medium">Faturamento</div>
            <div className="text-sm font-medium">{faturamento.atual}</div>
          </div>
          <Progress 
            value={faturamentoProgress} 
            className="h-2 bg-gray-200" 
            indicatorClassName={faturamento.isNegative ? "bg-red-500" : "bg-brand-blue"} 
          />
          <div className="text-xs text-muted-foreground">Meta: {faturamento.meta}</div>
        </div>

        {/* Despesa */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="text-sm font-medium">Despesa</div>
            <div className="text-sm font-medium">{despesa.atual}</div>
          </div>
          <Progress
            value={despesaProgress}
            className="h-2 bg-gray-200"
            indicatorClassName={despesa.isNegative ? "bg-red-500" : "bg-brand-blue"}
          />
          <div className="flex justify-between">
          <div className="text-xs text-muted-foreground">Meta: {despesa.meta}</div>
          <div className="text-xs text-muted-foreground">{despesa.valorReais}</div>
          </div>
        </div>

        {/* Inadimplência */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="text-sm font-medium">Inadimplência</div>
            <div className="text-sm font-medium">{inadimplencia.atual}</div>
          </div>
          <Progress
            value={inadimplenciaProgress}
            className="h-2 bg-gray-200"
            indicatorClassName={inadimplencia.isNegative ? "bg-red-500" : "bg-brand-blue"}
          />
          <div className="flex justify-between">
            <div className="text-xs text-muted-foreground">Meta: {inadimplencia.meta}</div>
            <div className="text-xs text-muted-foreground">{inadimplencia.valorReais}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

