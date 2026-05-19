"use client"

import { useEffect, useState } from "react"
import { SearchIcon } from "lucide-react"
import { toast } from "sonner"

import { listarProjetos } from "@/lib/projetos-api"
import { usePermissaoPerfil } from "@/hooks/use-permissao-perfil"
import type { ProjetoItem } from "@/types/projetos"
import { CriarProjetoModal } from "./components/criar-projeto-modal"
import { ProjetoCard } from "./components/projeto-card"
import { ProjetosSkeleton } from "./components/projetos-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FiltroProjetoAtivo = "todos" | "true" | "false"

const filtroProjetoAtivoLabel: Record<FiltroProjetoAtivo, string> = {
  todos: "Todos",
  true: "Ativados",
  false: "Desativados",
}

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
  const { podeCriarProjeto } = usePermissaoPerfil()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [projetos, setProjetos] = useState<ProjetoItem[]>([])
  const [search, setSearch] = useState("")
  const [ativoFilter, setAtivoFilter] = useState<FiltroProjetoAtivo>("todos")
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  async function carregarProjetos(pageAtual = page, isSilent = false) {
    try {
      if (isSilent) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const response = await listarProjetos({
        page: pageAtual,
        search,
        ativo: ativoFilter === "todos" ? undefined : ativoFilter === "true",
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
    void carregarProjetos(page)
  }, [page])

  function handleBuscar() {
    setPage(1)
    void carregarProjetos(1, true)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-col gap-4 md:max-w-3xl md:flex-row md:items-end">
          <div className="flex-1">
            <Label htmlFor="busca-projeto">Busca</Label>
            <Input
              id="busca-projeto"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Busque por nome ou descricao"
            />
          </div>

          <div className="w-full md:max-w-56">
            <Label htmlFor="filtro-projeto-ativo">Status</Label>
            <Select value={ativoFilter} onValueChange={(value) => setAtivoFilter(value as FiltroProjetoAtivo)}>
              <SelectTrigger id="filtro-projeto-ativo" className="w-full">
                <SelectValue placeholder="Selecione o status">
                  {filtroProjetoAtivoLabel[ativoFilter]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="true">Ativados</SelectItem>
                  <SelectItem value="false">Desativados</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button type="button" variant="outline" onClick={handleBuscar} disabled={isRefreshing}>
            <SearchIcon data-icon="inline-start" />
            Buscar
          </Button>
        </div>

        {podeCriarProjeto ? (
          <div className="ml-auto">
            <CriarProjetoModal onCreated={() => carregarProjetos(page, true)} />
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <ProjetosSkeleton />
      ) : projetos.length === 0 ? (
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          Nenhum projeto encontrado.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
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
