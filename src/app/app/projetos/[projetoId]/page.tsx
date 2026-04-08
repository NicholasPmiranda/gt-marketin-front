"use client"

import { use, useEffect, useState } from "react"
import { toast } from "sonner"

import { detalharProjeto, listarTarefasProjeto } from "@/lib/projetos-api"
import { usePermissaoPerfil } from "@/hooks/use-permissao-perfil"
import type { ProjetoItem, ProjetoTarefaItem } from "@/types/projetos"
import { EditarProjetoModal } from "./components/editar-projeto-modal"
import { ProjetoDetalheSkeleton } from "./components/projeto-detalhe-skeleton"
import { TarefasProjetoTable } from "./components/tarefas-projeto-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

export default function Page({
  params,
}: {
  params: Promise<{ projetoId: string }>
}) {
  const { projetoId } = use(params)
  const projetoIdNumber = Number(projetoId)

  const [isLoading, setIsLoading] = useState(true)
  const [projeto, setProjeto] = useState<ProjetoItem | null>(null)
  const [tarefas, setTarefas] = useState<ProjetoTarefaItem[]>([])
  const { podeGerenciarProjeto } = usePermissaoPerfil()

  async function carregarDados() {
    try {
      setIsLoading(true)
      const [projetoResponse, tarefasResponse] = await Promise.all([
        detalharProjeto(projetoIdNumber),
        listarTarefasProjeto(projetoIdNumber),
      ])

      setProjeto(projetoResponse)
      setTarefas(tarefasResponse)
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel carregar os dados do projeto."))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void carregarDados()
  }, [projetoIdNumber])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        <ProjetoDetalheSkeleton />
      </div>
    )
  }

  if (!projeto) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          Projeto nao encontrado.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{projeto.nome}</h1>
          <Badge
            className={
              projeto.ativo
                ? "border-green-200 bg-green-100 text-green-800"
                : "border-black bg-black text-white"
            }
          >
            {projeto.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        {podeGerenciarProjeto ? <EditarProjetoModal projeto={projeto} onUpdated={carregarDados} /> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descricao do projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{projeto.descricao || "Sem descricao"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tarefas associadas</CardTitle>
            </CardHeader>
            <CardContent>
              <TarefasProjetoTable tarefas={tarefas} />
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {projeto.equipe.length > 0 ? (
                projeto.equipe.map((membro) => (
                  <div key={membro.id} className="flex items-center gap-3 rounded-md border p-3">
                    <div className="flex size-9 items-center justify-center rounded-full border text-sm font-medium">
                      {membro.name
                        .split(" ")
                        .slice(0, 2)
                        .map((item) => item.charAt(0).toUpperCase())
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{membro.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {membro.setorNome || "Sem setor"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <Badge variant="secondary">Sem equipe vinculada</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
