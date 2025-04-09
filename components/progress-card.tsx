import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { MultiLevelProgress } from "@/components/ui/multi-level-progress"

type MetaLevel = {
  nivel: string;
  valor: number;
  progress: number;
};

type ProgressCardProps = {
  title: string | React.ReactNode
  value: string
  target?: string
  progress: number
  overallProgress?: number
  remaining?: string
  secondaryText?: string
  isNegative?: boolean
  className?: string
  metaLevels?: MetaLevel[]
}

export function ProgressCard({
  title,
  value,
  target,
  progress,
  overallProgress,
  remaining,
  secondaryText,
  isNegative = false,
  className,
  metaLevels
}: ProgressCardProps) {
  // If we have metaLevels, use multi-level progress display
  const useMultiLevel = metaLevels && metaLevels.length > 0;
  
  // For multi-level progress, determine the color scheme
  const getColorScheme = () => {
    // For reversed metrics like despesa/inadimplencia, green is good (under target)
    if (isNegative) {
      return "green"; // Changed from red to green for reversed metrics
    }
    return "blue";
  };

  // Find the next meta to achieve (first incomplete meta)
  const getNextMetaTarget = () => {
    if (!metaLevels || metaLevels.length === 0) return target;
    
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
        return `Meta ${nextMeta.nivel}: ${formatValueBasedOnType(nextMeta.valor, value)}`;
      }
      // If all metas completed, show the highest one
      const highestMeta = sortedMetas[sortedMetas.length - 1];
      return `Meta ${highestMeta.nivel}: ${formatValueBasedOnType(highestMeta.valor, value)} ✓`;
    }
    // For metrics where lower is better (negative like despesa)
    // Find first meta that's not completed
    const nextMeta = sortedMetas.find(m => m.progress < 100);
    if (nextMeta) {
      return `Meta ${nextMeta.nivel}: ${formatValueBasedOnType(nextMeta.valor, value)}`;
    }
    // If all metas completed, show the lowest one
    const lowestMeta = sortedMetas[sortedMetas.length - 1];
    return `Meta ${lowestMeta.nivel}: ${formatValueBasedOnType(lowestMeta.valor, value)} ✓`;
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

  // For reversed metrics like inadimplencia and despesa,
  // determine if the actual value is good (below target) or bad (above target)
  const getStatusForReversedMetric = () => {
    if (!isNegative) return null; // Only applies to reversed metrics
    
    // Extract the numerical value from the value string
    const actualValue = parseFloat(value.replace(/[^0-9,.]/g, '').replace(',', '.'));
    
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
        // For reversed metrics, lower values are better
        return actualValue <= nextMeta.valor ? "good" : "bad";
      } else if (sortedMetas.length > 0) {
        // All metas completed - compare with the highest meta level
        const highestMeta = sortedMetas[sortedMetas.length - 1];
        return actualValue <= highestMeta.valor ? "good" : "bad";
      }
    }
    
    // If no meta levels or all completed, fallback to target if available
    if (target) {
      const targetValue = parseFloat(target.replace(/[^0-9,.]/g, '').replace(',', '.'));
      return actualValue <= targetValue ? "good" : "bad";
    }
    
    // Default case
    return progress < 100 ? "good" : "bad";
  };

  // Get status for reversed metrics
  const reversedStatus = isNegative ? getStatusForReversedMetric() : null;

  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm p-4", className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{title}</p>
          {secondaryText && (
            <p className="text-xs text-muted-foreground">{secondaryText}</p>
          )}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {target && (
          <div className="text-xs text-muted-foreground">
            {useMultiLevel ? getNextMetaTarget() : target}
          </div>
        )}
        
        {useMultiLevel ? (
          // Multi-level progress bar display
          <MultiLevelProgress
            metaLevels={metaLevels}
            overallProgress={overallProgress || 0}
            isReversed={isNegative}
            colorScheme={getColorScheme()}
            className="mt-2"
          />
        ) : (
          // Classic single-level progress bar
          <Progress 
            value={progress} 
            className={cn(
              "h-2",
              isNegative ? "text-emerald-500" : ""
            )} 
          />
        )}
        
        {remaining && (
          <p className={cn(
            "text-xs",
            isNegative ? 
              reversedStatus === "good" ? "text-emerald-500" : 
              reversedStatus === "bad" ? "text-red-500" : 
              "text-muted-foreground"
              : "text-muted-foreground"
          )}>
            {remaining}
          </p>
        )}
      </div>
    </div>
  )
}


