"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type MetaLevel = {
  nivel: string;
  valor: number;
  progress: number;
};

type MultiLevelProgressProps = {
  metaLevels: MetaLevel[];
  overallProgress: number;
  isReversed?: boolean;
  colorScheme?: "blue" | "green" | "red" | "yellow";
  showLevelLabels?: boolean;
  height?: "sm" | "md" | "lg";
  className?: string;
};

export function MultiLevelProgress({
  metaLevels,
  overallProgress,
  isReversed = false,
  colorScheme = "blue",
  showLevelLabels = true,
  height = "md",
  className,
}: MultiLevelProgressProps) {
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

  // Get height class
  const heightClass = 
    height === "sm" ? "h-2" :
    height === "lg" ? "h-6" :
    "h-4";

  // If no levels, return empty bar
  if (!sortedLevels.length) {
    return <div className={cn("w-full h-2 bg-gray-200 rounded", className)}></div>;
  }

  return (
    <div className="space-y-2">
      {/* Simple progress bar - one continuous bar with level markers */}
      <div className={cn("relative w-full bg-gray-200 rounded", heightClass, className)}>
        {/* Overall progress bar */}
        <div 
          className={cn("absolute left-0 top-0 bottom-0 rounded-l", colorClass)}
          style={{ width: `${Math.min(100, overallProgress)}%` }}
        />

        {/* Level markers */}
        {sortedLevels.map((level, index) => {
          if (index === 0) return null; // Skip first level marker
          
          // Calculate position as percentage
          const position = (index * 100) / sortedLevels.length;
          
          return (
            <div 
              key={`marker-${index}-${level.nivel || 'divider'}`}
              className="absolute top-0 bottom-0 w-1 bg-white"
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