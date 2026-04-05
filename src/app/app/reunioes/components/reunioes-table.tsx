import Link from "next/link"
import { format } from "date-fns"

import type { ReuniaoItem } from "@/types/reunioes"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function formatDate(value: string | null) {
  if (!value) {
    return "Nao informado"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Nao informado"
  }

  return format(date, "dd/MM/yyyy HH:mm")
}

export function ReunioesTable({ reunioes }: { reunioes: ReuniaoItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titulo</TableHead>
          <TableHead>Zerogap ID</TableHead>
          <TableHead>Inicio gravacao</TableHead>
          <TableHead>Fim gravacao</TableHead>
          <TableHead>Dominio convidados</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reunioes.map((reuniao) => (
          <TableRow key={reuniao.id}>
            <TableCell>
              <div className="space-y-1">
                <Link href={`/app/reunioes/${reuniao.id}`} className="text-sm font-medium underline underline-offset-4">
                  {reuniao.titulo || reuniao.tituloReuniao || `Reuniao #${reuniao.id}`}
                </Link>
                {reuniao.tituloReuniao ? (
                  <p className="text-xs text-muted-foreground">{reuniao.tituloReuniao}</p>
                ) : null}
              </div>
            </TableCell>
            <TableCell>{reuniao.zerogapId || "Nao informado"}</TableCell>
            <TableCell>{formatDate(reuniao.inicioGravacaoEm)}</TableCell>
            <TableCell>{formatDate(reuniao.fimGravacaoEm)}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {reuniao.tipoDominioConvidadosCalendario || "Nao informado"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
