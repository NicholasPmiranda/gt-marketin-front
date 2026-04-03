"use client"

import Link from "next/link"
import { type ReactNode, useState } from "react"
import { EyeIcon } from "lucide-react"
import { CSS } from "@dnd-kit/utilities"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"

import type { TarefaItem, TarefasKanban, TarefaStatus } from "@/types/tarefas"
import { Badge } from "@/components/ui/badge"
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
  children,
}: {
  status: TarefaStatus
  titulo: string
  total: number
  children: ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `coluna-${status}`,
    data: { status },
  })
  const styles = getTarefaStatusStyles(status)

  return (
    <Card className={`h-fit border-t-2 ${styles.coluna}`}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">{titulo}</CardTitle>
        <Badge className={styles.chip}>{total}</Badge>
      </CardHeader>
      <CardContent
        ref={setNodeRef}
        className={`min-h-24 space-y-3 rounded-md p-3 transition-colors ${isOver ? "bg-muted/40" : ""}`}
      >
        {children}
      </CardContent>
    </Card>
  )
}

function KanbanTaskCard({
  tarefa,
  status,
  isSaving,
}: {
  tarefa: TarefaItem
  status: TarefaStatus
  isSaving: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tarefa-${tarefa.id}`,
    data: {
      tarefaId: tarefa.id,
      tarefa,
      status,
    },
  })
  const styles = getTarefaStatusStyles(status)

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      className={`transition-colors hover:bg-muted/40 ${styles.card} ${
        isDragging || isSaving ? "opacity-30" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="inline-flex cursor-grab items-center rounded-sm border px-2 py-1 text-xs text-muted-foreground active:cursor-grabbing">
            Arrastar
          </p>

          <Link
            href={`/app/tarefas/${tarefa.id}`}
            className="inline-flex items-center justify-center rounded-sm border p-1 text-muted-foreground transition-colors hover:bg-muted"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <EyeIcon className="size-4" />
            <span className="sr-only">Visualizar tarefa</span>
          </Link>
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
  onMove,
}: {
  tarefas: TarefasKanban
  movingTaskId: number | null
  onMove: ({
    tarefaId,
    statusOrigem,
    statusDestino,
  }: {
    tarefaId: number
    statusOrigem: TarefaStatus
    statusDestino: TarefaStatus
  }) => Promise<void>
}) {
  const [activeTask, setActiveTask] = useState<{ tarefa: TarefaItem; status: TarefaStatus } | null>(
    null
  )
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const totalTarefas =
    tarefas.pendente.length +
    tarefas["em andamento"].length +
    tarefas.revisao.length +
    tarefas.finalizado.length

  function handleDragStart(event: DragStartEvent) {
    const tarefa = event.active.data.current?.tarefa as TarefaItem | undefined
    const status = event.active.data.current?.status as TarefaStatus | undefined

    if (!tarefa || !status) {
      return
    }

    setActiveTask({ tarefa, status })
  }

  function handleDragCancel(_: DragCancelEvent) {
    setActiveTask(null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      return
    }

    const tarefaId = active.data.current?.tarefaId as number | undefined
    const statusOrigem = active.data.current?.status as TarefaStatus | undefined
    const overId = String(over.id)
    const statusDestino = overId.replace("coluna-", "") as TarefaStatus

    if (!tarefaId || !statusOrigem || !statusDestino || statusOrigem === statusDestino) {
      setActiveTask(null)
      return
    }

    await onMove({
      tarefaId,
      statusOrigem,
      statusDestino,
    })

    setActiveTask(null)
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 xl:grid-cols-4">
        {colunas.map((coluna) => (
          <KanbanColumn
            key={coluna.status}
            status={coluna.status}
            titulo={coluna.titulo}
            total={tarefas[coluna.status].length}
          >
            {tarefas[coluna.status].map((tarefa) => (
              <KanbanTaskCard
                key={tarefa.id}
                tarefa={tarefa}
                status={coluna.status}
                isSaving={movingTaskId === tarefa.id}
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
      <DragOverlay>
        {activeTask ? (
          <KanbanTaskDragPreview tarefa={activeTask.tarefa} status={activeTask.status} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
