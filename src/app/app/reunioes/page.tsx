"use client"

import { useEffect, useState } from "react"
import { SearchIcon } from "lucide-react"
import { toast } from "sonner"

import { listarReunioes } from "@/lib/reunioes-api"
import type { ReuniaoItem } from "@/types/reunioes"
import { ReunioesSkeleton } from "./components/reunioes-skeleton"
import { ReunioesTable } from "./components/reunioes-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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

export default function Page() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [reunioes, setReunioes] = useState<ReuniaoItem[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  async function carregarReunioes(isSilent = false, pageOverride?: number) {
    const paginaAtual = pageOverride ?? page

    try {
      if (isSilent) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const response = await listarReunioes({
        page: paginaAtual,
        search,
      })

      setReunioes(response.data)
      setLastPage(response.lastPage)
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel carregar as reunioes."))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    void carregarReunioes(false, page)
  }, [page])

  function handleBuscar() {
    if (page !== 1) {
      setPage(1)
      return
    }

    void carregarReunioes(true, 1)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Reunioes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex w-full gap-2 md:max-w-lg">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Busque por titulo ou URL"
            />
            <Button type="button" variant="outline" onClick={handleBuscar} disabled={isRefreshing}>
              <SearchIcon className="size-4" />
              Buscar
            </Button>
          </div>

          {isLoading ? (
            <ReunioesSkeleton />
          ) : reunioes.length === 0 ? (
            <div className="rounded-md border p-6 text-sm text-muted-foreground">
              Nenhuma reuniao encontrada.
            </div>
          ) : (
            <ReunioesTable reunioes={reunioes} />
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Pagina {page} de {lastPage}
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((value) => Math.min(lastPage, value + 1))}
              disabled={page >= lastPage}
            >
              Proxima
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
