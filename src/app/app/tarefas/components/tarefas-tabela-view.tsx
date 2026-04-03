import Link from "next/link"

import type {TarefaItem} from "@/types/tarefas"
import {Badge} from "@/components/ui/badge"
import {Card, CardContent} from "@/components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {getTarefaStatusStyles} from "./tarefas-status-styles"

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

export function TarefasTabelaView({tarefas}: { tarefas: TarefaItem[] }) {
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
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tarefa</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Prioridade</TableHead>
                            <TableHead>Responsavel</TableHead>
                            <TableHead>Projeto</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tarefas.map((tarefa) => {
                            const statusStyles = getTarefaStatusStyles(tarefa.status)

                            return (
                                <TableRow key={tarefa.id}>
                                    <TableCell className="max-w-72">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/app/tarefas/${tarefa.id}`}
                                                className="truncate text-sm underline underline-offset-4"
                                            >
                                                {tarefa.nome}
                                            </Link>
                                            {tarefa.tarefaPaiId ? (
                                                <Badge className="w-fit bg-yellow-500/10 text-yellow-700 dark:text-yellow-300">
                                                    Sub-tarefa
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`w-fit ${statusStyles.chip}`}>
                                            {getStatusLabel(tarefa.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`w-fit ${getPrioridadeClassName(tarefa.prioridade)}`}>
                                            {getPrioridadeLabel(tarefa.prioridade)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{tarefa.responsaveis[0]?.name ?? "Nao definido"}</TableCell>
                                    <TableCell>{tarefa.projeto?.nome ?? "Sem projeto"}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
