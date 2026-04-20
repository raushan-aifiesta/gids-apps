"use client";

import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PdfDropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export function PdfDropzone({ onFile, disabled }: PdfDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        const msg = rejected[0]?.errors[0]?.message ?? "Invalid file.";
        toast.error(msg);
        return;
      }
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        // Base — dark glass container
        "relative flex flex-col items-center justify-center gap-7 overflow-hidden",
        "rounded-3xl border p-12 sm:p-16 text-center",
        "cursor-pointer transition-all duration-300",
        "border-white/8 bg-white/[0.025] backdrop-blur-sm",
        // Idle hover
        !isDragActive && !disabled &&
          "hover:border-white/16 hover:bg-white/[0.04] hover:shadow-[0_0_40px_oklch(0.55_0.22_265/0.07)]",
        // Drag-active
        isDragActive &&
          "border-indigo-500/50 bg-indigo-500/[0.06] shadow-[0_0_60px_oklch(0.55_0.22_265/0.18)]",
        // Disabled
        disabled && "pointer-events-none opacity-40"
      )}
    >
      <input {...getInputProps()} />

      {/* Ambient radial glow — brightens when dragging */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, oklch(0.55 0.22 265 / 0.1), transparent 70%)",
          opacity: isDragActive ? 1 : 0,
        }}
      />

      {/* Shimmer sweep — always visible, subtle */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, oklch(1 0 0 / 2.5%) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 5s linear infinite",
        }}
      />

      {/* Icon with glow halo */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Outer glow halo */}
        <div
          className={cn(
            "absolute rounded-full blur-2xl transition-all duration-500",
            "h-24 w-24",
            isDragActive
              ? "bg-indigo-500/50 scale-125"
              : "bg-indigo-500/20 scale-100 animate-[glow-pulse_4s_ease-in-out_infinite]"
          )}
        />
        {/* Icon container */}
        <div
          className={cn(
            "relative flex h-20 w-20 items-center justify-center rounded-2xl border transition-all duration-300",
            isDragActive
              ? "border-indigo-400/40 bg-indigo-500/20 shadow-[0_0_24px_oklch(0.55_0.22_265/0.4)]"
              : "border-white/10 bg-white/[0.04]"
          )}
        >
          <FileText
            className={cn(
              "h-9 w-9 transition-colors duration-300",
              isDragActive ? "text-indigo-300" : "text-zinc-400"
            )}
          />
        </div>
      </div>

      {/* Text */}
      <div className="relative z-10 space-y-2">
        <p className="text-lg font-semibold tracking-tight sm:text-xl">
          {isDragActive ? (
            <span className="text-indigo-300">Release to unlock the Vault</span>
          ) : (
            <span className="text-zinc-100">Drop your PDF into the Vault</span>
          )}
        </p>
        <p className="text-sm text-zinc-500">
          Drag & drop or{" "}
          <span className="text-zinc-400 underline underline-offset-2 decoration-zinc-600">
            click to browse
          </span>
          {" "}· PDF only · Max 50 MB
        </p>
      </div>
    </div>
  );
}
