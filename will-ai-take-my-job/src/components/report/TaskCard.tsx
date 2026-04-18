"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck } from "lucide-react";

interface Props {
  title: string;
  tasks: string[];
  variant: "danger" | "safe";
}

export function TaskCard({ title, tasks, variant }: Props) {
  const isDanger = variant === "danger";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`rounded-2xl border p-5 ${
        isDanger
          ? "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900"
          : "bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900"
      }`}
    >
      <div
        className={`flex items-center gap-2 mb-4 font-semibold text-sm ${
          isDanger
            ? "text-red-700 dark:text-red-400"
            : "text-green-700 dark:text-green-400"
        }`}
      >
        {isDanger ? (
          <AlertTriangle className="w-4 h-4" />
        ) : (
          <ShieldCheck className="w-4 h-4" />
        )}
        {title}
      </div>
      <ul className="flex flex-col gap-2">
        {tasks.map((task, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
          >
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                isDanger ? "bg-red-400" : "bg-green-400"
              }`}
            />
            {task}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
