import { Skeleton } from "@/components/ui/skeleton";

export function ReportSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-3 w-full">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>

      {/* Gauge placeholder */}
      <Skeleton className="h-36 w-64 rounded-2xl" />

      {/* Summary */}
      <div className="w-full max-w-xl flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mx-auto" />
        <Skeleton className="h-4 w-4/6 mx-auto" />
      </div>

      {/* Task cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>

      {/* Roadmap */}
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
