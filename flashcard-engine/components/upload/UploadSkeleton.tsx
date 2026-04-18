"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface UploadSkeletonProps {
  label: string;
}

export function UploadSkeleton({ label }: UploadSkeletonProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="flex flex-col items-center gap-2">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30" />
          <span className="relative inline-flex h-10 w-10 rounded-full bg-primary/60" />
        </div>
        <p className="text-base font-medium text-muted-foreground">{label}</p>
      </div>
      <div className="w-full max-w-sm space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}
