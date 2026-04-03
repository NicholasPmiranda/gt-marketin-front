import { CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CredencialItem } from "@/types/credenciais"

type CredenciaisTableProps = {
  credenciais: CredencialItem[]
  onRowClick: (credencial: CredencialItem) => void
  onCopySenha: (senha: string) => void
}

export function CredenciaisTable({
  credenciais,
  onRowClick,
  onCopySenha,
}: CredenciaisTableProps) {
  if (credenciais.length === 0) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        Nenhuma credencial encontrada.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Acesso</TableHead>
            <TableHead>Senha</TableHead>
            <TableHead>Liberados</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {credenciais.map((credencial) => (
            <TableRow
              key={credencial.id}
              className="cursor-pointer"
              onClick={() => onRowClick(credencial)}
            >
              <TableCell className="font-medium">{credencial.nome}</TableCell>
              <TableCell>{credencial.url}</TableCell>
              <TableCell>{credencial.acesso}</TableCell>
              <TableCell>
                <div className="group inline-flex items-center gap-1">
                  <span className="font-mono text-sm">******</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(event) => {
                      event.stopPropagation()
                      onCopySenha(credencial.senha)
                    }}
                    aria-label="Copiar senha"
                  >
                    <CopyIcon className="size-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                {credencial.liberados.length > 0
                  ? credencial.liberados.map((liberado) => liberado.name).join(", ")
                  : "Sem acessos"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
