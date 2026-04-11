import api from "@/lib/axios"
import type {
  DashBarraPrioridade,
  DashBarraProjeto,
  DashBarraResponsavel,
  DashBarraSetor,
  DashBarraStatus,
  DashCards,
  DashFiltros,
  DashLinhaLeadTime,
  DashLinhaTaxaConclusao,
  DashLinhaTotal,
} from "@/types/dash"

const endpoint = "/api/dash"

function mapearFiltros(filtros: DashFiltros) {
  return {
    projeto_id: filtros.projetoId,
    setor_id: filtros.setorId,
    data_inicio: filtros.dataInicio,
    data_fim: filtros.dataFim,
    periodo: filtros.periodo,
    limite: filtros.limite,
  }
}

export async function buscarDashCards(filtros: DashFiltros) {
  const response = await api.get<DashCards>(`${endpoint}/cards`, {
    params: mapearFiltros(filtros),
  })

  return response.data
}

export async function buscarDashBarrasStatus(filtros: DashFiltros) {
  const response = await api.get<DashBarraStatus[]>(`${endpoint}/barras/status`, {
    params: mapearFiltros(filtros),
  })

  return response.data
}

export async function buscarDashBarrasPrioridade(filtros: DashFiltros) {
  const response = await api.get<DashBarraPrioridade[]>(`${endpoint}/barras/prioridade`, {
    params: mapearFiltros(filtros),
  })

  return response.data
}

export async function buscarDashBarrasProjeto(filtros: DashFiltros) {
  const response = await api.get<DashBarraProjeto[]>(`${endpoint}/barras/projeto`, {
    params: mapearFiltros(filtros),
  })

  return response.data
}

export async function buscarDashBarrasSetor(filtros: DashFiltros) {
  const response = await api.get<DashBarraSetor[]>(`${endpoint}/barras/setor`, {
    params: mapearFiltros(filtros),
  })

  return response.data
}

export async function buscarDashBarrasResponsavel(filtros: DashFiltros) {
  const response = await api.get<DashBarraResponsavel[]>(`${endpoint}/barras/responsavel`, {
    params: mapearFiltros(filtros),
  })

  return response.data
}

export async function buscarDashLinhasCriadasPorPeriodo(filtros: DashFiltros) {
  const response = await api.get<DashLinhaTotal[]>(`${endpoint}/linhas/criadas-por-periodo`, {
    params: mapearFiltros(filtros),
  })

  return response.data
}

export async function buscarDashLinhasConcluidasPorPeriodo(filtros: DashFiltros) {
  const response = await api.get<DashLinhaTotal[]>(`${endpoint}/linhas/concluidas-por-periodo`, {
    params: mapearFiltros(filtros),
  })

  return response.data
}

export async function buscarDashLinhasBacklogPorPeriodo(filtros: DashFiltros) {
  const response = await api.get<DashLinhaTotal[]>(`${endpoint}/linhas/backlog-por-periodo`, {
    params: mapearFiltros(filtros),
  })

  return response.data
}

export async function buscarDashLinhasTaxaConclusaoPorPeriodo(filtros: DashFiltros) {
  const response = await api.get<DashLinhaTaxaConclusao[]>(`${endpoint}/linhas/taxa-conclusao-por-periodo`, {
    params: mapearFiltros(filtros),
  })

  return response.data
}

export async function buscarDashLinhasAtrasosPorPeriodo(filtros: DashFiltros) {
  const response = await api.get<DashLinhaTotal[]>(`${endpoint}/linhas/atrasos-por-periodo`, {
    params: mapearFiltros(filtros),
  })

  return response.data
}

export async function buscarDashLinhasLeadTimeMedioPorPeriodo(filtros: DashFiltros) {
  const response = await api.get<DashLinhaLeadTime[]>(`${endpoint}/linhas/lead-time-medio-por-periodo`, {
    params: mapearFiltros(filtros),
  })

  return response.data
}
