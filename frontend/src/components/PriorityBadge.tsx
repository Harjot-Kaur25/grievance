import React from "react";
import type { PriorityLevel } from "../types";

interface PriorityBadgeProps {
  priority?: PriorityLevel | string | null;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = "md",
  showDot = true,
}) => {
  const p = (priority || "Unknown") as string;
  const pLower = p.toLowerCase();

  let colorClasses = "bg-metro-800 text-metro-300 border-metro-700";
  let dotColor = "bg-metro-400";

  if (pLower === "critical") {
    colorClasses = "bg-rose-950/40 text-rose-300 border-rose-800/60 shadow-[0_0_12px_-2px_rgba(244,63,94,0.3)]";
    dotColor = "bg-rose-500 animate-pulse";
  } else if (pLower === "high") {
    colorClasses = "bg-amber-950/40 text-amber-300 border-amber-800/60 shadow-[0_0_10px_-2px_rgba(245,158,11,0.25)]";
    dotColor = "bg-amber-400";
  } else if (pLower === "medium") {
    colorClasses = "bg-sky-950/40 text-sky-300 border-sky-800/60";
    dotColor = "bg-sky-400";
  } else if (pLower === "low") {
    colorClasses = "bg-emerald-950/40 text-emerald-300 border-emerald-800/60";
    dotColor = "bg-emerald-400";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium rounded",
    md: "px-2.5 py-1 text-xs font-semibold rounded-md",
    lg: "px-3.5 py-1.5 text-sm font-semibold rounded-lg",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border uppercase tracking-wider font-mono ${sizeClasses} ${colorClasses}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {p}
    </span>
  );
};
