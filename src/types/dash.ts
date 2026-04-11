export type DashPeriodo = "dia" | "semana" | "mes"

export type DashFiltros = {
  projetoId?: number
  setorId?: number
  dataInicio?: string
  dataFim?: string
  periodo?: DashPeriodo
  limite?: number
}

export type DashCards = {
  total_tarefas: number
  tarefas_ativas: number
  tarefas_concluidas: number
  taxa_conclusao: number
  projetos_unicos: number
  setores_unicos: number
  responsaveis_unicos: number
}

export type DashBarraStatus = {
  status: string
  total: number
}

export type DashBarraPrioridade = {
  prioridade: string
  total: number
}

export type DashBarraProjeto = {
  projeto_id: number
  projeto_nome: string
  total: number
}

export type DashBarraSetor = {
  setor_id: number
  setor_nome: string
  total: number
}

export type DashBarraResponsavel = {
  responsavel_id: number
  responsavel_nome: string
  total: number
}

export type DashLinhaTotal = {
  periodo: string
  total: number
}

export type DashLinhaTaxaConclusao = {
  periodo: string
  criadas: number
  concluidas: number
  taxa_conclusao: number
}

export type DashLinhaLeadTime = {
  periodo: string
  lead_time_horas: number
}
