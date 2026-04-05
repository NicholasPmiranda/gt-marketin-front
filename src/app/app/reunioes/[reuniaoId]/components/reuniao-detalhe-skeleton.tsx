import { Skeleton } from "@/components/ui/skeleton"

export function ReuniaoDetalheSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-80" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
        <Skeleton className="h-60 w-full" />
      </div>
    </div>
  )
}
