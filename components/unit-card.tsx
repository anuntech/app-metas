import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

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
  onNextMeta?: () => void
  isLoading?: boolean
}

export function UnitCard({ name, faturamento, despesa, inadimplencia, onNextMeta, isLoading = false }: UnitCardProps) {
  // Cap progress values to 100% for proper display
  const faturamentoProgress = Math.min(faturamento.progresso, 100);
  const despesaProgress = Math.min(despesa.progresso, 100);
  const inadimplenciaProgress = Math.min(inadimplencia.progresso, 100);
  
  return (
    <Card>
      <CardHeader className="pb-2 pt-2 bg-brand-blue rounded-t-lg">
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
            indicatorClassName={faturamento.isNegative ? "bg-red-500" : "bg-green-600"} 
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
            indicatorClassName={despesa.isNegative ? "bg-red-500" : "bg-green-600"}
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
            indicatorClassName={inadimplencia.isNegative ? "bg-red-500" : "bg-green-600"}
          />
          <div className="flex justify-between">
            <div className="text-xs text-muted-foreground">Meta: {inadimplencia.meta}</div>
            <div className="text-xs text-muted-foreground">{inadimplencia.valorReais}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-4">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full bg-brand-blue bg-opacity-10 hover:bg-brand-blue hover:bg-opacity-20 hover:text-brand-blue border-brand-blue text-brand-blue"
          onClick={onNextMeta}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Atualizando...
            </>
          ) : (
            "Próxima meta"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

