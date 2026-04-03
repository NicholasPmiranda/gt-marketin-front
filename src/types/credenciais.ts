export type CredencialLiberado = {
  id: number
  name: string
}

export type CredencialCriador = {
  id: number
  name: string
}

export type CredencialItem = {
  id: number
  nome: string
  url: string
  acesso: string
  senha: string
  criadorId: number | null
  criador: CredencialCriador | null
  liberados: CredencialLiberado[]
  createdAt: string | null
  updatedAt: string | null
}

export type CreateCredencialPayload = {
  nome: string
  url: string
  acesso: string
  senha: string
  liberado_ids?: number[]
}

export type UpdateCredencialPayload = CreateCredencialPayload

export type CredencialSolicitacaoStatus = "pendente" | "aprovado" | "rejeitado"

export type CredencialSolicitacaoItem = {
  id: number
  credencialId: number
  solicitanteId: number
  nome: string
  url: string
  acesso: string
  senha: string
  liberadoIds: number[]
  status: CredencialSolicitacaoStatus
  analisadoPor: number | null
  analisadoEm: string | null
  credencial: {
    id: number
    nome: string
  } | null
  solicitante: {
    id: number
    name: string
  } | null
  createdAt: string | null
  updatedAt: string | null
}

export type AtualizarCredencialResult =
  | {
      tipo: "credencial"
      data: CredencialItem
    }
  | {
      tipo: "solicitacao"
      data: CredencialSolicitacaoItem
    }

export type AnalisarCredencialSolicitacaoPayload = {
  aceitar: boolean
}
