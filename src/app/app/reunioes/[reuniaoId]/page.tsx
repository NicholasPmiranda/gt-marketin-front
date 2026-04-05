"use client"

import Link from "next/link"
import { use, useEffect, useState } from "react"
import { format } from "date-fns"
import { toast } from "sonner"

import { detalharReuniao } from "@/lib/reunioes-api"
import type { ReuniaoDetalhe } from "@/types/reunioes"
import { ReuniaoResumoTab } from "./components/reuniao-resumo-tab"
import { ReuniaoDetalheSkeleton } from "./components/reuniao-detalhe-skeleton"
import { ReuniaoTarefasTab } from "./components/reuniao-tarefas-tab"
import { ReuniaoTranscricaoTab } from "./components/reuniao-transcricao-tab"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

function formatDateTime(value: string | null) {
  if (!value) {
    return "Nao informado"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Nao informado"
  }

  return format(date, "dd/MM/yyyy HH:mm")
}

export default function Page({
  params,
}: {
  params: Promise<{ reuniaoId: string }>
}) {
  const { reuniaoId } = use(params)
  const reuniaoIdNumber = Number(reuniaoId)

  const [isLoading, setIsLoading] = useState(true)
  const [reuniao, setReuniao] = useState<ReuniaoDetalhe | null>(null)

  async function carregarReuniao() {
    try {
      setIsLoading(true)
      const response = await detalharReuniao(reuniaoIdNumber)
      setReuniao(response)
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel carregar os detalhes da reuniao."))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void carregarReuniao()
  }, [reuniaoIdNumber])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        <ReuniaoDetalheSkeleton />
      </div>
    )
  }

  if (!reuniao) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Reuniao nao encontrada.</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">{reuniao.titulo || reuniao.tituloReuniao || `Reuniao #${reuniao.id}`}</h1>
          {reuniao.tituloReuniao ? (
            <p className="text-sm text-muted-foreground">{reuniao.tituloReuniao}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Tabs defaultValue="tarefas" className="w-full">
            <TabsList>
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="transcricao">Transcricao</TabsTrigger>
              <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
            </TabsList>

            <TabsContent value="resumo">
              <ReuniaoResumoTab reuniaoId={reuniao.id} />
            </TabsContent>

            <TabsContent value="transcricao">
              <ReuniaoTranscricaoTab reuniaoId={reuniao.id} />
            </TabsContent>

            <TabsContent value="tarefas">
              <ReuniaoTarefasTab reuniaoId={reuniao.id} />
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">URL da reuniao</p>
                {reuniao.url ? (
                  <Link href={reuniao.url} target="_blank" className="underline underline-offset-4">
                    {reuniao.url}
                  </Link>
                ) : (
                  <p>Nao informado</p>
                )}
              </div>

              <div>
                <p className="text-muted-foreground">URL de compartilhamento</p>
                {reuniao.urlCompartilhamento ? (
                  <Link href={reuniao.urlCompartilhamento} target="_blank" className="underline underline-offset-4">
                    {reuniao.urlCompartilhamento}
                  </Link>
                ) : (
                  <p>Nao informado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Informacoes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Inicio agendado</p>
              <p className="font-medium">{formatDateTime(reuniao.inicioAgendadoEm)}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Fim agendado</p>
              <p className="font-medium">{formatDateTime(reuniao.fimAgendadoEm)}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Inicio gravacao</p>
              <p className="font-medium">{formatDateTime(reuniao.inicioGravacaoEm)}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Fim gravacao</p>
              <p className="font-medium">{formatDateTime(reuniao.fimGravacaoEm)}</p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
