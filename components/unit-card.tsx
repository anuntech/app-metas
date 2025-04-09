import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import { MultiLevelProgress } from "./ui/multi-level-progress"
import { cn } from "@/lib/utils"

type MetaLevel = {
  nivel: string;
  valor: number;
  progress: number;
};

type MetricProps = {
  atual: string;
  meta: string;
  progresso: number;
  valorReais?: string;
  isNegative: boolean;
  metaLevels?: MetaLevel[];
  overallProgress?: number;
}

type UnitCardProps = {
  name: string;
  isLoading?: boolean;
  faturamento: MetricProps;
  despesa: MetricProps;
  inadimplencia: MetricProps;
}

export function UnitCard({
  name,
  isLoading = false,
  faturamento,
  despesa,
  inadimplencia
}: UnitCardProps) {
  // Function to render each metric with single or multi-level progress
  const renderMetric = (
    label: string, 
    { atual, meta, progresso, valorReais, isNegative, metaLevels, overallProgress }: MetricProps
  ) => {
    // If we have metaLevels data, render multi-level progress
    const useMultiLevel = metaLevels && metaLevels.length > 0;

    // Find the next meta to achieve (first incomplete meta)
    const getNextMetaTarget = () => {
      if (!metaLevels || metaLevels.length === 0) return meta;
      
      // Helper function to convert Roman numeral to integer
      const romanToInt = (roman: string) => {
        const romanValues: Record<string, number> = {
          'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
          'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10
        };
        return romanValues[roman] || 0;
      };
      
      // Sort by Roman numeral order
      const sortedMetas = [...metaLevels].sort((a, b) => {
        const nivelA = romanToInt(a.nivel);
        const nivelB = romanToInt(b.nivel);
        return nivelA - nivelB;
      });
      
      // For metrics where higher is better (not negative)
      if (!isNegative) {
        // Find first meta that's not completed
        const nextMeta = sortedMetas.find(m => m.progress < 100);
        if (nextMeta) {
          return `Meta ${nextMeta.nivel}: ${formatValueBasedOnType(nextMeta.valor, atual)}`;
        }
        // If all metas completed, show the highest one
        const highestMeta = sortedMetas[sortedMetas.length - 1];
        return `Meta ${highestMeta.nivel}: ${formatValueBasedOnType(highestMeta.valor, atual)} ✓`;
      } else {
        // For metrics where lower is better (negative like despesa)
        // Find first meta that's not completed
        const nextMeta = sortedMetas.find(m => m.progress < 100);
        if (nextMeta) {
          return `Meta ${nextMeta.nivel}: ${formatValueBasedOnType(nextMeta.valor, atual)}`;
        }
        // If all metas completed, show the lowest one
        const lowestMeta = sortedMetas[sortedMetas.length - 1];
        return `Meta ${lowestMeta.nivel}: ${formatValueBasedOnType(lowestMeta.valor, atual)} ✓`;
      }
    };
    
    // Format the value based on the type (percentage or currency)
    const formatValueBasedOnType = (value: number, sample: string) => {
      // Check if the sample is a percentage
      if (sample.includes('%')) {
        return `${value.toFixed(2)}%`;
      }
      // Otherwise assume it's currency or a plain number
      return sample.replace(/[\d,.]+/, value.toLocaleString('pt-BR'));
    };
    
    // Get status for reversed metrics
    const getStatusForReversedMetric = () => {
      if (!isNegative) return null; // Only applies to reversed metrics
      
      // Extract the numerical value from the atual string
      const actualValue = parseFloat(atual.replace(/[^0-9,.]/g, '').replace(',', '.'));
      
      // Helper function to convert Roman numeral to integer
      const romanToInt = (roman: string) => {
        const romanValues: Record<string, number> = {
          'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
          'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10
        };
        return romanValues[roman] || 0;
      };
      
      // If we have meta levels, compare with the current target meta
      if (metaLevels && metaLevels.length > 0) {
        // Sort by Roman numeral ordering
        const sortedMetas = [...metaLevels].sort((a, b) => {
          const nivelA = romanToInt(a.nivel);
          const nivelB = romanToInt(b.nivel);
          return nivelA - nivelB;
        });
        
        // Find the next meta to achieve (first incomplete meta)
        const nextMeta = sortedMetas.find(m => m.progress < 100);
        
        if (nextMeta) {
          // For reversed metrics, we're in a good state if actual is LOWER than the target
          return actualValue <= nextMeta.valor ? "good" : "bad";
        } else if (sortedMetas.length > 0) {
          // All metas completed - compare with the highest meta level
          const highestMeta = sortedMetas[sortedMetas.length - 1];
          return actualValue <= highestMeta.valor ? "good" : "bad";
        }
      } else {
        // No meta levels defined - fall back to the meta string
        // Parse the meta value - it could be in the format "XX.XX%" or other
        const metaValue = parseFloat(meta.replace(/[^0-9,.]/g, '').replace(',', '.'));
        
        // For reversed metrics (like expenses), lower values are better
        return actualValue <= metaValue ? "good" : "bad";
      }
      
      // Default case
      return null;
    };
    
    // Get status for reversed metrics
    const reversedStatus = isNegative ? getStatusForReversedMetric() : null;
  
  return (
        <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          {valorReais && <span className="text-xs text-muted-foreground">{valorReais}</span>}
          </div>
        <div className="flex justify-between items-baseline">
          <span className={cn(
            "text-base font-semibold",
            isNegative && atual ? (
              reversedStatus === "good" ? "text-emerald-500" : 
              reversedStatus === "bad" ? "text-red-500" : ""
            ) : ""
          )}>
            {atual}
          </span>
          <span className="text-xs text-muted-foreground">
            {useMultiLevel ? getNextMetaTarget() : meta}
          </span>
        </div>

        {useMultiLevel ? (
          // Multi-level progress
          <MultiLevelProgress
            metaLevels={metaLevels}
            overallProgress={overallProgress || 0}
            isReversed={isNegative}
            colorScheme={isNegative ? "green" : "blue"} // Use green for reversed metrics
            height="sm"
          />
        ) : (
          // Classic single-level progress
          <Progress 
            value={Math.min(progresso, 100)} 
            className={cn(
              "h-2",
              isNegative ? "text-emerald-500" : ""
            )}
          />
        )}
          </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          {name}
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderMetric("Faturamento", faturamento)}
        {renderMetric("Despesa", despesa)}
        {renderMetric("Inadimplência", inadimplencia)}
      </CardContent>
    </Card>
  );
}

