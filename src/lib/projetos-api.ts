import api from "@/lib/axios"
import type {
  CreateProjetoPayload,
  ProjetoEquipeItem,
  ProjetoItem,
  ProjetoTarefaItem,
  ProjetosPaginados,
  UpdateProjetoPayload,
} from "@/types/projetos"

const endpointMap = {
  projetos: "/api/projeto",
  tarefas: "/api/tarefa",
  usuarios: "/api/config/user",
} as const

function normalizarEquipe(payload: unknown): ProjetoEquipeItem[] {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map((item) => {
    const equipeItem = (item ?? {}) as {
      id?: number
      name?: string
      setor_nome?: string | null
      setor?: { nome?: string | null } | null
    }

    const setorNomeDireto =
      typeof equipeItem.setor_nome === "string" ? equipeItem.setor_nome.trim() : ""
    const setorNomeObjeto =
      typeof equipeItem.setor?.nome === "string" ? equipeItem.setor.nome.trim() : ""
    const setorNomeFinal = setorNomeDireto || setorNomeObjeto || null

    return {
      id: equipeItem.id ?? 0,
      name: equipeItem.name ?? "",
      setorNome: setorNomeFinal,
    }
  })
}

function normalizarProjeto(payload: unknown): ProjetoItem {
  const item = (payload ?? {}) as {
    id?: number
    nome?: string
    descricao?: string | null
    ativo?: boolean
    equipe?: unknown
    created_at?: string | null
    updated_at?: string | null
  }

  return {
    id: item.id ?? 0,
    nome: item.nome ?? "",
    descricao: item.descricao ?? null,
    ativo: Boolean(item.ativo),
    equipe: normalizarEquipe(item.equipe),
    createdAt: item.created_at ?? null,
    updatedAt: item.updated_at ?? null,
  }
}

function normalizarProjetosPaginados(payload: unknown): ProjetosPaginados {
  const paginado = (payload ?? {}) as {
    data?: unknown[]
    current_page?: number
    last_page?: number
    total?: number
  }

  return {
    data: Array.isArray(paginado.data)
      ? paginado.data.map((item) => normalizarProjeto(item))
      : [],
    currentPage: paginado.current_page ?? 1,
    lastPage: paginado.last_page ?? 1,
    total: paginado.total ?? 0,
  }
}

function normalizarTarefa(payload: unknown): ProjetoTarefaItem {
  const item = (payload ?? {}) as {
    id?: number
    projeto_id?: number
    nome?: string
    descricao?: string | null
    status?: string
    responsaveis?: unknown[]
    etiquetas?: unknown[]
  }

  return {
    id: item.id ?? 0,
    projetoId: item.projeto_id ?? 0,
    nome: item.nome ?? "",
    descricao: item.descricao ?? null,
    status: item.status ?? "",
    responsaveis: Array.isArray(item.responsaveis)
      ? item.responsaveis.map((responsavel) => {
          const responsavelItem = (responsavel ?? {}) as {
            id?: number
            name?: string
          }

          return {
            id: responsavelItem.id ?? 0,
            name: responsavelItem.name ?? "",
          }
        })
      : [],
    etiquetas: Array.isArray(item.etiquetas)
      ? item.etiquetas.map((etiqueta) => {
          const etiquetaItem = (etiqueta ?? {}) as {
            id?: number
            nome?: string
          }

          return {
            id: etiquetaItem.id ?? 0,
            nome: etiquetaItem.nome ?? "",
          }
        })
      : [],
  }
}

export async function listarProjetos({
  page,
  search,
}: {
  page: number
  search?: string
}) {
  const response = await api.get(endpointMap.projetos, {
    params: {
      page,
      search: search || undefined,
    },
  })

  return normalizarProjetosPaginados(response.data)
}

export async function detalharProjeto(projetoId: number) {
  const response = await api.get(`${endpointMap.projetos}/${projetoId}`)
  return normalizarProjeto(response.data)
}

export async function criarProjeto(payload: CreateProjetoPayload) {
  const response = await api.post(endpointMap.projetos, payload)
  return normalizarProjeto(response.data)
}

export async function atualizarProjeto(projetoId: number, payload: UpdateProjetoPayload) {
  const response = await api.post(`${endpointMap.projetos}/update-${projetoId}`, payload)
  return normalizarProjeto(response.data)
}

export async function listarUsuariosEquipe() {
  const response = await api.get(endpointMap.usuarios)
  const payload = response.data as { data?: unknown[] } | unknown[]

  if (Array.isArray(payload)) {
    return normalizarEquipe(payload)
  }

  if (typeof payload === "object" && payload !== null && Array.isArray(payload.data)) {
    return normalizarEquipe(payload.data)
  }

  return []
}

export async function listarTarefasProjeto(projetoId: number) {
  const response = await api.get(endpointMap.tarefas, {
    params: {
      projeto_id: projetoId,
    },
  })

  const payload = response.data as { data?: unknown[] }
  const tarefas = Array.isArray(payload.data) ? payload.data : []
  return tarefas.map((item) => normalizarTarefa(item))
}
