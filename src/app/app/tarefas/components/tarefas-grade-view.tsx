import Link from "next/link"

import type { TarefaItem } from "@/types/tarefas"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTarefaStatusStyles } from "./tarefas-status-styles"

function getStatusLabel(status: TarefaItem["status"]) {
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

export function TarefasGradeView({
  tarefas,
  onArquivar,
  archivingTaskId,
}: {
  tarefas: TarefaItem[]
  onArquivar: (tarefaId: number) => void
  archivingTaskId: number | null
}) {
  if (tarefas.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Nenhuma tarefa encontrada para os filtros selecionados.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {tarefas.map((tarefa) => {
        const statusStyles = getTarefaStatusStyles(tarefa.status)

        return (
          <Card key={tarefa.id} className={`h-full transition-colors hover:bg-muted/40 ${statusStyles.card}`}>
            <CardHeader className="space-y-3">
              <CardTitle className="line-clamp-2 text-lg leading-snug">
                <Link href={`/app/tarefas/${tarefa.id}`} className="underline underline-offset-4">
                  {tarefa.nome}
                </Link>
              </CardTitle>
              {tarefa.tarefaPaiId ? (
                <Badge className="w-fit bg-yellow-500/10 text-yellow-700 dark:text-yellow-300">
                  Sub-tarefa
                </Badge>
              ) : null}
              <Badge className={`w-fit ${statusStyles.chip}`}>
                {getStatusLabel(tarefa.status)}
              </Badge>
              <Badge className={`w-fit ${getPrioridadeClassName(tarefa.prioridade)}`}>
                Prioridade: {getPrioridadeLabel(tarefa.prioridade)}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="truncate"><b>Responsavel:</b> {tarefa.responsaveis[0]?.name ?? "Nao definido"}</p>
              <p className="truncate"><b>Projeto: </b>{tarefa.projeto?.nome ?? "Sem projeto"}</p>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/app/tarefas/${tarefa.id}`} />}
                  nativeButton={false}
                >
                  Visualizar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onArquivar(tarefa.id)}
                  disabled={archivingTaskId === tarefa.id}
                >
                  Arquivar
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
