import api from "@/lib/axios"
import type {
  AnalisarCredencialSolicitacaoPayload,
  AtualizarCredencialResult,
  CreateCredencialPayload,
  CredencialItem,
  CredencialSolicitacaoItem,
  UpdateCredencialPayload,
} from "@/types/credenciais"

const endpointMap = {
  credenciais: "/api/config/credencial",
  solicitacoes: "/api/config/credencial-solicitacao",
} as const

function normalizarLista<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[]
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    Array.isArray(payload.data)
  ) {
    return payload.data as T[]
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "items" in payload &&
    Array.isArray(payload.items)
  ) {
    return payload.items as T[]
  }

  return []
}

function normalizarCredencial(payload: unknown): CredencialItem {
  const item = (payload ?? {}) as {
    id?: number
    nome?: string
    url?: string
    acesso?: string
    senha?: string
    criador_id?: number | null
    criador?: { id?: number; name?: string } | null
    liberados?: Array<{ id?: number; name?: string }>
    created_at?: string | null
    updated_at?: string | null
  }

  return {
    id: item.id ?? 0,
    nome: item.nome ?? "",
    url: item.url ?? "",
    acesso: item.acesso ?? "",
    senha: item.senha ?? "",
    criadorId: item.criador_id ?? null,
    criador: item.criador
      ? {
          id: item.criador.id ?? 0,
          name: item.criador.name ?? "",
        }
      : null,
    liberados: Array.isArray(item.liberados)
      ? item.liberados.map((liberado) => ({
          id: liberado.id ?? 0,
          name: liberado.name ?? "",
        }))
      : [],
    createdAt: item.created_at ?? null,
    updatedAt: item.updated_at ?? null,
  }
}

function normalizarSolicitacao(payload: unknown): CredencialSolicitacaoItem {
  const item = (payload ?? {}) as {
    id?: number
    credencial_id?: number
    solicitante_id?: number
    nome?: string
    url?: string
    acesso?: string
    senha?: string
    liberado_ids?: number[]
    status?: "pendente" | "aprovado" | "rejeitado"
    analisado_por?: number | null
    analisado_em?: string | null
    credencial?: { id?: number; nome?: string } | null
    solicitante?: { id?: number; name?: string } | null
    created_at?: string | null
    updated_at?: string | null
  }

  return {
    id: item.id ?? 0,
    credencialId: item.credencial_id ?? 0,
    solicitanteId: item.solicitante_id ?? 0,
    nome: item.nome ?? "",
    url: item.url ?? "",
    acesso: item.acesso ?? "",
    senha: item.senha ?? "",
    liberadoIds: Array.isArray(item.liberado_ids) ? item.liberado_ids : [],
    status: item.status ?? "pendente",
    analisadoPor: item.analisado_por ?? null,
    analisadoEm: item.analisado_em ?? null,
    credencial: item.credencial
      ? {
          id: item.credencial.id ?? 0,
          nome: item.credencial.nome ?? "",
        }
      : null,
    solicitante: item.solicitante
      ? {
          id: item.solicitante.id ?? 0,
          name: item.solicitante.name ?? "",
        }
      : null,
    createdAt: item.created_at ?? null,
    updatedAt: item.updated_at ?? null,
  }
}

function isSolicitacaoResponse(payload: unknown) {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "credencial_id" in payload &&
    "solicitante_id" in payload
  )
}

export async function listarCredenciaisConfig() {
  const response = await api.get(endpointMap.credenciais)
  const lista = normalizarLista<unknown>(response.data)
  return lista.map((item) => normalizarCredencial(item))
}

export async function criarCredencialConfig(payload: CreateCredencialPayload) {
  const response = await api.post(endpointMap.credenciais, payload)
  return normalizarCredencial(response.data)
}

export async function detalharCredencialConfig(credencialId: number) {
  const response = await api.get(`${endpointMap.credenciais}/${credencialId}`)
  return normalizarCredencial(response.data)
}

export async function atualizarCredencialConfig(
  credencialId: number,
  payload: UpdateCredencialPayload
): Promise<AtualizarCredencialResult> {
  const response = await api.post(`${endpointMap.credenciais}/update-${credencialId}`, payload)

  if (response.status === 201 || isSolicitacaoResponse(response.data)) {
    return {
      tipo: "solicitacao",
      data: normalizarSolicitacao(response.data),
    }
  }

  return {
    tipo: "credencial",
    data: normalizarCredencial(response.data),
  }
}

export async function excluirCredencialConfig(credencialId: number) {
  await api.delete(`${endpointMap.credenciais}/${credencialId}`)
}

export async function listarCredencialSolicitacoesConfig() {
  const response = await api.get(endpointMap.solicitacoes)
  const lista = normalizarLista<unknown>(response.data)
  return lista.map((item) => normalizarSolicitacao(item))
}

export async function analisarCredencialSolicitacaoConfig(
  credencialSolicitacaoId: number,
  payload: AnalisarCredencialSolicitacaoPayload
) {
  const response = await api.post(
    `${endpointMap.solicitacoes}/update-${credencialSolicitacaoId}`,
    payload
  )
  return normalizarSolicitacao(response.data)
}
