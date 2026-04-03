import Link from "next/link"

import type { ProjetoTarefaItem } from "@/types/projetos"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function TarefasProjetoTable({ tarefas }: { tarefas: ProjetoTarefaItem[] }) {
  if (tarefas.length === 0) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        Nenhuma tarefa encontrada para este projeto.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titulo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Responsavel</TableHead>
          <TableHead>Data vencimento</TableHead>
          <TableHead>Prioridade</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tarefas.map((tarefa) => (
          <TableRow key={tarefa.id}>
            <TableCell>
              <Link
                href={`/app/tarefas/${tarefa.id}`}
                className="text-sm underline underline-offset-4"
              >
                {tarefa.nome}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{tarefa.status}</Badge>
            </TableCell>
            <TableCell>
              {tarefa.responsaveis.length > 0 ? tarefa.responsaveis[0].name : "--"}
            </TableCell>
            <TableCell>--</TableCell>
            <TableCell>--</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
