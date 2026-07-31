"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { criarDadosReuniao, listarDadosReuniao } from "@/lib/dados-reuniao-api"
import type { DadosReuniaoItem } from "@/types/dados-reuniao"
import { Button } from "@/components/ui/button"
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

function formatarData(value: string) {
  try {
    return format(parseISO(value), "dd/MM/yyyy")
  } catch {
    return value
  }
}

export default function Page() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [atas, setAtas] = useState<DadosReuniaoItem[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  async function carregarAtas(pageAtual = page) {
    try {
      setIsLoading(true)
      const response = await listarDadosReuniao({ page: pageAtual })
      setAtas(response.data)
      setLastPage(response.lastPage)
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel carregar as atas."))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void carregarAtas(page)
  }, [page])

  async function handleNovaAta() {
    try {
      setIsCreating(true)
      const ata = await criarDadosReuniao()
      router.push(`/app/atas-reuniao/${ata.id}`)
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel criar a ata."))
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Atas de reuniao</h2>
          <p className="text-sm text-muted-foreground">
            Selecione uma ata para editar o conteudo e acompanhar as tarefas.
          </p>
        </div>
        <Button type="button" onClick={() => void handleNovaAta()} disabled={isCreating}>
          <PlusIcon data-icon="inline-start" />
          Nova ata
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : atas.length === 0 ? (
        <div className="py-12 text-sm text-muted-foreground">
          Nenhuma ata encontrada. Crie a primeira para comecar.
        </div>
      ) : (
        <div className="flex flex-col">
          {atas.map((ata) => (
            <Link
              key={ata.id}
              href={`/app/atas-reuniao/${ata.id}`}
              className="flex items-center justify-between border-b border-border/50 py-3 text-sm transition-colors hover:bg-muted/40"
            >
              <span className="font-medium">Ata {formatarData(ata.data)}</span>
              <span className="text-muted-foreground">#{ata.id}</span>
            </Link>
          ))}
        </div>
      )}

      {lastPage > 1 ? (
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
      ) : null}
    </div>
  )
}
