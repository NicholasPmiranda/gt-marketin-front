import type { TarefaStatus } from "@/types/tarefas"

export type ConfigTab = "users" | "setores" | "etiquetas" | "tarefas-modelo" | "meu-perfil"

export type TrocarSenhaPayload = {
  senha_atual: string
  password: string
  password_confirmation: string
}

export type UserConfigItem = {
  id: number
  nome: string
  email: string
  telefone?: string | null
  setorId?: number | null
  setor?: string | null
  perfil?: string | null
  ativo?: boolean | null
  status?: string | null
}

export type SetorConfigItem = {
  id: number
  nome: string
}

export type EtiquetaConfigItem = {
  id: number
  nome: string
}

export type TarefaModeloResponsavel = {
  id: number
  name: string
}

export type TarefaModeloConfigItem = {
  id: number
  nome: string
  descricao: string | null
  status: TarefaStatus
  responsaveis: TarefaModeloResponsavel[]
  etiquetas: EtiquetaConfigItem[]
}

export type CreateUserPayload = {
  name: string
  email: string
  telefone: string
  perfil: string
  setor_id: number
  ativo: boolean
}

export type CreateSetorPayload = {
  nome: string
}

export type CreateEtiquetaPayload = {
  nome: string
}

export type UpdateUserPayload = CreateUserPayload & {
  password?: string
}

export type UpdateSetorPayload = CreateSetorPayload

export type UpdateEtiquetaPayload = CreateEtiquetaPayload

export type CreateTarefaModeloPayload = {
  nome: string
  descricao?: string
  status: TarefaStatus
  responsavel_ids: number[]
  etiqueta_ids?: number[]
}

export type UpdateTarefaModeloPayload = CreateTarefaModeloPayload
