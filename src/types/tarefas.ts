export type TarefaStatus = "pendente" | "em andamento" | "revisao" | "finalizado"
export type TarefaPrioridade = "baixo" | "medio" | "alto"

export type TarefaUsuario = {
  id: number
  name: string
}

export type TarefaEtiqueta = {
  id: number
  nome: string
}

export type TarefaProjeto = {
  id: number
  nome: string
}

export type TarefaComentario = {
  id: number
  comentario: string
  user: TarefaUsuario | null
}

export type TarefaItem = {
  id: number
  ordemKanban: number | null
  projetoId: number
  tarefaPaiId: number | null
  nome: string
  descricao: string | null
  status: TarefaStatus
  prioridade: TarefaPrioridade
  agendamento: string | null
  inicio: string | null
  fim: string | null
  agendamentoInicio: string | null
  agendamentoFim: string | null
  projeto: TarefaProjeto | null
  responsaveis: TarefaUsuario[]
  etiquetas: TarefaEtiqueta[]
}

export type TarefaDetalhe = TarefaItem & {
  subtarefas: TarefaItem[]
  comentarios: TarefaComentario[]
}

export type TarefasPaginadas = {
  data: TarefaItem[]
  currentPage: number
  lastPage: number
  total: number
}

export type TarefasKanban = Record<TarefaStatus, TarefaItem[]>

export type ListarTarefasParams = {
  page?: number
  projetoId?: number
  search?: string
  status?: TarefaStatus | ""
  prioridade?: "baixa" | "media" | "alta" | ""
  responsavelId?: number
  agendamento?: string
  inicio?: string
  fim?: string
}

export type CriarTarefaPayload = {
  projeto_id: number
  tarefa_pai_id?: number | null
  nome: string
  descricao?: string
  status: TarefaStatus
  prioridade: TarefaPrioridade
  agendamento_inicio?: string
  responsavel_ids: number[]
  etiqueta_ids?: number[]
}

export type AtualizarTarefaPayload = {
  projeto_id: number
  tarefa_pai_id?: number | null
  nome: string
  descricao?: string
  status: TarefaStatus
  prioridade: TarefaPrioridade
  agendamento_inicio?: string
  responsavel_ids: number[]
  etiqueta_ids?: number[]
}

export type CriarComentarioPayload = {
  tarefa_id: number
  comentario: string
}
