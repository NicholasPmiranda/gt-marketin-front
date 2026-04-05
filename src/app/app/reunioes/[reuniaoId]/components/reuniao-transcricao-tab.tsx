"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { detalharReuniao } from "@/lib/reunioes-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

function normalizarTranscricao(transcricao: string | unknown[]) {
  if (typeof transcricao === "string") {
    return transcricao
  }

  if (Array.isArray(transcricao)) {
    return transcricao
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
      .join("\n")
  }

  return ""
}

export function ReuniaoTranscricaoTab({ reuniaoId }: { reuniaoId: number }) {
  const [isLoading, setIsLoading] = useState(true)
  const [transcricao, setTranscricao] = useState("")
  const [busca, setBusca] = useState("")

  useEffect(() => {
    async function carregarTranscricao() {
      try {
        setIsLoading(true)
        const response = await detalharReuniao(reuniaoId)
        setTranscricao(normalizarTranscricao(response.transcricao))
      } catch (error) {
        toast.error(getErrorMessage(error, "Nao foi possivel carregar a transcricao da reuniao."))
      } finally {
        setIsLoading(false)
      }
    }

    void carregarTranscricao()
  }, [reuniaoId])

  const textoFiltrado = useMemo(() => {
    if (!busca.trim()) {
      return transcricao
    }

    const linhas = transcricao.split("\n")
    return linhas
      .filter((linha) => linha.toLowerCase().includes(busca.toLowerCase()))
      .join("\n")
  }, [busca, transcricao])

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle>Transcricao</CardTitle>
        <Input
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Filtre por palavra ou nome"
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : textoFiltrado ? (
          <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap text-sm leading-6">{textoFiltrado}</pre>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Nenhum trecho encontrado para o filtro informado.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
