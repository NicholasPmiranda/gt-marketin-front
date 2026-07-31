"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import { toast } from "sonner"

import {
  atualizarTituloTarefaDadosReuniao,
  concluirTarefaDadosReuniao,
  criarTarefaDadosReuniao,
  listarProjetosAtivosReuniao,
  listarTarefasDadosReuniao,
} from "@/lib/dados-reuniao-api"
import { atualizarStatusTarefa } from "@/lib/tarefas-api"
import type { ProjetoAtivoReuniao, TarefaDadosReuniao } from "@/types/dados-reuniao"
import { usePermissaoPerfil } from "@/hooks/use-permissao-perfil"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

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

type AtaTarefasPainelProps = {
  ataId: number
}

export function AtaTarefasPainel({ ataId }: AtaTarefasPainelProps) {
  const { podeAcessarProjeto, podeAcessarTarefa, podeCriarTarefa, podeGerenciarTarefa } =
    usePermissaoPerfil()

  const [isLoadingProjetos, setIsLoadingProjetos] = useState(true)
  const [projetos, setProjetos] = useState<ProjetoAtivoReuniao[]>([])
  const [tarefasPorProjeto, setTarefasPorProjeto] = useState<
    Record<number, TarefaDadosReuniao[]>
  >({})
  const [loadingTarefasPorProjeto, setLoadingTarefasPorProjeto] = useState<
    Record<number, boolean>
  >({})
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [novaTarefaPorProjeto, setNovaTarefaPorProjeto] = useState<Record<number, string>>({})
  const [creatingProjetoId, setCreatingProjetoId] = useState<number | null>(null)
  const novaTarefaRefs = useRef<Record<number, HTMLInputElement | null>>({})
  const carregandoTarefasRef = useRef<Record<number, boolean>>({})
  const projetosRequestIdRef = useRef(0)

  async function carregarProjetos() {
    const requestId = ++projetosRequestIdRef.current

    if (!podeAcessarProjeto) {
      setProjetos([])
      setIsLoadingProjetos(false)
      return
    }

    try {
      setIsLoadingProjetos(true)
      const projetosResponse = await listarProjetosAtivosReuniao()
      if (requestId !== projetosRequestIdRef.current) {
        return
      }
      setProjetos(projetosResponse)
    } catch (error) {
      if (requestId !== projetosRequestIdRef.current) {
        return
      }
      toast.error(getErrorMessage(error, "Nao foi possivel carregar os projetos."))
    } finally {
      if (requestId === projetosRequestIdRef.current) {
        setIsLoadingProjetos(false)
      }
    }
  }

  async function carregarTarefasDoProjeto(projetoId: number) {
    if (!podeAcessarTarefa || carregandoTarefasRef.current[projetoId]) {
      return
    }

    try {
      carregandoTarefasRef.current[projetoId] = true
      setLoadingTarefasPorProjeto((atual) => ({ ...atual, [projetoId]: true }))

      const response = await listarTarefasDadosReuniao(ataId, projetoId)
      setTarefasPorProjeto((atual) => ({ ...atual, [projetoId]: response }))
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel carregar as tarefas."))
    } finally {
      carregandoTarefasRef.current[projetoId] = false
      setLoadingTarefasPorProjeto((atual) => ({ ...atual, [projetoId]: false }))
    }
  }

  useEffect(() => {
    carregandoTarefasRef.current = {}
    setTarefasPorProjeto({})
    setLoadingTarefasPorProjeto({})
    setExpanded({})
    void carregarProjetos()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recarrega ao trocar a ata/permissao
  }, [ataId, podeAcessarProjeto])

  function focarNovaTarefa(projetoId: number) {
    requestAnimationFrame(() => {
      novaTarefaRefs.current[projetoId]?.focus()
    })
  }

  function toggleProjeto(projetoId: number) {
    const vaiAbrir = !expanded[projetoId]

    setExpanded((atual) => ({
      ...atual,
      [projetoId]: vaiAbrir,
    }))

    if (vaiAbrir) {
      void carregarTarefasDoProjeto(projetoId)
    }
  }

  async function handleCriarTarefa(projetoId: number) {
    const nome = (novaTarefaPorProjeto[projetoId] ?? "").trim()
    if (!nome || creatingProjetoId !== null || !podeCriarTarefa) {
      return
    }

    try {
      setCreatingProjetoId(projetoId)
      setNovaTarefaPorProjeto((atual) => ({ ...atual, [projetoId]: "" }))
      const criada = await criarTarefaDadosReuniao(ataId, {
        projeto_id: projetoId,
        nome,
      })
      const projeto = projetos.find((item) => item.id === projetoId)

      setTarefasPorProjeto((atual) => ({
        ...atual,
        [projetoId]: [
          ...(atual[projetoId] ?? []),
          {
            ...criada,
            projetoId: criada.projetoId ?? projetoId,
            projetoNome: criada.projetoNome ?? projeto?.nome ?? null,
          },
        ],
      }))
    } catch (error) {
      setNovaTarefaPorProjeto((atual) => ({ ...atual, [projetoId]: nome }))
      toast.error(getErrorMessage(error, "Nao foi possivel criar a tarefa."))
    } finally {
      setCreatingProjetoId(null)
      focarNovaTarefa(projetoId)
    }
  }

  async function handleToggleConclusao(
    projetoId: number,
    tarefa: TarefaDadosReuniao,
    checked: boolean
  ) {
    if (!podeGerenciarTarefa) {
      return
    }

    const concluida = tarefa.status === "finalizado"
    if (checked === concluida) {
      return
    }

    try {
      if (checked) {
        const atualizada = await concluirTarefaDadosReuniao(ataId, tarefa.id)
        setTarefasPorProjeto((atual) => ({
          ...atual,
          [projetoId]: (atual[projetoId] ?? []).map((item) =>
            item.id === tarefa.id
              ? {
                  ...item,
                  ...atualizada,
                  status: "finalizado",
                  projetoId: atualizada.projetoId ?? item.projetoId,
                  projetoNome: atualizada.projetoNome ?? item.projetoNome,
                }
              : item
          ),
        }))
        return
      }

      await atualizarStatusTarefa({
        tarefaId: tarefa.id,
        status: "pendente",
        index: 0,
        listaItens: [{ id: tarefa.id, ordem_kanban: 0 }],
      })

      setTarefasPorProjeto((atual) => ({
        ...atual,
        [projetoId]: (atual[projetoId] ?? []).map((item) =>
          item.id === tarefa.id
            ? {
                ...item,
                status: "pendente",
              }
            : item
        ),
      }))
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          checked
            ? "Nao foi possivel concluir a tarefa."
            : "Nao foi possivel reabrir a tarefa."
        )
      )
    }
  }

  async function handleRenomear(
    projetoId: number,
    tarefa: TarefaDadosReuniao,
    nome: string
  ) {
    const nextNome = nome.trim()
    if (!podeGerenciarTarefa || !nextNome || nextNome === tarefa.nome) {
      return
    }

    try {
      const atualizada = await atualizarTituloTarefaDadosReuniao(ataId, tarefa.id, nextNome)
      setTarefasPorProjeto((atual) => ({
        ...atual,
        [projetoId]: (atual[projetoId] ?? []).map((item) =>
          item.id === tarefa.id
            ? {
                ...item,
                ...atualizada,
                projetoId: atualizada.projetoId ?? item.projetoId,
                projetoNome: atualizada.projetoNome ?? item.projetoNome,
              }
            : item
        ),
      }))
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel atualizar a tarefa."))
    }
  }

  if (isLoadingProjetos) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-semibold">Projetos</h3>

      {projetos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum projeto ativo.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {projetos.map((projeto, index) => {
            const aberto = Boolean(expanded[projeto.id])
            const carregandoTarefas = Boolean(loadingTarefasPorProjeto[projeto.id])
            const tarefas = tarefasPorProjeto[projeto.id] ?? []

            return (
              <div key={projeto.id} className="flex flex-col">
                <button
                  type="button"
                  className="flex w-full items-center gap-1.5 py-1 text-left text-sm font-medium"
                  onClick={() => toggleProjeto(projeto.id)}
                >
                  {aberto ? (
                    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">
                    {index + 1}) {projeto.nome}
                  </span>
                </button>

                {aberto ? (
                  <div className="ml-5 flex flex-col gap-0.5 border-l border-border/40 pl-3">
                    {carregandoTarefas ? (
                      <>
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                      </>
                    ) : (
                      tarefas.map((tarefa) => {
                        const concluida = tarefa.status === "finalizado"

                        return (
                          <div key={tarefa.id} className="flex items-center gap-2 py-1">
                            <Checkbox
                              checked={concluida}
                              disabled={!podeGerenciarTarefa}
                              onCheckedChange={(value) =>
                                void handleToggleConclusao(projeto.id, tarefa, value === true)
                              }
                            />
                            <input
                              key={`${tarefa.id}-${tarefa.nome}`}
                              defaultValue={tarefa.nome}
                              disabled={!podeGerenciarTarefa || concluida}
                              onBlur={(event) =>
                                void handleRenomear(projeto.id, tarefa, event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.currentTarget.blur()
                                }
                              }}
                              className={cn(
                                "w-full bg-transparent text-sm outline-none",
                                concluida && "text-muted-foreground line-through"
                              )}
                            />
                          </div>
                        )
                      })
                    )}

                    {podeCriarTarefa ? (
                      <input
                        ref={(node) => {
                          novaTarefaRefs.current[projeto.id] = node
                        }}
                        value={novaTarefaPorProjeto[projeto.id] ?? ""}
                        onChange={(event) =>
                          setNovaTarefaPorProjeto((atual) => ({
                            ...atual,
                            [projeto.id]: event.target.value,
                          }))
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault()
                            void handleCriarTarefa(projeto.id)
                          }
                        }}
                        placeholder="Nova tarefa..."
                        className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground/60"
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
