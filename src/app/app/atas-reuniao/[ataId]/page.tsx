"use client"

import Link from "next/link"
import { use, useEffect, useRef, useState } from "react"
import { format, parseISO } from "date-fns"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import {
  atualizarConteudoDadosReuniao,
  detalharDadosReuniao,
} from "@/lib/dados-reuniao-api"
import type { DadosReuniaoDetalhe } from "@/types/dados-reuniao"
import { NotionEditor } from "@/components/notion-editor/notion-editor"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AtaTarefasPainel } from "./components/ata-tarefas-painel"

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

export default function Page({
  params,
}: {
  params: Promise<{ ataId: string }>
}) {
  const { ataId } = use(params)
  const ataIdNumber = Number(ataId)

  const [isLoading, setIsLoading] = useState(true)
  const [ata, setAta] = useState<DadosReuniaoDetalhe | null>(null)
  const [conteudo, setConteudo] = useState("")
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSaved = useRef("")
  const readyToSave = useRef(false)

  async function carregarAta() {
    try {
      setIsLoading(true)
      readyToSave.current = false
      const response = await detalharDadosReuniao(ataIdNumber)
      setAta(response)
      setConteudo(response.conteudo)
      lastSaved.current = response.conteudo
      readyToSave.current = true
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel carregar a ata."))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void carregarAta()
  }, [ataIdNumber])

  useEffect(() => {
    if (!readyToSave.current || conteudo === lastSaved.current) {
      return
    }

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current)
    }

    setSaveState("idle")
    const conteudoParaSalvar = conteudo
    saveTimeout.current = setTimeout(() => {
      void (async () => {
        try {
          setSaveState("saving")
          const atualizada = await atualizarConteudoDadosReuniao(
            ataIdNumber,
            conteudoParaSalvar
          )
          // Usa o conteudo enviado para evitar loop se a API devolver
          // uma serializacao levemente diferente.
          lastSaved.current = conteudoParaSalvar
          setAta((atual) =>
            atual
              ? {
                  ...atual,
                  ...atualizada,
                  conteudo: conteudoParaSalvar,
                }
              : atualizada
          )
          setSaveState("saved")
        } catch (error) {
          setSaveState("error")
          toast.error(getErrorMessage(error, "Nao foi possivel salvar o conteudo."))
        }
      })()
    }, 800)

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current)
      }
    }
  }, [ataIdNumber, conteudo])

  if (!isLoading && !ata) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <p className="text-sm text-muted-foreground">Ata nao encontrada.</p>
        <Button type="button" variant="ghost" render={<Link href="/app/atas-reuniao" />}>
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            render={<Link href="/app/atas-reuniao" />}
          >
            <ArrowLeftIcon />
          </Button>
          <div>
            {isLoading || !ata ? (
              <Skeleton className="h-7 w-40" />
            ) : (
              <>
                <h2 className="text-lg font-medium">Ata {formatarData(ata.data)}</h2>
                <p className="text-xs text-muted-foreground">
                  {saveState === "saving"
                    ? "Salvando..."
                    : saveState === "saved"
                      ? "Salvo"
                      : saveState === "error"
                        ? "Erro ao salvar"
                        : "Edicao automatica"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-6 md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {isLoading || !ata ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <NotionEditor value={conteudo} onChange={setConteudo} />
          )}
        </div>

        <aside className="min-w-0 border-t border-border/40 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
          <AtaTarefasPainel ataId={ataIdNumber} />
        </aside>
      </div>
    </div>
  )
}
