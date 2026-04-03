"use client"

import { useEffect, useState } from "react"
import { SearchIcon } from "lucide-react"
import { toast } from "sonner"

import { listarProjetos } from "@/lib/projetos-api"
import type { ProjetoItem } from "@/types/projetos"
import { CriarProjetoModal } from "./components/criar-projeto-modal"
import { ProjetoCard } from "./components/projeto-card"
import { ProjetosSkeleton } from "./components/projetos-skeleton"
import { Button } from "@/components/ui/button"
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
  const [projetos, setProjetos] = useState<ProjetoItem[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  async function carregarProjetos(isSilent = false) {
    try {
      if (isSilent) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const response = await listarProjetos({
        page,
        search,
      })

      setProjetos(response.data)
      setLastPage(response.lastPage)
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel carregar os projetos."))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    void carregarProjetos()
  }, [page])

  function handleBuscar() {
    setPage(1)
    void carregarProjetos(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full gap-2 md:max-w-lg">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busque por nome ou descricao"
          />
          <Button type="button" variant="outline" onClick={handleBuscar} disabled={isRefreshing}>
            <SearchIcon className="size-4" />
            Buscar
          </Button>
        </div>

        <div className="ml-auto">
          <CriarProjetoModal onCreated={() => carregarProjetos(true)} />
        </div>
      </div>

      {isLoading ? (
        <ProjetosSkeleton />
      ) : projetos.length === 0 ? (
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          Nenhum projeto encontrado.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projetos.map((projeto) => (
              <ProjetoCard key={projeto.id} projeto={projeto} />
            ))}
          </div>

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
        </div>
      )}
    </div>
  )
}
