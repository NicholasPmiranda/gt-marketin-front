"use client"

import { useEffect, useState } from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import {
  criarCredencialConfig,
  listarCredenciaisConfig,
  listarCredencialSolicitacoesConfig,
} from "@/lib/credenciais-api"
import { listarUsersTodosConfig } from "@/lib/configuracoes-api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CredenciaisPageSkeleton } from "./components/credenciais-page-skeleton"
import { CredenciaisSolicitacoesTable } from "./components/credenciais-solicitacoes-table"
import { CredenciaisTable } from "./components/credenciais-table"
import { CriarCredencialModal } from "./components/criar-credencial-modal"
import { EditarCredencialModal } from "./components/editar-credencial-modal"
import type { CredencialItem, CredencialSolicitacaoItem } from "@/types/credenciais"
import type { UserConfigItem } from "@/types/configuracoes"

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

function isForbiddenError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response &&
    error.response.status === 403
  )
}

export default function Page() {
  const [isLoading, setIsLoading] = useState(true)
  const [credenciais, setCredenciais] = useState<CredencialItem[]>([])
  const [users, setUsers] = useState<UserConfigItem[]>([])
  const [solicitacoes, setSolicitacoes] = useState<CredencialSolicitacaoItem[]>([])
  const [canViewSolicitacoes, setCanViewSolicitacoes] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [credencialSelecionadaId, setCredencialSelecionadaId] = useState<number | null>(null)

  async function carregarTabelaCredenciais() {
    const [listaCredenciais, listaUsers] = await Promise.all([
      listarCredenciaisConfig(),
      listarUsersTodosConfig(),
    ])

    setCredenciais(listaCredenciais)
    setUsers(listaUsers)
  }

  async function carregarSolicitacoes() {
    try {
      const listaSolicitacoes = await listarCredencialSolicitacoesConfig()
      setCanViewSolicitacoes(true)
      setSolicitacoes(listaSolicitacoes)
    } catch (error: unknown) {
      if (isForbiddenError(error)) {
        setCanViewSolicitacoes(false)
        setSolicitacoes([])
        return
      }

      throw error
    }
  }

  async function carregarDados() {
    setIsLoading(true)

    try {
      await Promise.all([carregarTabelaCredenciais(), carregarSolicitacoes()])
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel carregar as credenciais."))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void carregarDados()
  }, [])

  async function handleCreateCredencial(payload: {
    nome: string
    url: string
    acesso: string
    senha: string
    liberado_ids?: number[]
  }) {
    try {
      const novaCredencial = await criarCredencialConfig(payload)
      setCredenciais((oldState) => [novaCredencial, ...oldState])
      toast.success("Credencial cadastrada com sucesso.")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel criar a credencial."))
      throw error
    }
  }

  async function handleCopySenha(senha: string) {
    try {
      await navigator.clipboard.writeText(senha)
      toast.success("Senha copiada para a area de transferencia.")
    } catch {
      toast.error("Nao foi possivel copiar a senha.")
    }
  }

  function handleOpenEditModal(credencial: CredencialItem) {
    setCredencialSelecionadaId(credencial.id)
    setIsEditModalOpen(true)
  }

  function handleEditModalChange(open: boolean) {
    setIsEditModalOpen(open)

    if (!open) {
      setCredencialSelecionadaId(null)
    }
  }

  async function handleDataChanged() {
    try {
      await Promise.all([carregarTabelaCredenciais(), carregarSolicitacoes()])
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel atualizar os dados."))
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      {isLoading ? (
        <CredenciaisPageSkeleton />
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Credenciais</CardTitle>
                <CardDescription>
                  Gerencie os acessos e compartilhe credenciais com sua equipe.
                </CardDescription>
              </div>
              <Button type="button" onClick={() => setIsCreateModalOpen(true)}>
                <PlusIcon />
                Adicionar credencial
              </Button>
            </CardHeader>
            <CardContent>
              <CredenciaisTable
                credenciais={credenciais}
                onRowClick={handleOpenEditModal}
                onCopySenha={handleCopySenha}
              />
            </CardContent>
          </Card>

          {canViewSolicitacoes ? (
            <Card>
              <CardHeader>
                <CardTitle>Solicitacoes de edicao</CardTitle>
                <CardDescription>
                  Analise pedidos de alteracao enviados por usuarios sem permissao administrativa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CredenciaisSolicitacoesTable
                  solicitacoes={solicitacoes}
                  onChanged={handleDataChanged}
                />
              </CardContent>
            </Card>
          ) : null}
        </>
      )}

      <CriarCredencialModal
        open={isCreateModalOpen}
        users={users}
        onOpenChange={setIsCreateModalOpen}
        onCreate={handleCreateCredencial}
      />

      <EditarCredencialModal
        open={isEditModalOpen}
        credencialId={credencialSelecionadaId}
        users={users}
        onOpenChange={handleEditModalChange}
        onChanged={handleDataChanged}
      />
    </div>
  )
}
