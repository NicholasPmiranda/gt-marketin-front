import api from "@/lib/axios"
import type {
  CreateEtiquetaPayload,
  CreateSetorPayload,
  CreateUserPayload,
  EtiquetaConfigItem,
  SetorConfigItem,
  UpdateEtiquetaPayload,
  UpdateSetorPayload,
  UpdateUserPayload,
  UserConfigItem,
} from "@/types/configuracoes"

const endpointMap = {
  users: "/api/config/user",
  setores: "/api/config/setor",
  setoresTodos: "/api/config/setor/todos",
  etiquetas: "/api/config/etiqueta",
} as const

function normalizarUser(payload: unknown): UserConfigItem {
  const item = (payload ?? {}) as {
    id?: number
    name?: string
    nome?: string
    email?: string
    telefone?: string | null
    perfil?: string | null
    ativo?: boolean | null
    setor_id?: number | null
    setor?: { nome?: string | null } | null
  }

  return {
    id: item.id ?? 0,
    nome: item.name ?? item.nome ?? "",
    email: item.email ?? "",
    telefone: item.telefone ?? null,
    setorId: item.setor_id ?? null,
    perfil: item.perfil ?? null,
    ativo: typeof item.ativo === "boolean" ? item.ativo : null,
    setor: item.setor?.nome ?? null,
    status: typeof item.ativo === "boolean" ? (item.ativo ? "Ativo" : "Inativo") : null,
  }
}

function normalizarSetor(payload: unknown): SetorConfigItem {
  const item = (payload ?? {}) as {
    id?: number
    nome?: string
  }

  return {
    id: item.id ?? 0,
    nome: item.nome ?? "",
  }
}

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

export async function listarUsersConfig() {
  const response = await api.get(endpointMap.users)
  const lista = normalizarLista<unknown>(response.data)
  return lista.map((item) => normalizarUser(item))
}

export async function listarSetoresConfig() {
  const response = await api.get(endpointMap.setores)
  const lista = normalizarLista<unknown>(response.data)
  return lista.map((item) => normalizarSetor(item))
}

export async function listarSetoresTodosConfig() {
  const response = await api.get(endpointMap.setoresTodos)
  const lista = normalizarLista<unknown>(response.data)
  return lista.map((item) => normalizarSetor(item))
}

export async function listarEtiquetasConfig() {
  const response = await api.get(endpointMap.etiquetas)
  return normalizarLista<EtiquetaConfigItem>(response.data)
}

export async function criarUserConfig(payload: CreateUserPayload) {
  const response = await api.post(endpointMap.users, payload)
  return normalizarUser(response.data)
}

export async function criarSetorConfig(payload: CreateSetorPayload) {
  const response = await api.post(endpointMap.setores, payload)
  return normalizarSetor(response.data)
}

export async function criarEtiquetaConfig(payload: CreateEtiquetaPayload) {
  const response = await api.post<EtiquetaConfigItem>(endpointMap.etiquetas, payload)
  return response.data
}

export async function atualizarUserConfig(userId: number, payload: UpdateUserPayload) {
  const response = await api.post(`${endpointMap.users}/update-${userId}`, payload)
  return normalizarUser(response.data)
}

export async function excluirUserConfig(userId: number) {
  await api.delete(`${endpointMap.users}/${userId}`)
}

export async function atualizarSetorConfig(setorId: number, payload: UpdateSetorPayload) {
  const response = await api.post(`${endpointMap.setores}/update-${setorId}`, payload)
  return normalizarSetor(response.data)
}

export async function excluirSetorConfig(setorId: number) {
  await api.delete(`${endpointMap.setores}/${setorId}`)
}

export async function atualizarEtiquetaConfig(
  etiquetaId: number,
  payload: UpdateEtiquetaPayload
) {
  const response = await api.post<EtiquetaConfigItem>(
    `${endpointMap.etiquetas}/update-${etiquetaId}`,
    payload
  )
  return response.data
}

export async function excluirEtiquetaConfig(etiquetaId: number) {
  await api.delete(`${endpointMap.etiquetas}/${etiquetaId}`)
}
