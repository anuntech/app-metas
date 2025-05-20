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
  // With only one level, no need to sort
  const level = metaLevels[0];

  // Get color class based on scheme
  const colorClass = 
    colorScheme === "blue" ? "bg-blue-500" :
    colorScheme === "green" ? "bg-green-500" :
    colorScheme === "red" ? "bg-red-500" : 
    "bg-yellow-500";

  // If no levels, return empty bar
  if (!level) {
    return <div className={cn("w-full h-2 bg-gray-200 rounded", className)}></div>;
  }

  return (
    <div className="space-y-2">
      {/* Progress bar with fixed segment sizes */}
      <div className={cn("relative w-full h-2 bg-gray-200 rounded", className)}>
        {/* The filled progress section */}
        <div 
          className={cn("absolute left-0 top-0 bottom-0 rounded-l", colorClass)}
          style={{ width: `${Math.min(100, overallProgress)}%` }}
        />
      </div>
    </div>
  );
} 