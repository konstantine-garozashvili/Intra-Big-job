import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonViewToggle = () => (
  <div className="flex justify-end mb-4">
    <div className="rounded-lg p-1 flex bg-secondary border border-muted shadow-sm transition-colors dark:bg-slate-800 bg-white gap-2">
      <Skeleton className="h-8 w-20 rounded-md" />
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
  </div>
);

export default SkeletonViewToggle; 