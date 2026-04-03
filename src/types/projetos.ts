export type ProjetoEquipeItem = {
  id: number
  name: string
  setorNome: string | null
}

export type ProjetoItem = {
  id: number
  nome: string
  descricao: string | null
  ativo: boolean
  equipe: ProjetoEquipeItem[]
  createdAt: string | null
  updatedAt: string | null
}

export type ProjetoTarefaResponsavel = {
  id: number
  name: string
}

export type ProjetoTarefaEtiqueta = {
  id: number
  nome: string
}

export type ProjetoTarefaItem = {
  id: number
  projetoId: number
  nome: string
  descricao: string | null
  status: string
  responsaveis: ProjetoTarefaResponsavel[]
  etiquetas: ProjetoTarefaEtiqueta[]
}

export type ProjetosPaginados = {
  data: ProjetoItem[]
  currentPage: number
  lastPage: number
  total: number
}

export type CreateProjetoPayload = {
  nome: string
  descricao?: string
  ativo: boolean
  equipe_ids?: number[]
}

export type UpdateProjetoPayload = CreateProjetoPayload
