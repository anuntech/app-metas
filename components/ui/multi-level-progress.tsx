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
  // With only one level, no need to sort
  const level = metaLevels[0];

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
  if (!level) {
    return <div className={cn("w-full h-2 bg-gray-200 rounded", className)}></div>;
  }

  return (
    <div className="space-y-2">
      {/* Simple progress bar - one continuous bar */}
      <div className={cn("relative w-full bg-gray-200 rounded", heightClass, className)}>
        {/* Overall progress bar */}
        <div 
          className={cn("absolute left-0 top-0 bottom-0 rounded-l", colorClass)}
          style={{ width: `${Math.min(100, overallProgress)}%` }}
        />
      </div>
    </div>
  );
} 