import { Skeleton } from "@/shared/components/ui/skeleton"

export function PantallaCarga() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Skeleton className="h-48 w-full max-w-sm" />
    </div>
  )
}
