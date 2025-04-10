"use client";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type MetaLevel = {
  nivel: string;
  valor: number;
  progress: number;
};

type SummaryMultiLevelProgressProps = {
  metaLevels: MetaLevel[];
  overallProgress: number;
  isReversed?: boolean;
  colorScheme?: "blue" | "green" | "red" | "yellow";
  showLevelLabels?: boolean;
  className?: string;
};

export function SummaryMultiLevelProgress({
  metaLevels,
  overallProgress,
  isReversed = false,
  colorScheme = "blue",
  showLevelLabels = true,
  className,
}: SummaryMultiLevelProgressProps) {
  // Sort levels by Roman numeral order
  const sortedLevels = [...metaLevels].sort((a, b) => {
    const romanToInt = (s: string) => {
      const map: { [key: string]: number } = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 };
      return map[s] || 0;
    };
    return romanToInt(a.nivel) - romanToInt(b.nivel);
  });

  // Get color class based on scheme
  const colorClass = 
    colorScheme === "blue" ? "bg-blue-500" :
    colorScheme === "green" ? "bg-green-500" :
    colorScheme === "red" ? "bg-red-500" : 
    "bg-yellow-500";

  // If no levels, return empty bar
  if (!sortedLevels.length) {
    return <div className={cn("w-full h-2 bg-gray-200 rounded", className)}></div>;
  }

  // Calculate the step size - each level gets an equal portion of the bar
  const stepSize = 100 / sortedLevels.length;

  return (
    <div className="space-y-2">
      {/* Progress bar with fixed segment sizes */}
      <div className={cn("relative w-full h-2 bg-gray-200 rounded", className)}>
        {/* The filled progress section */}
        <div 
          className={cn("absolute left-0 top-0 bottom-0 rounded-l", colorClass)}
          style={{ width: `${Math.min(100, overallProgress)}%` }}
        />

        {/* Segment dividers */}
        {sortedLevels.map((level, index) => {
          if (index === 0) return null; // Skip first divider
          
          // Each divider is at a fixed percentage point
          const position = stepSize * index; 
          
          return (
            <div 
              key={`divider-${index}`}
              className="absolute top-0 bottom-0 w-0.5 bg-white"
              style={{ left: `${position}%` }}
            />
          );
        })}
      </div>

      {/* Level labels */}
      {showLevelLabels && (
        <div className="grid w-full text-xs mt-1" style={{ gridTemplateColumns: `repeat(${sortedLevels.length}, 1fr)` }}>
          {sortedLevels.map((level, index) => {
            // Calculate if this level is complete
            const isComplete = level.progress >= 100;
            
            return (
              <div
                key={`label-${level.nivel}`}
                className="flex flex-col items-center justify-center"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className={cn(
                        "font-medium cursor-help",
                        isComplete ? (isReversed ? "text-green-600" : "text-blue-600") : ""
                      )}>
                        {level.nivel}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Meta {level.nivel}: {level.valor.toLocaleString('pt-BR')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 