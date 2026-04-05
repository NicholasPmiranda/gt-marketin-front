import api from "@/lib/axios"
import type {
  ConverterTarefasAiPayload,
  ReuniaoDetalhe,
  ReuniaoItem,
  ReunioesPaginadas,
  TarefaAiItem,
} from "@/types/reunioes"

const endpointMap = {
  reunioes: "/api/reuniao",
  tarefasAi: "/api/tarefa-ai",
} as const

function normalizarReuniao(payload: unknown): ReuniaoItem {
  const item = (payload ?? {}) as {
    id?: number
    zerogap_id?: string
    titulo?: string
    titulo_reuniao?: string
    url?: string
    url_compartilhamento?: string
    criado_em_origem?: string | null
    inicio_agendado_em?: string | null
    fim_agendado_em?: string | null
    inicio_gravacao_em?: string | null
    fim_gravacao_em?: string | null
    tipo_dominio_convidados_calendario?: string | null
    created_at?: string | null
    updated_at?: string | null
  }

  return {
    id: item.id ?? 0,
    zerogapId: item.zerogap_id ?? "",
    titulo: item.titulo ?? "",
    tituloReuniao: item.titulo_reuniao ?? "",
    url: item.url ?? "",
    urlCompartilhamento: item.url_compartilhamento ?? "",
    criadoEmOrigem: item.criado_em_origem ?? null,
    inicioAgendadoEm: item.inicio_agendado_em ?? null,
    fimAgendadoEm: item.fim_agendado_em ?? null,
    inicioGravacaoEm: item.inicio_gravacao_em ?? null,
    fimGravacaoEm: item.fim_gravacao_em ?? null,
    tipoDominioConvidadosCalendario: item.tipo_dominio_convidados_calendario ?? null,
    createdAt: item.created_at ?? null,
    updatedAt: item.updated_at ?? null,
  }
}

function normalizarPaginacao(payload: unknown): ReunioesPaginadas {
  const data = (payload ?? {}) as {
    data?: unknown[]
    current_page?: number
    last_page?: number
    total?: number
  }

  return {
    data: Array.isArray(data.data) ? data.data.map((item) => normalizarReuniao(item)) : [],
    currentPage: data.current_page ?? 1,
    lastPage: data.last_page ?? 1,
    total: data.total ?? 0,
  }
}

function normalizarArray(value: unknown) {
  return Array.isArray(value) ? value : []
}

function normalizarTextoOuArray(value: unknown): string | unknown[] {
  if (typeof value === "string") {
    return value
  }

  if (Array.isArray(value)) {
    return value
  }

  return ""
}

function normalizarObjeto(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function normalizarTarefaAi(payload: unknown): TarefaAiItem {
  const item = (payload ?? {}) as {
    id?: number
    reuniao_id?: number
    tarefa_modelo_id?: number | null
    tarefa_modelo?: {
      id?: number
      nome?: string
    } | null
    motivo?: string
    created_at?: string | null
    updated_at?: string | null
  }

  return {
    id: item.id ?? 0,
    reuniaoId: item.reuniao_id ?? 0,
    tarefaModeloId: item.tarefa_modelo_id ?? null,
    tarefaModeloNome: item.tarefa_modelo?.nome ?? "Sem modelo",
    motivo: item.motivo ?? "",
    createdAt: item.created_at ?? null,
    updatedAt: item.updated_at ?? null,
  }
}

export async function listarReunioes({
  page,
  search,
  perPage,
}: {
  page: number
  search?: string
  perPage?: number
}) {
  const response = await api.get(endpointMap.reunioes, {
    params: {
      page,
      search: search || undefined,
      per_page: perPage,
    },
  })

  return normalizarPaginacao(response.data)
}

export async function detalharReuniao(reuniaoId: number): Promise<ReuniaoDetalhe> {
  const response = await api.get(`${endpointMap.reunioes}/${reuniaoId}`)
  const payload = response.data as {
    transcricao?: unknown
    resumo_padrao?: unknown
    itens_acao?: unknown[]
    convidados_calendario?: unknown[]
    gravado_por?: unknown
  }

  return {
    ...normalizarReuniao(response.data),
    transcricao: normalizarTextoOuArray(payload.transcricao),
    resumoPadrao: normalizarTextoOuArray(payload.resumo_padrao),
    itensAcao: normalizarArray(payload.itens_acao),
    convidadosCalendario: normalizarArray(payload.convidados_calendario),
    gravadoPor: normalizarObjeto(payload.gravado_por),
  }
}

export async function gerarTarefasAiReuniao(reuniaoId: number): Promise<TarefaAiItem[]> {
  const response = await api.post(`${endpointMap.reunioes}/gerar-tarefas-ai-${reuniaoId}`)
  const payload = response.data

  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map((item) => normalizarTarefaAi(item))
}

export async function converterTarefasAiPorIds(payload: ConverterTarefasAiPayload) {
  const response = await api.post(`${endpointMap.tarefasAi}/converter-por-ids`, payload)
  return response.data
}
