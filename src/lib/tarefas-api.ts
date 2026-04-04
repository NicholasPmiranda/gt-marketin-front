import api from "@/lib/axios"
import type {
  AtualizarTarefaPayload,
  CriarComentarioPayload,
  CriarTarefaPayload,
  ListarTarefasParams,
  TarefaComentario,
  TarefaDetalhe,
  TarefaEtiqueta,
  TarefaItem,
  TarefaProjeto,
  TarefaPrioridade,
  TarefasKanban,
  TarefasPaginadas,
  TarefaStatus,
  TarefaUsuario,
} from "@/types/tarefas"

const endpointMap = {
  tarefas: "/api/tarefa",
  tarefasKanban: "/api/tarefa/kanban",
  comentarios: "/api/tarefa-comentario",
} as const

const statusOrdenado: TarefaStatus[] = ["pendente", "em andamento", "revisao", "finalizado"]

function normalizarStatus(status: unknown): TarefaStatus {
  if (
    status === "pendente" ||
    status === "em andamento" ||
    status === "revisao" ||
    status === "finalizado"
  ) {
    return status
  }

  return "pendente"
}

function normalizarPrioridade(prioridade: unknown): TarefaPrioridade {
  if (prioridade === "baixo" || prioridade === "medio" || prioridade === "alto") {
    return prioridade
  }

  return "baixo"
}

function normalizarUsuario(payload: unknown): TarefaUsuario {
  const item = (payload ?? {}) as {
    id?: number
    name?: string
  }

  return {
    id: item.id ?? 0,
    name: item.name ?? "",
  }
}

function normalizarProjeto(payload: unknown): TarefaProjeto | null {
  if (typeof payload !== "object" || payload === null) {
    return null
  }

  const item = payload as {
    id?: number
    nome?: string
  }

  return {
    id: item.id ?? 0,
    nome: item.nome ?? "",
  }
}

function normalizarEtiqueta(payload: unknown): TarefaEtiqueta {
  const item = (payload ?? {}) as {
    id?: number
    nome?: string
  }

  return {
    id: item.id ?? 0,
    nome: item.nome ?? "",
  }
}

function normalizarComentario(payload: unknown): TarefaComentario {
  const item = (payload ?? {}) as {
    id?: number
    comentario?: string
    user?: unknown
  }

  return {
    id: item.id ?? 0,
    comentario: item.comentario ?? "",
    user: item.user ? normalizarUsuario(item.user) : null,
  }
}

function normalizarTarefa(payload: unknown): TarefaItem {
  const item = (payload ?? {}) as {
    id?: number
    ordem_kanban?: number | null
    projeto_id?: number
    tarefa_pai_id?: number | null
    nome?: string
    descricao?: string | null
    status?: string
    prioridade?: string
    agendamento?: string | null
    inicio?: string | null
    fim?: string | null
    agendamento_inicio?: string | null
    agendamento_fim?: string | null
    projeto?: unknown
    responsaveis?: unknown[]
    etiquetas?: unknown[]
  }

  return {
    id: item.id ?? 0,
    ordemKanban: typeof item.ordem_kanban === "number" ? item.ordem_kanban : null,
    projetoId: item.projeto_id ?? 0,
    tarefaPaiId: item.tarefa_pai_id ?? null,
    nome: item.nome ?? "",
    descricao: item.descricao ?? null,
    status: normalizarStatus(item.status),
    prioridade: normalizarPrioridade(item.prioridade),
    agendamento: item.agendamento ?? item.agendamento_inicio ?? null,
    inicio: item.inicio ?? null,
    fim: item.fim ?? item.agendamento_fim ?? null,
    agendamentoInicio: item.agendamento_inicio ?? item.agendamento ?? null,
    agendamentoFim: item.agendamento_fim ?? item.fim ?? null,
    projeto: normalizarProjeto(item.projeto),
    responsaveis: Array.isArray(item.responsaveis)
      ? item.responsaveis.map((responsavel) => normalizarUsuario(responsavel))
      : [],
    etiquetas: Array.isArray(item.etiquetas)
      ? item.etiquetas.map((etiqueta) => normalizarEtiqueta(etiqueta))
      : [],
  }
}

function normalizarKanban(payload: unknown): TarefasKanban {
  const quadro: TarefasKanban = {
    pendente: [],
    "em andamento": [],
    revisao: [],
    finalizado: [],
  }

  if (typeof payload !== "object" || payload === null) {
    return quadro
  }

  const data = payload as Record<string, unknown>

  statusOrdenado.forEach((status) => {
    const tarefas = data[status]

    if (Array.isArray(tarefas)) {
      quadro[status] = tarefas
        .map((item) => normalizarTarefa(item))
        .sort((a, b) => {
          if (a.ordemKanban === null && b.ordemKanban === null) {
            return 0
          }

          if (a.ordemKanban === null) {
            return 1
          }

          if (b.ordemKanban === null) {
            return -1
          }

          return a.ordemKanban - b.ordemKanban
        })
    }
  })

  return quadro
}

export async function listarTarefas(params: ListarTarefasParams): Promise<TarefasPaginadas> {
  const response = await api.get(endpointMap.tarefas, {
    params: {
      page: params.page,
      projeto_id: params.projetoId,
      search: params.search || undefined,
      status: params.status || undefined,
      prioridade: params.prioridade || undefined,
      responsavel_id: params.responsavelId,
      agendamento: params.agendamento || undefined,
      inicio: params.inicio || undefined,
      fim: params.fim || undefined,
    },
  })

  const payload = (response.data ?? {}) as {
    data?: unknown[]
    current_page?: number
    last_page?: number
    total?: number
  }

  return {
    data: Array.isArray(payload.data) ? payload.data.map((item) => normalizarTarefa(item)) : [],
    currentPage: payload.current_page ?? 1,
    lastPage: payload.last_page ?? 1,
    total: payload.total ?? 0,
  }
}

export async function listarTarefasKanban({
  projetoId,
  search,
  status,
  prioridade,
  responsavelId,
  agendamento,
  inicio,
  fim,
}: {
  projetoId?: number
  search?: string
  status?: TarefaStatus
  prioridade?: "baixa" | "media" | "alta"
  responsavelId?: number
  agendamento?: string
  inicio?: string
  fim?: string
}) {
  const response = await api.get(endpointMap.tarefasKanban, {
    params: {
      projeto_id: projetoId,
      search: search || undefined,
      status: status || undefined,
      prioridade: prioridade || undefined,
      responsavel_id: responsavelId,
      agendamento: agendamento || undefined,
      inicio: inicio || undefined,
      fim: fim || undefined,
    },
  })

  return normalizarKanban(response.data)
}

export async function detalharTarefa(tarefaId: number): Promise<TarefaDetalhe> {
  const response = await api.get(`${endpointMap.tarefas}/${tarefaId}`)

  const payload = (response.data ?? {}) as {
    subtarefas?: unknown[]
    comentarios?: unknown[]
  }

  const tarefa = normalizarTarefa(response.data)

  return {
    ...tarefa,
    subtarefas: Array.isArray(payload.subtarefas)
      ? payload.subtarefas.map((item) => normalizarTarefa(item))
      : [],
    comentarios: Array.isArray(payload.comentarios)
      ? payload.comentarios.map((item) => normalizarComentario(item))
      : [],
  }
}

export async function criarTarefa(payload: CriarTarefaPayload) {
  const response = await api.post(endpointMap.tarefas, payload)
  return normalizarTarefa(response.data)
}

export async function atualizarTarefa(tarefaId: number, payload: AtualizarTarefaPayload) {
  const response = await api.post(`${endpointMap.tarefas}/update-${tarefaId}`, payload)
  return normalizarTarefa(response.data)
}

export async function atualizarStatusTarefa({
  tarefaId,
  status,
  index,
}: {
  tarefaId: number
  status: TarefaStatus
  index: number
}) {
  const response = await api.post(`${endpointMap.tarefas}/update-status-${tarefaId}`, {
    status,
    ordem_kanban: index,
  })

  return normalizarTarefa(response.data)
}

export async function criarComentarioTarefa(payload: CriarComentarioPayload) {
  const response = await api.post(endpointMap.comentarios, payload)
  return normalizarComentario(response.data)
}

export async function excluirTarefa(tarefaId: number) {
  await api.delete(`${endpointMap.tarefas}/${tarefaId}`)
}
