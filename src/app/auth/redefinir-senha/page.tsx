import { Suspense } from "react"

import { ResetPasswordForm } from "@/components/reset-password-form"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function RedefinirSenhaFallback() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<RedefinirSenhaFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
