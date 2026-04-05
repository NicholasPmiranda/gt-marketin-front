import api from "@/lib/axios"
import type {
  CreateTarefaModeloPayload,
  CreateEtiquetaPayload,
  CreateSetorPayload,
  CreateUserPayload,
  EtiquetaConfigItem,
  SetorConfigItem,
  TarefaModeloConfigItem,
  TarefaModeloResponsavel,
  TrocarSenhaPayload,
  UpdateTarefaModeloPayload,
  UpdateEtiquetaPayload,
  UpdateSetorPayload,
  UpdateUserPayload,
  UserConfigItem,
} from "@/types/configuracoes"
import type { TarefaStatus } from "@/types/tarefas"

const endpointMap = {
  users: "/api/config/user",
  usersTodos: "/api/config/user/todos",
  setores: "/api/config/setor",
  setoresTodos: "/api/config/setor/todos",
  etiquetas: "/api/config/etiqueta",
  etiquetasTodos: "/api/config/etiqueta/todos",
  tarefasModelo: "/api/config/tarefa-modelo",
  tarefasModeloTodos: "/api/config/tarefa-modelo/todos",
} as const

const statusOrdenado: TarefaStatus[] = ["pendente", "em andamento", "revisao", "finalizado"]

function normalizarStatus(status: unknown): TarefaStatus {
  if (typeof status === "string" && statusOrdenado.includes(status as TarefaStatus)) {
    return status as TarefaStatus
  }

  return "pendente"
}

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

function normalizarResponsavelTarefaModelo(payload: unknown): TarefaModeloResponsavel {
  const item = (payload ?? {}) as {
    id?: number
    name?: string
  }

  return {
    id: item.id ?? 0,
    name: item.name ?? "",
  }
}

function normalizarEtiqueta(payload: unknown): EtiquetaConfigItem {
  const item = (payload ?? {}) as {
    id?: number
    nome?: string
  }

  return {
    id: item.id ?? 0,
    nome: item.nome ?? "",
  }
}

function normalizarTarefaModelo(payload: unknown): TarefaModeloConfigItem {
  const item = (payload ?? {}) as {
    id?: number
    nome?: string
    descricao?: string | null
    status?: string
    responsaveis?: unknown[]
    etiquetas?: unknown[]
  }

  return {
    id: item.id ?? 0,
    nome: item.nome ?? "",
    descricao: item.descricao ?? null,
    status: normalizarStatus(item.status),
    responsaveis: Array.isArray(item.responsaveis)
      ? item.responsaveis.map((responsavel) => normalizarResponsavelTarefaModelo(responsavel))
      : [],
    etiquetas: Array.isArray(item.etiquetas)
      ? item.etiquetas.map((etiqueta) => normalizarEtiqueta(etiqueta))
      : [],
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

export async function listarUsersTodosConfig() {
  const response = await api.get(endpointMap.usersTodos)
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
  const lista = normalizarLista<unknown>(response.data)
  return lista.map((item) => normalizarEtiqueta(item))
}

export async function listarEtiquetasTodosConfig() {
  const response = await api.get(endpointMap.etiquetasTodos)
  const lista = normalizarLista<unknown>(response.data)
  return lista.map((item) => normalizarEtiqueta(item))
}

export async function listarTarefasModeloConfig() {
  const response = await api.get(endpointMap.tarefasModelo)
  const lista = normalizarLista<unknown>(response.data)
  return lista.map((item) => normalizarTarefaModelo(item))
}

export async function listarTarefasModeloTodosConfig() {
  const response = await api.get(endpointMap.tarefasModeloTodos)
  const lista = normalizarLista<unknown>(response.data)
  return lista.map((item) => normalizarTarefaModelo(item))
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
  const response = await api.post(endpointMap.etiquetas, payload)
  return normalizarEtiqueta(response.data)
}

export async function criarTarefaModeloConfig(payload: CreateTarefaModeloPayload) {
  const response = await api.post(endpointMap.tarefasModelo, payload)
  return normalizarTarefaModelo(response.data)
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
  const response = await api.post(
    `${endpointMap.etiquetas}/update-${etiquetaId}`,
    payload
  )
  return normalizarEtiqueta(response.data)
}

export async function excluirEtiquetaConfig(etiquetaId: number) {
  await api.delete(`${endpointMap.etiquetas}/${etiquetaId}`)
}

export async function atualizarTarefaModeloConfig(
  tarefaModeloId: number,
  payload: UpdateTarefaModeloPayload
) {
  const response = await api.post(
    `${endpointMap.tarefasModelo}/update-${tarefaModeloId}`,
    payload
  )
  return normalizarTarefaModelo(response.data)
}

export async function trocarSenhaUsuarioAutenticado(payload: TrocarSenhaPayload) {
  const response = await api.post<{ message: string }>("/api/change-password", payload)
  return response.data
}

export async function excluirTarefaModeloConfig(tarefaModeloId: number) {
  await api.delete(`${endpointMap.tarefasModelo}/${tarefaModeloId}`)
}
