import { Skeleton } from "@/shared/components/ui/skeleton"

export function BookmarkSummarySkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center p-6 rounded-xl border bg-background w-full"
        >
          <Skeleton className="w-16 h-16 rounded-xl mb-4 shrink-0" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </>
  )
}
