"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import { differenceInCalendarDays, format, intervalToDuration, isValid, startOfDay } from "date-fns"
import { toast } from "sonner"

import { criarComentarioTarefa, detalharTarefa, excluirTarefa } from "@/lib/tarefas-api"
import { usePermissaoPerfil } from "@/hooks/use-permissao-perfil"
import type { TarefaDetalhe } from "@/types/tarefas"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CriarSubtarefaModal } from "./components/criar-subtarefa-modal"
import { EditarTarefaForm } from "./components/editar-tarefa-modal"
import { TarefaComentariosCard } from "./components/tarefa-comentarios-card"
import { TarefaDetalheSkeleton } from "./components/tarefa-detalhe-skeleton"

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

function getStatusLabel(status: TarefaDetalhe["status"]) {
  if (status === "em andamento") {
    return "Em andamento"
  }

  if (status === "revisao") {
    return "Em revisao"
  }

  if (status === "finalizado") {
    return "Finalizado"
  }

  return "Pendente"
}

function getStatusChipClassName(status: TarefaDetalhe["status"]) {
  if (status === "pendente") {
    return "bg-orange-500/10 text-orange-600 dark:text-orange-300"
  }

  if (status === "em andamento") {
    return "bg-blue-500/10 text-blue-600 dark:text-blue-300"
  }

  if (status === "revisao") {
    return "bg-violet-500/10 text-violet-600 dark:text-violet-300"
  }

  return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
}

function getPrioridadeLabel(prioridade: TarefaDetalhe["prioridade"]) {
  if (prioridade === "alto") {
    return "Alta"
  }

  if (prioridade === "medio") {
    return "Media"
  }

  return "Baixa"
}

function getPrioridadeChipClassName(prioridade: TarefaDetalhe["prioridade"]) {
  if (prioridade === "alto") {
    return "bg-red-500/10 text-red-600 dark:text-red-300"
  }

  if (prioridade === "medio") {
    return "bg-orange-500/10 text-orange-600 dark:text-orange-300"
  }

  return "bg-blue-500/10 text-blue-600 dark:text-blue-300"
}

function parseDate(value: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  return isValid(date) ? date : null
}

function formatDateTime(value: string | null) {
  const date = parseDate(value)

  if (!date) {
    return "Nao definido"
  }

  return format(date, "dd/MM/yyyy HH:mm")
}

function getAgendamentoResumo(tarefa: Pick<TarefaDetalhe, "agendamento" | "inicio">) {
  const agendamento = parseDate(tarefa.agendamento)

  if (!agendamento) {
    return "Sem agendamento"
  }

  if (!tarefa.inicio) {
    const hoje = startOfDay(new Date())
    const dataAgendada = startOfDay(agendamento)
    const diferencaDias = differenceInCalendarDays(dataAgendada, hoje)

    if (diferencaDias > 0) {
      return `Faltam ${diferencaDias} dia(s)`
    }

    if (diferencaDias < 0) {
      return `Atrasada em ${Math.abs(diferencaDias)} dia(s)`
    }

    return "Agendada para hoje"
  }

  return "Inicio registrado"
}

function getDuracaoLabel(tarefa: Pick<TarefaDetalhe, "inicio" | "fim">) {
  const inicio = parseDate(tarefa.inicio)
  const fim = parseDate(tarefa.fim)

  if (!inicio || !fim || fim < inicio) {
    return "Nao definido"
  }

  const duracao = intervalToDuration({ start: inicio, end: fim })
  const partes: string[] = []

  if (duracao.days) {
    partes.push(`${duracao.days}d`)
  }

  if (duracao.hours) {
    partes.push(`${duracao.hours}h`)
  }

  if (duracao.minutes) {
    partes.push(`${duracao.minutes}min`)
  }

  if (duracao.seconds && partes.length === 0) {
    partes.push(`${duracao.seconds}s`)
  }

  return partes.length > 0 ? partes.join(" ") : "0min"
}

export default function Page({
  params,
}: {
  params: Promise<{ tarefaId: string }>
}) {
  const { tarefaId } = use(params)
  const tarefaIdNumber = Number(tarefaId)
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeletingTask, setIsDeletingTask] = useState(false)
  const [tarefa, setTarefa] = useState<TarefaDetalhe | null>(null)
  const { podeCriarTarefa, podeGerenciarTarefa } = usePermissaoPerfil()

  async function carregarTarefa() {
    try {
      setIsLoading(true)
      const response = await detalharTarefa(tarefaIdNumber)
      setTarefa(response)
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel carregar os detalhes da tarefa."))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void carregarTarefa()
  }, [tarefaIdNumber])

  async function handleCriarComentario(comentario: string) {
    try {
      setIsSavingComment(true)
      await criarComentarioTarefa({
        tarefa_id: tarefaIdNumber,
        comentario,
      })

      toast.success("Comentario adicionado com sucesso.")
      await carregarTarefa()
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel adicionar o comentario."))
    } finally {
      setIsSavingComment(false)
    }
  }

  async function handleExcluirTarefa() {
    if (!podeGerenciarTarefa) {
      toast.error("Voce nao tem permissao para esta operacao")
      return
    }

    try {
      setIsDeletingTask(true)
      await excluirTarefa(tarefaIdNumber)
      toast.success("Tarefa excluida com sucesso.")
      router.push("/app/tarefas")
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel excluir a tarefa."))
    } finally {
      setIsDeletingTask(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        <TarefaDetalheSkeleton />
      </div>
    )
  }

  if (!tarefa) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Tarefa nao encontrada.</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {podeGerenciarTarefa ? (
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger render={<Button type="button" variant="destructive" />}>Excluir tarefa</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acao vai remover a tarefa {tarefa.nome}. Deseja continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel render={<Button type="button" variant="outline" />}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  render={<Button type="button" variant="destructive" />}
                  onClick={handleExcluirTarefa}
                  disabled={isDeletingTask}
                >
                  {isDeletingTask ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}

      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {podeGerenciarTarefa ? <EditarTarefaForm tarefa={tarefa} onUpdated={carregarTarefa} /> : null}

          <Card>
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl">{tarefa.nome}</CardTitle>
              <Badge className={`w-fit ${getStatusChipClassName(tarefa.status)}`}>
                {getStatusLabel(tarefa.status)}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tarefa.descricao || "Sem descricao"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Subtarefas</CardTitle>
              {podeCriarTarefa ? <CriarSubtarefaModal tarefa={tarefa} onCreated={carregarTarefa} /> : null}
            </CardHeader>
            <CardContent>
              {tarefa.subtarefas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioridade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tarefa.subtarefas.map((subtarefa) => (
                      <TableRow key={subtarefa.id}>
                        <TableCell>
                          <Link
                            href={`/app/tarefas/${subtarefa.id}`}
                            className="text-sm underline underline-offset-4"
                          >
                            {subtarefa.nome}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusChipClassName(subtarefa.status)}>
                            {getStatusLabel(subtarefa.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPrioridadeChipClassName(subtarefa.prioridade)}>
                            {getPrioridadeLabel(subtarefa.prioridade)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Nenhuma subtarefa cadastrada.
                </div>
              )}
            </CardContent>
          </Card>

          <TarefaComentariosCard
            comentarios={tarefa.comentarios}
            isSaving={isSavingComment}
            onSubmit={handleCriarComentario}
          />
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Informacoes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Projeto</p>
              <p className="font-medium">{tarefa.projeto?.nome || "Sem projeto"}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge className={`mt-1 w-fit ${getStatusChipClassName(tarefa.status)}`}>
                {getStatusLabel(tarefa.status)}
              </Badge>
            </div>

            <div>
              <p className="text-muted-foreground">Prioridade</p>
              <Badge className={`mt-1 w-fit ${getPrioridadeChipClassName(tarefa.prioridade)}`}>
                {getPrioridadeLabel(tarefa.prioridade)}
              </Badge>
            </div>

            <div>
              <p className="text-muted-foreground">Agendamento</p>
              <p className="font-medium">{formatDateTime(tarefa.agendamento)}</p>
              <p className="text-muted-foreground">{getAgendamentoResumo(tarefa)}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Inicio</p>
              <p className="font-medium">{formatDateTime(tarefa.inicio)}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Fim</p>
              <p className="font-medium">{formatDateTime(tarefa.fim)}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Duracao</p>
              <p className="font-medium">{getDuracaoLabel(tarefa)}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Responsaveis</p>
              <p className="font-medium">
                {tarefa.responsaveis.length > 0
                  ? tarefa.responsaveis.map((item) => item.name).join(", ")
                  : "Nao definido"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Etiquetas</p>
              {tarefa.etiquetas.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tarefa.etiquetas.map((etiqueta) => (
                    <Badge key={etiqueta.id} variant="secondary">
                      {etiqueta.nome}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="font-medium">Sem etiquetas</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
