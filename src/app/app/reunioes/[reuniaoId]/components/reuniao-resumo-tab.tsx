"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { detalharReuniao } from "@/lib/reunioes-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message
  }

  return fallback
}

function normalizarResumo(resumo: string | unknown[]) {
  if (typeof resumo === "string") {
    return resumo
  }

  if (Array.isArray(resumo)) {
    return resumo
      .map((item) => {
        if (typeof item === "string") {
          return item
        }

        if (typeof item === "object" && item !== null) {
          return JSON.stringify(item)
        }

        return ""
      })
      .filter((item) => item.length > 0)
      .join("\n\n")
  }

  return ""
}

export function ReuniaoResumoTab({ reuniaoId }: { reuniaoId: number }) {
  const [isLoading, setIsLoading] = useState(true)
  const [resumo, setResumo] = useState("")

  useEffect(() => {
    async function carregarResumo() {
      try {
        setIsLoading(true)
        const response = await detalharReuniao(reuniaoId)
        setResumo(normalizarResumo(response.resumoPadrao))
      } catch (error) {
        toast.error(getErrorMessage(error, "Nao foi possivel carregar o resumo da reuniao."))
      } finally {
        setIsLoading(false)
      }
    }

    void carregarResumo()
  }, [reuniaoId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo da reuniao</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : resumo ? (
          <pre className="whitespace-pre-wrap text-sm leading-6">{resumo}</pre>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Nenhum resumo encontrado para esta reuniao.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
