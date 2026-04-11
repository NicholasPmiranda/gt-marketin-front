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
  DashOpcaoFiltro,
} from "@/types/dash"

const endpoint = "/api/dash"

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

function normalizarOpcaoFiltro(payload: unknown): DashOpcaoFiltro {
  const item = (payload ?? {}) as {
    id?: number
    nome?: string
    name?: string
  }

  return {
    id: item.id ?? 0,
    nome: item.nome ?? item.name ?? "",
  }
}

function normalizarPagina(payload: unknown) {
  const item = (payload ?? {}) as {
    current_page?: number
    last_page?: number
  }

  return {
    currentPage: item.current_page ?? 1,
    lastPage: item.last_page ?? 1,
  }
}

export async function listarProjetosTodosDash() {
  try {
    const response = await api.get("/api/projeto/todos")
    const lista = normalizarLista<unknown>(response.data)
    return lista.map((item) => normalizarOpcaoFiltro(item))
  } catch {
    const projetos: DashOpcaoFiltro[] = []
    let paginaAtual = 1
    let ultimaPagina = 1

    do {
      const response = await api.get("/api/projeto", {
        params: { page: paginaAtual },
      })

      const pagina = normalizarPagina(response.data)
      const listaPagina = normalizarLista<unknown>(response.data)

      projetos.push(...listaPagina.map((item) => normalizarOpcaoFiltro(item)))

      paginaAtual = pagina.currentPage + 1
      ultimaPagina = pagina.lastPage
    } while (paginaAtual <= ultimaPagina)

    return projetos
  }
}

export async function listarSetoresTodosDash() {
  try {
    const response = await api.get("/api/config/setores/todos")
    const lista = normalizarLista<unknown>(response.data)
    return lista.map((item) => normalizarOpcaoFiltro(item))
  } catch {
    const response = await api.get("/api/config/setor/todos")
    const lista = normalizarLista<unknown>(response.data)
    return lista.map((item) => normalizarOpcaoFiltro(item))
  }
}

export async function listarUsersTodosDash() {
  const response = await api.get("/api/config/user/todos")
  const lista = normalizarLista<unknown>(response.data)
  return lista.map((item) => normalizarOpcaoFiltro(item))
}

function mapearFiltros(filtros: DashFiltros) {
  return {
    projeto_id: filtros.projetoId,
    responsavel_ids:
      Array.isArray(filtros.responsavelIds) && filtros.responsavelIds.length > 0
        ? filtros.responsavelIds
        : undefined,
    data_inicio: filtros.dataInicio,
    data_fim: filtros.dataFim,
  }
}

export async function buscarDashCards(filtros: DashFiltros) {
  const response = await api.post<DashCards>(`${endpoint}/cards`, mapearFiltros(filtros))

  return response.data
}

export async function buscarDashBarrasStatus(filtros: DashFiltros) {
  const response = await api.post<DashBarraStatus[]>(`${endpoint}/barras/status`, mapearFiltros(filtros))

  return response.data
}

export async function buscarDashBarrasPrioridade(filtros: DashFiltros) {
  const response = await api.post<DashBarraPrioridade[]>(`${endpoint}/barras/prioridade`, mapearFiltros(filtros))

  return response.data
}

export async function buscarDashBarrasProjeto(filtros: DashFiltros) {
  const response = await api.post<DashBarraProjeto[]>(`${endpoint}/barras/projeto`, mapearFiltros(filtros))

  return response.data
}

export async function buscarDashBarrasSetor(filtros: DashFiltros) {
  const response = await api.post<DashBarraSetor[]>(`${endpoint}/barras/setor`, mapearFiltros(filtros))

  return response.data
}

export async function buscarDashBarrasResponsavel(filtros: DashFiltros) {
  const response = await api.post<DashBarraResponsavel[]>(`${endpoint}/barras/responsavel`, mapearFiltros(filtros))

  return response.data
}

export async function buscarDashLinhasCriadasPorPeriodo(filtros: DashFiltros) {
  const response = await api.post<DashLinhaTotal[]>(`${endpoint}/linhas/criadas-por-periodo`, mapearFiltros(filtros))

  return response.data
}

export async function buscarDashLinhasConcluidasPorPeriodo(filtros: DashFiltros) {
  const response = await api.post<DashLinhaTotal[]>(`${endpoint}/linhas/concluidas-por-periodo`, mapearFiltros(filtros))

  return response.data
}

export async function buscarDashLinhasBacklogPorPeriodo(filtros: DashFiltros) {
  const response = await api.post<DashLinhaTotal[]>(`${endpoint}/linhas/backlog-por-periodo`, mapearFiltros(filtros))

  return response.data
}

export async function buscarDashLinhasTaxaConclusaoPorPeriodo(filtros: DashFiltros) {
  const response = await api.post<DashLinhaTaxaConclusao[]>(`${endpoint}/linhas/taxa-conclusao-por-periodo`, mapearFiltros(filtros))

  return response.data
}

export async function buscarDashLinhasAtrasosPorPeriodo(filtros: DashFiltros) {
  const response = await api.post<DashLinhaTotal[]>(`${endpoint}/linhas/atrasos-por-periodo`, mapearFiltros(filtros))

  return response.data
}

export async function buscarDashLinhasLeadTimeMedioPorPeriodo(filtros: DashFiltros) {
  const response = await api.post<DashLinhaLeadTime[]>(`${endpoint}/linhas/lead-time-medio-por-periodo`, mapearFiltros(filtros))

  return response.data
}
