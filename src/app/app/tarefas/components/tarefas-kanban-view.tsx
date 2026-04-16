"use client"

import Link from "next/link"
import { type ReactNode, useRef, useState } from "react"
import { EyeIcon } from "lucide-react"
import { DragDropProvider, DragOverlay, useDroppable } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"

import type { TarefaItem, TarefasKanban, TarefaStatus } from "@/types/tarefas"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTarefaStatusStyles } from "./tarefas-status-styles"

const colunas: Array<{ status: TarefaStatus; titulo: string }> = [
  { status: "pendente", titulo: "Pendente" },
  { status: "em andamento", titulo: "Em andamento" },
  { status: "revisao", titulo: "Em revisao" },
  { status: "finalizado", titulo: "Finalizado" },
]

function getPrioridadeLabel(prioridade: TarefaItem["prioridade"]) {
  if (prioridade === "alto") {
    return "Alto"
  }

  if (prioridade === "medio") {
    return "Medio"
  }

  return "Baixo"
}

function getPrioridadeClassName(prioridade: TarefaItem["prioridade"]) {
  if (prioridade === "alto") {
    return "bg-red-500/10 text-red-600 dark:text-red-300"
  }

  if (prioridade === "medio") {
    return "bg-orange-500/10 text-orange-600 dark:text-orange-300"
  }

  return "bg-blue-500/10 text-blue-600 dark:text-blue-300"
}

function KanbanColumn({
  status,
  titulo,
  total,
  isHighlighted,
  children,
}: {
  status: TarefaStatus
  titulo: string
  total: number
  isHighlighted: boolean
  children: ReactNode
}) {
  const { ref, isDropTarget } = useDroppable({
    id: `coluna-${status}`,
    data: { status, type: "coluna" as const },
  })
  const styles = getTarefaStatusStyles(status)

  return (
    <Card
      className={`flex h-full min-h-0 overflow-hidden flex-col border-t-2 transition-colors ${styles.coluna} ${isHighlighted ? "bg-muted/20" : ""}`}
    >
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">{titulo}</CardTitle>
        <Badge className={styles.chip}>{total}</Badge>
      </CardHeader>
      <CardContent
        ref={ref}
        className={`min-h-0 flex-1 space-y-3 overflow-y-auto rounded-md p-3 transition-colors ${isDropTarget || isHighlighted ? "bg-muted/40" : ""}`}
        style={{ contain: "strict" }}
      >
        {children}
      </CardContent>
    </Card>
  )
}

function KanbanTaskCard({
  tarefa,
  index,
  status,
  isSaving,
  isArchiving,
  isDropTarget,
  onArquivar,
}: {
  tarefa: TarefaItem
  index: number
  status: TarefaStatus
  isSaving: boolean
  isArchiving: boolean
  isDropTarget: boolean
  onArquivar: (tarefaId: number) => void
}) {
  const sortable = useSortable({
    id: `tarefa-${tarefa.id}`,
    index,
    group: "tarefas",
    type: "tarefa",
    accept: "tarefa",
    data: {
      tarefaId: tarefa.id,
      tarefa,
      status,
      type: "tarefa" as const,
    },
    disabled: isSaving,
  })
  const styles = getTarefaStatusStyles(status)

  return (
    <Card
      ref={sortable.ref}
      className={`cursor-grab transition-colors hover:bg-muted/40 active:cursor-grabbing ${styles.card} ${
        isDropTarget ? "bg-muted/50" : ""
      } ${
        sortable.isDragging || isSaving ? "opacity-30" : ""
      }`}
    >
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="inline-flex items-center rounded-sm border px-2 py-1 text-xs text-muted-foreground">
            Arrastar
          </p>

          <div className="flex items-center gap-2">
            <Link
              href={`/app/tarefas/${tarefa.id}`}
              className="inline-flex items-center justify-center rounded-sm border p-1 text-muted-foreground transition-colors hover:bg-muted"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <EyeIcon className="size-4" />
              <span className="sr-only">Visualizar tarefa</span>
            </Link>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation()
                onArquivar(tarefa.id)
              }}
              disabled={isSaving || isArchiving}
            >
              Arquivar
            </Button>
          </div>
        </div>

        <div>
          <p className="line-clamp-2 text-base font-medium leading-snug">{tarefa.nome}</p>
          {tarefa.tarefaPaiId ? (
            <Badge className="mt-2 w-fit bg-yellow-500/10 text-yellow-700 dark:text-yellow-300">
              Sub-tarefa
            </Badge>
          ) : null}
          <Badge className={`mt-2 w-fit ${getPrioridadeClassName(tarefa.prioridade)}`}>
            Prioridade: {getPrioridadeLabel(tarefa.prioridade)}
          </Badge>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            <span className="font-semibold">Projeto:</span> {tarefa.projeto?.nome ?? "Sem projeto"}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            <span className="font-semibold">Responsaveis:</span>{" "}
            {tarefa.responsaveis.length > 0
              ? tarefa.responsaveis.map((item) => item.name).join(", ")
              : "Nao definido"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

type KanbanDragData = {
  type?: "tarefa" | "coluna"
  status?: TarefaStatus
  tarefaId?: number
  tarefa?: TarefaItem
}

type KanbanDragNode = {
  id?: string | number
  data?: KanbanDragData | { current?: KanbanDragData }
} | null

type KanbanDragEvent = {
  canceled?: boolean
  source?: KanbanDragNode | null
  target?: KanbanDragNode | null
  operation?: {
    source?: KanbanDragNode | null
    target?: KanbanDragNode | null
  }
}

function parseStatusFromDropId(id: string): TarefaStatus | null {
  const normalized = id.startsWith("coluna-") ? id.replace("coluna-", "") : id

  if (
    normalized === "pendente" ||
    normalized === "em andamento" ||
    normalized === "revisao" ||
    normalized === "finalizado"
  ) {
    return normalized
  }

  return null
}

function parseTaskId(value: string | number | undefined): number | null {
  if (typeof value === "number") {
    return value
  }

  if (typeof value !== "string") {
    return null
  }

  const normalized = value.startsWith("tarefa-")
    ? value.replace("tarefa-", "")
    : value

  if (!normalized.trim()) {
    return null
  }

  const parsed = Number(normalized)
  return Number.isNaN(parsed) ? null : parsed
}

function getTaskIndexById(items: TarefaItem[], tarefaId: number) {
  return items.findIndex((item) => item.id === tarefaId)
}

function getNodeData(node: KanbanDragNode): KanbanDragData | null {
  if (!node?.data) {
    return null
  }

  if ("current" in node.data) {
    return node.data.current ?? null
  }

  return node.data as KanbanDragData
}

function KanbanTaskDragPreview({
  tarefa,
  status,
}: {
  tarefa: TarefaItem
  status: TarefaStatus
}) {
  const styles = getTarefaStatusStyles(status)

  return (
    <Card className={`w-72 shadow-xl ${styles.card}`}>
      <CardContent className="space-y-2 p-4">
        <p className="inline-flex items-center rounded-sm border px-2 py-1 text-xs text-muted-foreground">
          Arrastando
        </p>
        <p className="line-clamp-2 text-base font-medium leading-snug">{tarefa.nome}</p>
        {tarefa.tarefaPaiId ? (
          <Badge className="w-fit bg-yellow-500/10 text-yellow-700 dark:text-yellow-300">
            Sub-tarefa
          </Badge>
        ) : null}
        <Badge className={`w-fit ${getPrioridadeClassName(tarefa.prioridade)}`}>
          Prioridade: {getPrioridadeLabel(tarefa.prioridade)}
        </Badge>
        <p className="truncate text-sm text-muted-foreground">
          <b>Projeto:</b> {tarefa.projeto?.nome ?? "Sem projeto"}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          <b>Responsaveis:</b>{" "}
          {tarefa.responsaveis.length > 0
            ? tarefa.responsaveis.map((item) => item.name).join(", ")
            : "Nao definido"}
        </p>
      </CardContent>
    </Card>
  )
}

export function TarefasKanbanView({
  tarefas,
  movingTaskId,
  archivingTaskId,
  onMove,
  onArquivar,
}: {
  tarefas: TarefasKanban
  movingTaskId: number | null
  archivingTaskId: number | null
  onMove: ({
    tarefaId,
    statusOrigem,
    statusDestino,
    indexDestino,
  }: {
    tarefaId: number
    statusOrigem: TarefaStatus
    statusDestino: TarefaStatus
    indexDestino?: number
  }) => Promise<void>
  onArquivar: (tarefaId: number) => void
}) {
  const [activeTask, setActiveTask] = useState<{ tarefa: TarefaItem; status: TarefaStatus } | null>(null)
  const [highlightedStatus, setHighlightedStatus] = useState<TarefaStatus | null>(null)
  const [highlightedTaskId, setHighlightedTaskId] = useState<number | null>(null)
  const lastOverStatusRef = useRef<TarefaStatus | null>(null)
  const lastOverTaskIdRef = useRef<number | null>(null)

  function deferStateUpdate(callback: () => void) {
    queueMicrotask(callback)
  }

  const totalTarefas =
    tarefas.pendente.length +
    tarefas["em andamento"].length +
    tarefas.revisao.length +
    tarefas.finalizado.length

  function clearHighlights() {
    lastOverStatusRef.current = null
    lastOverTaskIdRef.current = null

    deferStateUpdate(() => {
      setActiveTask(null)
      setHighlightedStatus(null)
      setHighlightedTaskId(null)
    })
  }

  function resolveSource(event: KanbanDragEvent) {
    return event.operation?.source ?? event.source ?? null
  }

  function resolveTarget(event: KanbanDragEvent) {
    return event.operation?.target ?? event.target ?? null
  }

  function handleDragStart(event: KanbanDragEvent) {
    const source = resolveSource(event)
    const sourceData = getNodeData(source)
    const status = sourceData?.status
    const tarefaId = sourceData?.tarefaId ?? parseTaskId(source?.id)

    if (!status || typeof tarefaId !== "number") {
      return
    }

    const tarefa = sourceData?.tarefa

    if (!tarefa) {
      return
    }

    lastOverStatusRef.current = status
    lastOverTaskIdRef.current = tarefaId

    deferStateUpdate(() => {
      setActiveTask({ tarefa, status })
    })
  }

  function handleDragOver(event: KanbanDragEvent) {
    const target = resolveTarget(event)
    const targetData = getNodeData(target)

    if (!target) {
      deferStateUpdate(() => {
        setHighlightedStatus(null)
        setHighlightedTaskId(null)
      })

      return
    }

    const rawId = target.id
    const status =
      targetData?.status ??
      (typeof rawId === "string" ? parseStatusFromDropId(rawId) : null)
    const tarefaId = targetData?.tarefaId ?? parseTaskId(rawId)

    lastOverStatusRef.current = status
    lastOverTaskIdRef.current = typeof tarefaId === "number" ? tarefaId : null

    deferStateUpdate(() => {
      setHighlightedStatus(status)
      setHighlightedTaskId(typeof tarefaId === "number" ? tarefaId : null)
    })
  }

  function handleDragEnd(event: KanbanDragEvent) {
    if (event.canceled) {
      clearHighlights()
      return
    }

    const source = resolveSource(event)
    const target = resolveTarget(event)
    const sourceData = getNodeData(source)
    const targetData = getNodeData(target)

    const tarefaId = sourceData?.tarefaId ?? parseTaskId(source?.id) ?? activeTask?.tarefa.id
    const statusOrigem = sourceData?.status ?? activeTask?.status
    const targetRawId = target?.id
    const isSelfTarget = targetData?.type === "tarefa" && targetData.tarefaId === tarefaId
    const statusDestino =
      highlightedStatus ??
      lastOverStatusRef.current ??
      (!isSelfTarget ? targetData?.status : null) ??
      (typeof targetRawId === "string" ? parseStatusFromDropId(targetRawId) : null)

    if (typeof tarefaId !== "number" || !statusOrigem || !statusDestino) {
      clearHighlights()
      return
    }

    let indexDestino: number | undefined
    const tarefaDestinoId =
      highlightedTaskId ??
      lastOverTaskIdRef.current ??
      (!isSelfTarget ? targetData?.tarefaId : null) ??
      parseTaskId(targetRawId)

    if (typeof tarefaDestinoId === "number") {
      const indexEncontrado = getTaskIndexById(tarefas[statusDestino], tarefaDestinoId)

      if (indexEncontrado >= 0) {
        indexDestino = indexEncontrado
      }
    }

    if (indexDestino === undefined) {
      indexDestino = tarefas[statusDestino].length
    }

    void onMove({
      tarefaId,
      statusOrigem,
      statusDestino,
      indexDestino,
    }).finally(() => {
      clearHighlights()
    })
  }

  if (totalTarefas === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Nenhuma tarefa encontrada para os filtros selecionados.
        </CardContent>
      </Card>
    )
  }

  return (
    <DragDropProvider
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen overflow-hidden">
        <div className="grid h-full min-h-0 gap-4 overflow-hidden xl:grid-cols-4">
          {colunas.map((coluna) => (
            <KanbanColumn
              key={coluna.status}
              status={coluna.status}
              titulo={coluna.titulo}
              total={tarefas[coluna.status].length}
              isHighlighted={highlightedStatus === coluna.status}
            >
              {tarefas[coluna.status].map((tarefa, index) => (
                <KanbanTaskCard
                  key={tarefa.id}
                  tarefa={tarefa}
                  index={index}
                  status={coluna.status}
                  isSaving={movingTaskId === tarefa.id}
                  isArchiving={archivingTaskId === tarefa.id}
                  isDropTarget={highlightedTaskId === tarefa.id}
                  onArquivar={onArquivar}
                />
              ))}

              {tarefas[coluna.status].length === 0 ? (
                <div className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">
                  Solte uma tarefa aqui.
                </div>
              ) : null}
            </KanbanColumn>
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeTask ? <KanbanTaskDragPreview tarefa={activeTask.tarefa} status={activeTask.status} /> : null}
      </DragOverlay>
    </DragDropProvider>
  )
}
