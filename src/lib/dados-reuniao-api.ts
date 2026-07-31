import api from "@/lib/axios"
import type {
  CriarTarefaDadosReuniaoPayload,
  DadosReuniaoDetalhe,
  DadosReuniaoItem,
  DadosReuniaoPaginados,
  ProjetoAtivoReuniao,
  TarefaDadosReuniao,
} from "@/types/dados-reuniao"

const endpoint = "/api/dados-reuniao"

function normalizarItem(payload: unknown): DadosReuniaoItem {
  const item = (payload ?? {}) as {
    id?: number
    data?: string
    created_at?: string | null
    updated_at?: string | null
  }

  return {
    id: item.id ?? 0,
    data: item.data ?? "",
    createdAt: item.created_at ?? null,
    updatedAt: item.updated_at ?? null,
  }
}

function normalizarDetalhe(payload: unknown): DadosReuniaoDetalhe {
  const item = (payload ?? {}) as {
    conteudo?: string
  }

  return {
    ...normalizarItem(payload),
    conteudo: item.conteudo ?? "",
  }
}

function normalizarPaginacao(payload: unknown): DadosReuniaoPaginados {
  const data = (payload ?? {}) as {
    data?: unknown[]
    current_page?: number
    last_page?: number
    total?: number
  }

  return {
    data: Array.isArray(data.data) ? data.data.map((item) => normalizarItem(item)) : [],
    currentPage: data.current_page ?? 1,
    lastPage: data.last_page ?? 1,
    total: data.total ?? 0,
  }
}

function normalizarTarefa(payload: unknown): TarefaDadosReuniao {
  const item = (payload ?? {}) as {
    id?: number
    nome?: string
    status?: TarefaDadosReuniao["status"]
    projeto_id?: number | null
    projeto?: {
      id?: number
      nome?: string
    } | null
  }

  return {
    id: item.id ?? 0,
    nome: item.nome ?? "",
    status: item.status ?? "pendente",
    projetoId: item.projeto_id ?? item.projeto?.id ?? null,
    projetoNome: item.projeto?.nome ?? null,
  }
}

export async function listarDadosReuniao({
  page,
  perPage,
}: {
  page: number
  perPage?: number
}) {
  const response = await api.get(endpoint, {
    params: {
      page,
      per_page: perPage,
    },
  })

  return normalizarPaginacao(response.data)
}

export async function criarDadosReuniao() {
  const response = await api.post(endpoint)
  return normalizarDetalhe(response.data)
}

let projetosAtivosInflight: Promise<ProjetoAtivoReuniao[]> | null = null

export async function listarProjetosAtivosReuniao() {
  if (projetosAtivosInflight) {
    return projetosAtivosInflight
  }

  projetosAtivosInflight = (async () => {
    const response = await api.get(`${endpoint}/projetos-ativos`)
    const payload = response.data

    if (!Array.isArray(payload)) {
      return [] as ProjetoAtivoReuniao[]
    }

    return payload.map((item) => {
      const projeto = (item ?? {}) as { id?: number; nome?: string }
      return {
        id: projeto.id ?? 0,
        nome: projeto.nome ?? "",
      }
    })
  })().finally(() => {
    projetosAtivosInflight = null
  })

  return projetosAtivosInflight
}

export async function detalharDadosReuniao(dadosReuniaoId: number) {
  const response = await api.get(`${endpoint}/${dadosReuniaoId}`)
  return normalizarDetalhe(response.data)
}

export async function atualizarConteudoDadosReuniao(
  dadosReuniaoId: number,
  conteudo: string
) {
  const response = await api.post(`${endpoint}/update-${dadosReuniaoId}`, {
    conteudo,
  })
  return normalizarDetalhe(response.data)
}

export async function listarTarefasDadosReuniao(
  dadosReuniaoId: number,
  projetoId: number
) {
  const response = await api.get(`${endpoint}/${dadosReuniaoId}/tarefas`, {
    params: { projeto_id: projetoId },
  })
  const payload = response.data

  const itens = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown[] })?.data)
      ? ((payload as { data: unknown[] }).data)
      : []

  return itens.map((item) => {
    const tarefa = normalizarTarefa(item)
    return {
      ...tarefa,
      projetoId: tarefa.projetoId ?? projetoId,
    }
  })
}

export async function criarTarefaDadosReuniao(
  dadosReuniaoId: number,
  payload: CriarTarefaDadosReuniaoPayload
) {
  const response = await api.post(`${endpoint}/${dadosReuniaoId}/tarefas`, payload)
  return normalizarTarefa(response.data)
}

export async function atualizarTituloTarefaDadosReuniao(
  dadosReuniaoId: number,
  tarefaId: number,
  nome: string
) {
  const response = await api.post(
    `${endpoint}/${dadosReuniaoId}/tarefas/update-${tarefaId}`,
    { nome }
  )
  return normalizarTarefa(response.data)
}

export async function concluirTarefaDadosReuniao(
  dadosReuniaoId: number,
  tarefaId: number
) {
  const response = await api.post(
    `${endpoint}/${dadosReuniaoId}/tarefas/completar-${tarefaId}`
  )
  return normalizarTarefa(response.data)
}
