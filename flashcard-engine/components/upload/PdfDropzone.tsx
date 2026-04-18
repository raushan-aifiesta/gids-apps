"use client";

import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, FileText } from "lucide-react";
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
        alert(msg);
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
        "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 text-center transition-colors cursor-pointer",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        {isDragActive ? (
          <FileText className="h-8 w-8 text-primary" />
        ) : (
          <Upload className="h-8 w-8 text-primary" />
        )}
      </div>
      <div>
        <p className="text-lg font-semibold">
          {isDragActive ? "Drop your PDF here" : "Upload a PDF"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag & drop or click to browse · Max 50 MB · Text-based PDFs only
        </p>
      </div>
    </div>
  );
}
