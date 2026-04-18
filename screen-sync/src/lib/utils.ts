import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 65) return "text-sky-400";
  if (score >= 50) return "text-amber-400";
  return "text-rose-400";
}

export function scoreBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 65) return "bg-sky-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-rose-500";
}

export function scoreBadgeStyle(score: number): string {
  if (score >= 80) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (score >= 65) return "bg-sky-500/20 text-sky-300 border-sky-500/30";
  if (score >= 50) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  return "bg-rose-500/20 text-rose-300 border-rose-500/30";
}
