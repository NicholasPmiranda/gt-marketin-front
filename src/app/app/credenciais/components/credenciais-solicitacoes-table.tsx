"use client"

import { useState } from "react"
import { toast } from "sonner"

import { analisarCredencialSolicitacaoConfig } from "@/lib/credenciais-api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CredencialSolicitacaoItem } from "@/types/credenciais"

type CredenciaisSolicitacoesTableProps = {
  solicitacoes: CredencialSolicitacaoItem[]
  onChanged: () => Promise<void>
}

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

function getStatusLabel(status: CredencialSolicitacaoItem["status"]) {
  if (status === "aprovado") {
    return "Aprovado"
  }

  if (status === "rejeitado") {
    return "Rejeitado"
  }

  return "Pendente"
}

export function CredenciaisSolicitacoesTable({
  solicitacoes,
  onChanged,
}: CredenciaisSolicitacoesTableProps) {
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null)

  async function analisarSolicitacao(solicitacaoId: number, aceitar: boolean) {
    setLoadingActionId(solicitacaoId)

    try {
      await analisarCredencialSolicitacaoConfig(solicitacaoId, { aceitar })
      toast.success(aceitar ? "Solicitacao aprovada com sucesso." : "Solicitacao rejeitada com sucesso.")
      await onChanged()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel analisar a solicitacao."))
    } finally {
      setLoadingActionId(null)
    }
  }

  if (solicitacoes.length === 0) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        Nenhuma solicitacao pendente no momento.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Credencial</TableHead>
            <TableHead>Solicitante</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {solicitacoes.map((solicitacao) => {
            const isLoadingAction = loadingActionId === solicitacao.id
            const isPendente = solicitacao.status === "pendente"

            return (
              <TableRow key={solicitacao.id}>
                <TableCell>{solicitacao.credencial?.nome ?? solicitacao.nome}</TableCell>
                <TableCell>{solicitacao.solicitante?.name ?? "Nao informado"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{getStatusLabel(solicitacao.status)}</Badge>
                </TableCell>
                <TableCell>
                  {isPendente ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => analisarSolicitacao(solicitacao.id, true)}
                        disabled={isLoadingAction}
                      >
                        Aprovar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => analisarSolicitacao(solicitacao.id, false)}
                        disabled={isLoadingAction}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sem acoes</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
