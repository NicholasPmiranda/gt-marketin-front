export type ConfigTab = "users" | "setores" | "etiquetas"

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

export type UpdateUserPayload = CreateUserPayload

export type UpdateSetorPayload = CreateSetorPayload

export type UpdateEtiquetaPayload = CreateEtiquetaPayload
