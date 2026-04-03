import api from "@/lib/axios"

export type RegistroFinanceiro = {
  id: number
  user_id: number
  nome: string
  instituicao: string
  tipo?: string
}

export type RegraCategoriaAutomatica = {
  id: number
  user_id: number
  texto: string
  condicao: "=" | "!=" | "contem"
  categoria: string
  created_at: string
  updated_at: string
}

export type FiltrosRegrasCategoriaAutomatica = {
  search?: string
  condicao?: "=" | "!=" | "contem"
  page?: number
}

export type OfxLancamento = {
  tipo?: string
  data: string
  descricao: string
  valor: number
  fitid: string
  categoria?: string
  parcelamento?: boolean
  parcelas?: number
  parcela_atual?: number
}

export type LancamentoContaBancaria = {
  id: number
  user_id: number
  conta_bancaria_id: number
  tipo: string
  nome: string
  categoria: string
  valor: string
  origem: string
  status: string
  vencimento_em: string
}

export type LancamentoCartao = {
  id: number
  user_id: number
  cartao_id: number
  tipo: string
  nome: string
  categoria: string
  valor: string
  origem: string
  status: string
  vencimento_em: string
  parcelado?: boolean
  parcelas?: number
  parcela_atual?: number
}

export type ParcelamentoCartaoAtivo = {
  id: number
  user_id: number
  cartao_id: number
  nome_item: string
  categoria: string
  valor_parcela: string
  valor_total: string
  total_parcelas: number
  parcelas_pagas: number
  parcelas_restantes: number
  finalizado: boolean
  cartao: {
    id: number
    nome: string
    instituicao: string
  }
}

export type LancamentoPagoParcelamento = {
  id: number
  user_id: number
  cartao_id: number
  parcelas_cartao_id: number
  tipo: string
  nome: string
  categoria: string
  valor: string
  origem: string
  status: string
  parcelado: boolean
  parcelas: number
  parcela_atual: number
  parcelas_restantes: number
  vencimento_em: string
}

export type FiltrosLancamentosContaBancaria = {
  categoria?: string
  descricao?: string
  valor?: string
  data_inicial?: string
  data_final?: string
  per_page?: number
  page?: number
}

export type FiltrosLancamentosCartao = {
  categoria?: string
  descricao?: string
  valor?: string
  ano?: number
  mes?: string
  fatura?: string[]
}

export type DashboardFaturaCardsPrincipais = {
  valor_total_fatura: string
  quantidade_compras: number
  ticket_medio_fatura: string
  maior_compra_mes: string
  total_avista: string
  total_parcelado: string
  percentual_parcelado: string
  quantidade_compras_parceladas: number
  comparativo_ativo?: boolean
  comparativo?: {
    fatura_atual: string
    fatura_anterior: string
    variacao_valor_total_fatura: string
    variacao_percentual_valor_total_fatura: string
    variacao_quantidade_compras: number
    variacao_percentual_quantidade_compras: string
    variacao_ticket_medio_fatura: string
    variacao_percentual_ticket_medio_fatura: string
    variacao_maior_compra_mes: string
    variacao_percentual_maior_compra_mes: string
    variacao_total_avista: string
    variacao_percentual_total_avista: string
    variacao_total_parcelado: string
    variacao_percentual_total_parcelado: string
    variacao_quantidade_compras_parceladas: number
    variacao_percentual_quantidade_compras_parceladas: string
  }
}

export type DashboardFaturaValorParcelas = {
  valor_parcelas_fatura: string
}

export type DashboardFaturaSaldoFuturo = {
  saldo_futuro_comprometido: string
}

export type DashboardFaturaNumeroParcelamentos = {
  numero_parcelamentos_ativos: number
}

export type DashboardFaturaPrazoMedio = {
  prazo_medio_restante: string
}

export type DashboardFaturaTopParcelamento = {
  id: number
  nome_item: string
  categoria: string
  saldo_em_aberto: string
}

export type DashboardFaturaTopCategoria = {
  categoria: string
  total: string
}

export type DashboardFaturaConcentracaoCategoria = {
  categoria: string
  valor_categoria: string
  percentual_concentracao: string
}

export type DashboardFaturaTopEstabelecimento = {
  nome: string
  total: string
}

export type DashboardFaturaDistribuicaoSemanal = {
  semana: number
  total: string
}

export type CategoriaEstabelecimentoUnica = {
  categoria: string
}

let categoriasEstabelecimentosCache: CategoriaEstabelecimentoUnica[] | null = null
let categoriasEstabelecimentosInFlight: Promise<CategoriaEstabelecimentoUnica[]> | null = null
let faturasUnicasCache: string[] | null = null
let faturasUnicasInFlight: Promise<string[]> | null = null
const lancamentosCartaoInFlight = new Map<string, Promise<LancamentoCartao[]>>()
const dashboardFaturaInFlight = new Map<string, Promise<unknown>>()
let parcelamentosCartaoAtivosInFlight: Promise<ParcelamentoCartaoAtivo[]> | null = null

type PaginacaoMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

type PaginacaoLinks = {
  next?: string | null
  prev?: string | null
}

export type PaginacaoCompletaResponse<T> = {
  data: T[]
  meta?: PaginacaoMeta
  links?: PaginacaoLinks
}

type OfxLeituraResponse = {
  arquivo_path: string
  instituicao: string
  bank_id: string
  conta: string
  tipo_conta: string
  lancamentos: OfxLancamento[]
}

type OfxLeituraCartaoResponse =
  | OfxLancamento[]
  | {
      instituicao?: string
      lancamentos: OfxLancamento[]
    }

type OfxSalvarInput = {
  conta_bancaria_id: number
  lancamentos: Array<{
    data: string
    descricao: string
    categoria: string
    valor: number
    fitid: string
  }>
}

type OfxSalvarCartaoInput = {
  cartao_id: number
  lancamentos: Array<{
    tipo?: string
    data: string
    descricao: string
    categoria: string
    valor: number
    fitid?: string
    parcelamento?: boolean
    parcelas?: number
    parcela_atual?: number
  }>
}

type OfxSalvarResponse = {
  receitas_criadas: number
  despesas_criadas: number
  lancamentos_ignorados: number
  total_lancamentos: number
}

type PaginacaoResponse<T> = {
  data: T[]
}

type NovoRegistroInput = {
  nome: string
  instituicao: string
}

type AtualizarRegistroInput = {
  nome: string
  instituicao: string
}

export async function listarContasBancarias(search?: string) {
  const response = await api.get<PaginacaoResponse<RegistroFinanceiro>>(
    "/api/contas-bancarias",
    {
      params: { search: search || undefined },
    }
  )

  return response.data.data
}

export async function listarLancamentosContaBancaria(
  contaBancariaId: string | number,
  filtros?: FiltrosLancamentosContaBancaria
) {
  const response = await api.get<PaginacaoCompletaResponse<LancamentoContaBancaria>>(
    `/api/contas-bancarias/${contaBancariaId}/lancamentos-diarios`,
    {
      params: {
        categoria: filtros?.categoria || undefined,
        descricao: filtros?.descricao || undefined,
        valor: filtros?.valor || undefined,
        data_inicial: filtros?.data_inicial || undefined,
        data_final: filtros?.data_final || undefined,
        per_page: filtros?.per_page || undefined,
        page: filtros?.page || undefined,
      },
    }
  )

  return response.data
}

export async function listarCategoriasEstabelecimentosUnicas() {
  if (categoriasEstabelecimentosCache) {
    return categoriasEstabelecimentosCache
  }

  if (categoriasEstabelecimentosInFlight) {
    return categoriasEstabelecimentosInFlight
  }

  categoriasEstabelecimentosInFlight = api
    .get<CategoriaEstabelecimentoUnica[]>("/api/suporte/categorias-estabelecimentos/unicas")
    .then((response) => {
      categoriasEstabelecimentosCache = response.data
      return response.data
    })
    .finally(() => {
      categoriasEstabelecimentosInFlight = null
    })

  return categoriasEstabelecimentosInFlight
}

export async function listarFaturasUnicas() {
  if (faturasUnicasCache) {
    return faturasUnicasCache
  }

  if (faturasUnicasInFlight) {
    return faturasUnicasInFlight
  }

  faturasUnicasInFlight = api
    .get<string[]>("/api/suporte/faturas/unicas")
    .then((response) => {
      faturasUnicasCache = response.data
      return response.data
    })
    .finally(() => {
      faturasUnicasInFlight = null
    })

  return faturasUnicasInFlight
}

export async function listarParcelamentosCartaoAtivos() {
  if (parcelamentosCartaoAtivosInFlight) {
    return parcelamentosCartaoAtivosInFlight
  }

  parcelamentosCartaoAtivosInFlight = api
    .get<ParcelamentoCartaoAtivo[]>("/api/parcelamentos-cartao/ativos")
    .then((response) => response.data)
    .finally(() => {
      parcelamentosCartaoAtivosInFlight = null
    })

  return parcelamentosCartaoAtivosInFlight
}

export async function listarLancamentosPagosParcelamento(parcelasCartaoId: string | number) {
  const response = await api.get<LancamentoPagoParcelamento[]>(
    `/api/parcelamentos-cartao/${parcelasCartaoId}/lancamentos-pagos`
  )

  return response.data
}

export async function listarLancamentosCartao(
  cartaoId: string | number,
  filtros?: FiltrosLancamentosCartao
) {
  const chaveFiltro = JSON.stringify({
    cartaoId,
    categoria: filtros?.categoria || undefined,
    descricao: filtros?.descricao || undefined,
    valor: filtros?.valor || undefined,
    ano: filtros?.ano || undefined,
    mes: filtros?.mes || undefined,
    fatura: filtros?.fatura && filtros.fatura.length > 0 ? filtros.fatura : undefined,
  })

  const requisicaoEmAndamento = lancamentosCartaoInFlight.get(chaveFiltro)
  if (requisicaoEmAndamento) {
    return requisicaoEmAndamento
  }

  const promise = api
    .post<LancamentoCartao[]>(`/api/cartoes/${cartaoId}/lancamentos-diarios`, {
      categoria: filtros?.categoria || undefined,
      descricao: filtros?.descricao || undefined,
      valor: filtros?.valor || undefined,
      ano: filtros?.ano || undefined,
      mes: filtros?.mes || undefined,
      fatura: filtros?.fatura && filtros.fatura.length > 0 ? filtros.fatura : undefined,
    })
    .then((response) => response.data)
    .finally(() => {
      lancamentosCartaoInFlight.delete(chaveFiltro)
    })

  lancamentosCartaoInFlight.set(chaveFiltro, promise)

  return promise
}

type FiltrosDashboardFatura = Pick<
  FiltrosLancamentosCartao,
  "ano" | "mes" | "categoria" | "descricao" | "fatura"
>

function montarParamsDashboardFatura(filtros: FiltrosDashboardFatura) {
  return {
    ano: filtros.ano,
    mes: filtros.mes,
    categoria: filtros.categoria || undefined,
    descricao: filtros.descricao || undefined,
    fatura: filtros.fatura && filtros.fatura.length > 0 ? filtros.fatura : undefined,
  }
}

function buscarComDeduplicacaoDashboard<T>(
  cartaoId: string | number,
  endpoint: string,
  filtros: FiltrosDashboardFatura
) {
  const body = montarParamsDashboardFatura(filtros)
  const chave = JSON.stringify({ cartaoId, endpoint, ...body })

  const requisicaoEmAndamento = dashboardFaturaInFlight.get(chave)
  if (requisicaoEmAndamento) {
    return requisicaoEmAndamento as Promise<T>
  }

  const promise = api
    .post<T>(`/api/cartoes/${cartaoId}/dashboard-fatura/${endpoint}`, body)
    .then((response) => response.data)
    .finally(() => {
      dashboardFaturaInFlight.delete(chave)
    })

  dashboardFaturaInFlight.set(chave, promise)

  return promise
}

export async function buscarDashboardFaturaCardsPrincipais(
  cartaoId: string | number,
  filtros: FiltrosDashboardFatura
) {
  return buscarComDeduplicacaoDashboard<DashboardFaturaCardsPrincipais>(
    cartaoId,
    "cards-principais",
    filtros
  )
}

export async function buscarDashboardFaturaValorParcelas(
  cartaoId: string | number,
  filtros: FiltrosDashboardFatura
) {
  return buscarComDeduplicacaoDashboard<DashboardFaturaValorParcelas>(
    cartaoId,
    "valor-parcelas-fatura",
    filtros
  )
}

export async function buscarDashboardFaturaSaldoFuturo(
  cartaoId: string | number,
  filtros: FiltrosDashboardFatura
) {
  return buscarComDeduplicacaoDashboard<DashboardFaturaSaldoFuturo>(
    cartaoId,
    "saldo-futuro-comprometido",
    filtros
  )
}

export async function buscarDashboardFaturaNumeroParcelamentos(
  cartaoId: string | number,
  filtros: FiltrosDashboardFatura
) {
  return buscarComDeduplicacaoDashboard<DashboardFaturaNumeroParcelamentos>(
    cartaoId,
    "numero-parcelamentos-ativos",
    filtros
  )
}

export async function buscarDashboardFaturaPrazoMedio(
  cartaoId: string | number,
  filtros: FiltrosDashboardFatura
) {
  return buscarComDeduplicacaoDashboard<DashboardFaturaPrazoMedio>(
    cartaoId,
    "prazo-medio-restante",
    filtros
  )
}

export async function buscarDashboardFaturaTopParcelamentos(
  cartaoId: string | number,
  filtros: FiltrosDashboardFatura
) {
  return buscarComDeduplicacaoDashboard<DashboardFaturaTopParcelamento[]>(
    cartaoId,
    "top-parcelamentos-saldo-em-aberto",
    filtros
  )
}

export async function buscarDashboardFaturaTopCategorias(
  cartaoId: string | number,
  filtros: FiltrosDashboardFatura
) {
  return buscarComDeduplicacaoDashboard<DashboardFaturaTopCategoria[]>(
    cartaoId,
    "top-categorias-por-valor",
    filtros
  )
}

export async function buscarDashboardFaturaConcentracaoCategoria(
  cartaoId: string | number,
  filtros: FiltrosDashboardFatura
) {
  return buscarComDeduplicacaoDashboard<
    DashboardFaturaConcentracaoCategoria | DashboardFaturaConcentracaoCategoria[]
  >(
    cartaoId,
    "concentracao-maior-categoria",
    filtros
  ).then((response) => {
    if (Array.isArray(response)) {
      return response
    }

    return [response]
  })
}

export async function buscarDashboardFaturaTopEstabelecimentos(
  cartaoId: string | number,
  filtros: FiltrosDashboardFatura
) {
  return buscarComDeduplicacaoDashboard<DashboardFaturaTopEstabelecimento[]>(
    cartaoId,
    "top-estabelecimentos-por-gasto",
    filtros
  )
}

export async function buscarDashboardFaturaDistribuicaoSemanal(
  cartaoId: string | number,
  filtros: FiltrosDashboardFatura
) {
  return buscarComDeduplicacaoDashboard<DashboardFaturaDistribuicaoSemanal[]>(
    cartaoId,
    "distribuicao-semanal",
    filtros
  )
}

export async function buscarContaBancaria(id: string | number) {
  const response = await api.get<RegistroFinanceiro>(`/api/contas-bancarias/${id}`)
  return response.data
}

export async function criarContaBancaria(input: NovoRegistroInput) {
  const response = await api.post<RegistroFinanceiro>("/api/contas-bancarias", {
    nome: input.nome,
    instituicao: input.instituicao,
    tipo: "conta corrente",
  })

  return response.data
}

export async function atualizarContaBancaria(
  id: string | number,
  input: AtualizarRegistroInput
) {
  const response = await api.put<RegistroFinanceiro>(`/api/contas-bancarias/${id}`, {
    nome: input.nome,
    instituicao: input.instituicao,
    tipo: "conta corrente",
  })

  return response.data
}

export async function listarCartoes(search?: string) {
  const response = await api.get<PaginacaoResponse<RegistroFinanceiro>>(
    "/api/cartoes",
    {
      params: { search: search || undefined },
    }
  )

  return response.data.data
}

export async function buscarCartao(id: string | number) {
  const response = await api.get<RegistroFinanceiro>(`/api/cartoes/${id}`)
  return response.data
}

export async function criarCartao(input: NovoRegistroInput) {
  const response = await api.post<RegistroFinanceiro>("/api/cartoes", {
    nome: input.nome,
    instituicao: input.instituicao,
  })

  return response.data
}

export async function atualizarCartao(id: string | number, input: AtualizarRegistroInput) {
  const response = await api.put<RegistroFinanceiro>(`/api/cartoes/${id}`, {
    nome: input.nome,
    instituicao: input.instituicao,
  })

  return response.data
}

export async function listarRegrasCategoriaAutomaticas(
  filtros?: FiltrosRegrasCategoriaAutomatica
) {
  const response = await api.get<PaginacaoCompletaResponse<RegraCategoriaAutomatica>>(
    "/api/regras-categoria-automaticas",
    {
      params: {
        search: filtros?.search || undefined,
        condicao: filtros?.condicao || undefined,
        page: filtros?.page || undefined,
      },
    }
  )

  return response.data
}

export async function buscarRegraCategoriaAutomatica(id: string | number) {
  const response = await api.get<RegraCategoriaAutomatica>(`/api/regras-categoria-automaticas/${id}`)
  return response.data
}

export async function criarRegraCategoriaAutomatica(input: {
  texto: string
  condicao: "=" | "!=" | "contem"
  categoria: string
}) {
  const response = await api.post<RegraCategoriaAutomatica>("/api/regras-categoria-automaticas", {
    texto: input.texto,
    condicao: input.condicao,
    categoria: input.categoria,
  })

  return response.data
}

export async function atualizarRegraCategoriaAutomatica(
  id: string | number,
  input: {
    texto: string
    condicao: "=" | "!=" | "contem"
    categoria: string
  }
) {
  const response = await api.put<RegraCategoriaAutomatica>(`/api/regras-categoria-automaticas/${id}`, {
    texto: input.texto,
    condicao: input.condicao,
    categoria: input.categoria,
  })

  return response.data
}

export async function excluirRegraCategoriaAutomatica(id: string | number) {
  await api.delete(`/api/regras-categoria-automaticas/${id}`)
}

export async function importarOfxContaBancaria(arquivo: File) {
  const formData = new FormData()
  formData.append("arquivo", arquivo)

  const response = await api.post<OfxLeituraResponse>(
    "/api/importacoes/conta-bancaria/ofx",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )

  return response.data
}

export async function importarOfxCartaoCredito(arquivo: File) {
  const formData = new FormData()
  formData.append("arquivo", arquivo)

  const response = await api.post<OfxLeituraCartaoResponse>(
    "/api/importacoes/cartao-credito/ofx",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )

  if (Array.isArray(response.data)) {
    return response.data
  }

  return response.data.lancamentos
}

export async function salvarImportacaoOfxContaBancaria(input: OfxSalvarInput) {
  const response = await api.post<OfxSalvarResponse>(
    "/api/importacoes/conta-bancaria/ofx/salvar",
    {
      conta_bancaria_id: input.conta_bancaria_id,
      lancamentos: input.lancamentos,
    }
  )

  return response.data
}

export async function salvarImportacaoOfxCartaoCredito(input: OfxSalvarCartaoInput) {
  const response = await api.post<OfxSalvarResponse>("/api/importacoes/cartao-credito/ofx/salvar", {
    cartao_id: input.cartao_id,
    lancamentos: input.lancamentos,
  })

  return response.data
}
