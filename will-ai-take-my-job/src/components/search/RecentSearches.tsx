"use client";

import { Clock } from "lucide-react";

interface Props {
  searches: string[];
  onSelect: (title: string) => void;
}

export function RecentSearches({ searches, onSelect }: Props) {
  if (searches.length === 0) return null;
  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xl">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Clock className="w-3 h-3" />
        Recent searches
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {searches.map((search) => (
          <button
            key={search}
            onClick={() => onSelect(search)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-violet-100
                       dark:hover:bg-violet-900/30 text-slate-600 dark:text-slate-400
                       hover:text-violet-700 dark:hover:text-violet-300
                       text-sm rounded-full transition-colors"
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  );
}
