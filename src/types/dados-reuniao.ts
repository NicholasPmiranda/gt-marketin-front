export type DadosReuniaoItem = {
  id: number
  data: string
  createdAt: string | null
  updatedAt: string | null
}

export type DadosReuniaoDetalhe = DadosReuniaoItem & {
  conteudo: string
}

export type DadosReuniaoPaginados = {
  data: DadosReuniaoItem[]
  currentPage: number
  lastPage: number
  total: number
}

export type ProjetoAtivoReuniao = {
  id: number
  nome: string
}

export type TarefaDadosReuniao = {
  id: number
  nome: string
  status: "pendente" | "em andamento" | "revisao" | "finalizado"
  projetoId: number | null
  projetoNome: string | null
}

export type CriarTarefaDadosReuniaoPayload = {
  projeto_id: number
  nome: string
}
