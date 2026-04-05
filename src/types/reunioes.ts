export type ReuniaoItem = {
  id: number
  zerogapId: string
  titulo: string
  tituloReuniao: string
  url: string
  urlCompartilhamento: string
  criadoEmOrigem: string | null
  inicioAgendadoEm: string | null
  fimAgendadoEm: string | null
  inicioGravacaoEm: string | null
  fimGravacaoEm: string | null
  tipoDominioConvidadosCalendario: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type ReunioesPaginadas = {
  data: ReuniaoItem[]
  currentPage: number
  lastPage: number
  total: number
}

export type ReuniaoDetalhe = ReuniaoItem & {
  transcricao: string | unknown[]
  resumoPadrao: string | unknown[]
  itensAcao: unknown[]
  convidadosCalendario: unknown[]
  gravadoPor: Record<string, unknown> | null
}

export type TarefaAiItem = {
  id: number
  reuniaoId: number
  tarefaModeloId: number | null
  tarefaModeloNome: string
  motivo: string
  createdAt: string | null
  updatedAt: string | null
}

export type ConverterTarefasAiPayload = {
  projeto_id: number
  tarefa_ai_ids: number[]
}
