import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonFilters = () => (
  <div className="w-full p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm space-y-4 md:space-y-0 md:flex md:gap-4 items-center">
    <Skeleton className="h-10 w-full md:w-64 rounded" />
    <Skeleton className="h-10 w-48 rounded" />
    <Skeleton className="h-10 w-40 rounded" />
    <Skeleton className="h-10 w-36 rounded" />
  </div>
);

export default SkeletonFilters; 