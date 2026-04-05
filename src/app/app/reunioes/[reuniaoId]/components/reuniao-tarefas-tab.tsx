"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import { gerarTarefasAiReuniao } from "@/lib/reunioes-api"
import type { TarefaAiItem } from "@/types/reunioes"
import { AprovarTarefasAiModal } from "./aprovar-tarefas-ai-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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

export function ReuniaoTarefasTab({ reuniaoId }: { reuniaoId: number }) {
  const [isLoading, setIsLoading] = useState(false)
  const [tarefasAi, setTarefasAi] = useState<TarefaAiItem[]>([])
  const [selecionadas, setSelecionadas] = useState<number[]>([])

  async function gerarTarefas() {
    try {
      setIsLoading(true)
      const response = await gerarTarefasAiReuniao(reuniaoId)
      setTarefasAi(response)
      setSelecionadas([])

      if (response.length === 0) {
        toast.success("A IA nao retornou sugestoes de tarefas para esta reuniao.")
        return
      }

      toast.success("Sugestoes de tarefas geradas com sucesso.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel gerar tarefas de IA para a reuniao."))
    } finally {
      setIsLoading(false)
    }
  }

  function toggleSelecionada(tarefaAiId: number, checked: boolean) {
    if (checked) {
      setSelecionadas((estadoAtual) => [...estadoAtual, tarefaAiId])
      return
    }

    setSelecionadas((estadoAtual) => estadoAtual.filter((id) => id !== tarefaAiId))
  }

  const qtdSelecionadas = useMemo(() => selecionadas.length, [selecionadas])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Tarefas</CardTitle>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={gerarTarefas} disabled={isLoading}>
            {isLoading ? "Gerando..." : "Gerar tarefas com IA"}
          </Button>
          <AprovarTarefasAiModal tarefaAiIds={selecionadas} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : tarefasAi.length > 0 ? (
          <ul className="space-y-2">
            {tarefasAi.map((tarefaAi) => (
              <li key={tarefaAi.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selecionadas.includes(tarefaAi.id)}
                    onCheckedChange={(value) => toggleSelecionada(tarefaAi.id, value === true)}
                  />
                  <div className="space-y-1">
                    <p className="font-medium">{tarefaAi.tarefaModeloNome}</p>
                    <p className="text-muted-foreground">{tarefaAi.motivo || "Sem motivo informado."}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Clique em "Gerar tarefas com IA" para visualizar as sugestoes e aprovar as que deseja salvar no projeto.
          </div>
        )}

        {qtdSelecionadas > 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{qtdSelecionadas} tarefa(s) selecionada(s).</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
