"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";

interface Props {
  onAnalyze: (jobTitle: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export function SearchBar({ onAnalyze, isLoading, initialValue = "" }: Props) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim() && !isLoading) onAnalyze(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="relative flex items-center">
        <Search className="absolute left-4 text-slate-400 w-5 h-5 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. Software Engineer, Nurse, Accountant..."
          disabled={isLoading}
          autoFocus
          className="w-full pl-12 pr-36 py-4 rounded-2xl border border-slate-200 dark:border-slate-700
                     bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                     placeholder:text-slate-400 text-base shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-violet-500
                     disabled:opacity-60 transition"
        />
        <motion.button
          type="submit"
          disabled={!value.trim() || isLoading}
          whileHover={value.trim() && !isLoading ? { scale: 1.02 } : {}}
          whileTap={value.trim() && !isLoading ? { scale: 0.98 } : {}}
          className="absolute right-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700
                     text-white text-sm font-semibold rounded-xl transition
                     disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Analyze
        </motion.button>
      </div>
    </form>
  );
}
