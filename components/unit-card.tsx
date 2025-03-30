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
            value={faturamento.progresso} 
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
            value={despesa.progresso}
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
            value={inadimplencia.progresso}
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

