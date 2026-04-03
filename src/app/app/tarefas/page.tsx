"use client"

import {useEffect, useMemo, useRef, useState} from "react"
import {format} from "date-fns"
import {ptBR} from "date-fns/locale"
import {ChevronDownIcon, Columns3Icon, LayoutGridIcon, SearchIcon} from "lucide-react"
import {toast} from "sonner"

import {listarUsersConfig} from "@/lib/configuracoes-api"
import {listarProjetos} from "@/lib/projetos-api"
import {atualizarStatusTarefa, listarTarefas, listarTarefasKanban} from "@/lib/tarefas-api"
import type {UserConfigItem} from "@/types/configuracoes"
import type {ProjetoItem} from "@/types/projetos"
import type {TarefaItem, TarefasKanban, TarefaStatus} from "@/types/tarefas"
import {Button} from "@/components/ui/button"
import {Calendar} from "@/components/ui/calendar"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {CriarTarefaModal} from "./components/criar-tarefa-modal"
import {TarefasGradeView} from "./components/tarefas-grade-view"
import {TarefasKanbanView} from "./components/tarefas-kanban-view"
import {TarefasListSkeleton} from "./components/tarefas-list-skeleton"

type ViewMode = "grade" | "kanban"
type StatusFilter = TarefaStatus | "todos"
type PrioridadeFilter = "todos" | "baixa" | "media" | "alta"

const STORAGE_VIEW_KEY = "tarefas-list-mode"

const kanbanInicial: TarefasKanban = {
    pendente: [],
    "em andamento": [],
    revisao: [],
    finalizado: [],
}

function getErrorMessage(error: unknown, fallback: string) {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
    ) {
        return error.response.data.message
    }

    return fallback
}

function formatDateFilter(date?: Date) {
    if (!date) {
        return undefined
    }

    return format(date, "yyyy-MM-dd")
}

export default function Page() {
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>("grade")
    const [search, setSearch] = useState("")
    const [projetoFilter, setProjetoFilter] = useState("todos")
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos")
    const [prioridadeFilter, setPrioridadeFilter] = useState<PrioridadeFilter>("todos")
    const [responsavelFilter, setResponsavelFilter] = useState("todos")
    const [agendamentoFilter, setAgendamentoFilter] = useState<Date | undefined>(undefined)
    const [inicioFilter, setInicioFilter] = useState<Date | undefined>(undefined)
    const [fimFilter, setFimFilter] = useState<Date | undefined>(undefined)
    const [tarefasGrade, setTarefasGrade] = useState<TarefaItem[]>([])
    const [tarefasKanban, setTarefasKanban] = useState<TarefasKanban>(kanbanInicial)
    const [projetos, setProjetos] = useState<ProjetoItem[]>([])
    const [responsaveis, setResponsaveis] = useState<UserConfigItem[]>([])
    const [page, setPage] = useState(1)
    const [lastPage, setLastPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [movingTaskId, setMovingTaskId] = useState<number | null>(null)
    const [isViewModeReady, setIsViewModeReady] = useState(false)
    const requestIdRef = useRef(0)

    useEffect(() => {
        const savedView = localStorage.getItem(STORAGE_VIEW_KEY)

        if (savedView === "grade" || savedView === "kanban") {
            setViewMode(savedView)
        }

        setIsViewModeReady(true)
    }, [])

    useEffect(() => {
        async function carregarDadosFiltros() {
            try {
                const [projetosResponse, usuariosResponse] = await Promise.all([
                    listarProjetos({page: 1}),
                    listarUsersConfig(),
                ])

                setProjetos(projetosResponse.data)
                setResponsaveis(usuariosResponse)
            } catch (error) {
                toast.error(getErrorMessage(error, "Nao foi possivel carregar os filtros de tarefas."))
            }
        }

        void carregarDadosFiltros()
    }, [])

    async function carregarTarefas({
        silent = false,
        pageOverride,
        projetoFilterOverride,
        statusFilterOverride,
        prioridadeFilterOverride,
        responsavelFilterOverride,
        agendamentoFilterOverride,
        inicioFilterOverride,
        fimFilterOverride,
        searchOverride,
    }: {
        silent?: boolean
        pageOverride?: number
        projetoFilterOverride?: string
        statusFilterOverride?: StatusFilter
        prioridadeFilterOverride?: PrioridadeFilter
        responsavelFilterOverride?: string
        agendamentoFilterOverride?: Date | undefined
        inicioFilterOverride?: Date | undefined
        fimFilterOverride?: Date | undefined
        searchOverride?: string
    } = {}) {
        const requestId = ++requestIdRef.current
        const pageAtual = pageOverride ?? page
        const projetoFilterAtual = projetoFilterOverride ?? projetoFilter
        const statusFilterAtual = statusFilterOverride ?? statusFilter
        const prioridadeFilterAtual = prioridadeFilterOverride ?? prioridadeFilter
        const responsavelFilterAtual = responsavelFilterOverride ?? responsavelFilter
        const agendamentoFilterAtual = agendamentoFilterOverride ?? agendamentoFilter
        const inicioFilterAtual = inicioFilterOverride ?? inicioFilter
        const fimFilterAtual = fimFilterOverride ?? fimFilter
        const searchAtual = searchOverride ?? search
        const projetoId = projetoFilterAtual !== "todos" ? Number(projetoFilterAtual) : undefined
        const responsavelId = responsavelFilterAtual !== "todos" ? Number(responsavelFilterAtual) : undefined
        const agendamento = formatDateFilter(agendamentoFilterAtual)
        const inicio = formatDateFilter(inicioFilterAtual)
        const fim = formatDateFilter(fimFilterAtual)

        try {
            if (silent) {
                setIsRefreshing(true)
            } else {
                setIsLoading(true)
            }

            if (viewMode === "grade") {
                const response = await listarTarefas({
                    page: pageAtual,
                    projetoId,
                    search: searchAtual,
                    status: statusFilterAtual === "todos" ? "" : statusFilterAtual,
                    prioridade: prioridadeFilterAtual === "todos" ? "" : prioridadeFilterAtual,
                    responsavelId,
                    agendamento,
                    inicio,
                    fim,
                })

                if (requestId !== requestIdRef.current) {
                    return
                }

                setTarefasGrade(response.data)
                setLastPage(response.lastPage)
                setTotal(response.total)
                setTarefasKanban(kanbanInicial)

                return
            }

            const response = await listarTarefasKanban({
                projetoId,
                search: searchAtual,
                status: statusFilterAtual === "todos" ? undefined : statusFilterAtual,
                prioridade: prioridadeFilterAtual === "todos" ? undefined : prioridadeFilterAtual,
                responsavelId,
                agendamento,
                inicio,
                fim,
            })

            if (requestId !== requestIdRef.current) {
                return
            }

            const totalKanban =
                response.pendente.length +
                response["em andamento"].length +
                response.revisao.length +
                response.finalizado.length

            setTarefasKanban(response)
            setTarefasGrade([])
            setTotal(totalKanban)
            setPage(1)
            setLastPage(1)
        } catch (error) {
            if (requestId !== requestIdRef.current) {
                return
            }

            toast.error(getErrorMessage(error, "Nao foi possivel carregar as tarefas."))
        } finally {
            if (requestId !== requestIdRef.current) {
                return
            }

            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        if (!isViewModeReady) {
            return
        }

        void carregarTarefas()
    }, [isViewModeReady, viewMode, page])

    function handleBuscar() {
        if (page !== 1) {
            setPage(1)
            return
        }

        void carregarTarefas({silent: true})
    }

    function handleLimparFiltros() {
        const filtrosLimpos = {
            pageOverride: 1,
            projetoFilterOverride: "todos",
            statusFilterOverride: "todos" as StatusFilter,
            prioridadeFilterOverride: "todos" as PrioridadeFilter,
            responsavelFilterOverride: "todos",
            agendamentoFilterOverride: undefined,
            inicioFilterOverride: undefined,
            fimFilterOverride: undefined,
            searchOverride: "",
        }

        setSearch("")
        setProjetoFilter("todos")
        setStatusFilter("todos")
        setPrioridadeFilter("todos")
        setResponsavelFilter("todos")
        setAgendamentoFilter(undefined)
        setInicioFilter(undefined)
        setFimFilter(undefined)

        setPage(1)
        void carregarTarefas({silent: true, ...filtrosLimpos})
    }

    function handleViewChange(value: ViewMode) {
        setViewMode(value)
        localStorage.setItem(STORAGE_VIEW_KEY, value)
    }

    function moverItemKanban(
        quadro: TarefasKanban,
        tarefaId: number,
        statusOrigem: TarefaStatus,
        statusDestino: TarefaStatus
    ) {
        const tarefaMovida = quadro[statusOrigem].find((item) => item.id === tarefaId)

        if (!tarefaMovida) {
            return quadro
        }

        return {
            pendente:
                statusDestino === "pendente"
                    ? [...quadro.pendente, {...tarefaMovida, status: statusDestino}]
                    : quadro.pendente.filter((item) => item.id !== tarefaId),
            "em andamento":
                statusDestino === "em andamento"
                    ? [...quadro["em andamento"], {...tarefaMovida, status: statusDestino}]
                    : quadro["em andamento"].filter((item) => item.id !== tarefaId),
            revisao:
                statusDestino === "revisao"
                    ? [...quadro.revisao, {...tarefaMovida, status: statusDestino}]
                    : quadro.revisao.filter((item) => item.id !== tarefaId),
            finalizado:
                statusDestino === "finalizado"
                    ? [...quadro.finalizado, {...tarefaMovida, status: statusDestino}]
                    : quadro.finalizado.filter((item) => item.id !== tarefaId),
        }
    }

    async function handleKanbanMove({
                                        tarefaId,
                                        statusOrigem,
                                        statusDestino,
                                    }: {
        tarefaId: number
        statusOrigem: TarefaStatus
        statusDestino: TarefaStatus
    }) {
        const snapshot = tarefasKanban

        setMovingTaskId(tarefaId)
        setTarefasKanban(moverItemKanban(snapshot, tarefaId, statusOrigem, statusDestino))

        try {
            await atualizarStatusTarefa({
                tarefaId,
                status: statusDestino,
            })

            toast.success("Status da tarefa atualizado.")
        } catch (error) {
            setTarefasKanban(snapshot)
            toast.error(getErrorMessage(error, "Nao foi possivel mover a tarefa."))
        } finally {
            setMovingTaskId(null)
        }
    }

    const resumo = useMemo(() => {
        if (viewMode === "kanban") {
            return {
                pendente: tarefasKanban.pendente.length,
                emAndamento: tarefasKanban["em andamento"].length,
                revisao: tarefasKanban.revisao.length,
                finalizado: tarefasKanban.finalizado.length,
            }
        }

        return {
            pendente: tarefasGrade.filter((item) => item.status === "pendente").length,
            emAndamento: tarefasGrade.filter((item) => item.status === "em andamento").length,
            revisao: tarefasGrade.filter((item) => item.status === "revisao").length,
            finalizado: tarefasGrade.filter((item) => item.status === "finalizado").length,
        }
    }, [tarefasGrade, tarefasKanban, viewMode])

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Central de tarefas</h1>
                    <p className="text-sm text-muted-foreground">Gerencie e acompanhe as tarefas da equipe.</p>
                </div>
                <CriarTarefaModal onCreated={() => carregarTarefas({silent: true})}/>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <span className="size-2 rounded-full bg-orange-500"/>
                            Pendentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold">{resumo.pendente}</CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <span className="size-2 rounded-full bg-blue-500"/>
                            Em andamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold">{resumo.emAndamento}</CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <span className="size-2 rounded-full bg-violet-500"/>
                            Em revisao
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold">{resumo.revisao}</CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <span className="size-2 rounded-full bg-emerald-500"/>
                            Finalizadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold">{resumo.finalizado}</CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold">{total}</CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="space-y-3 p-4">
                    <div className="grid gap-2 lg:grid-cols-3">
                        <div className="flex gap-2 lg:col-span-2">
                            <Input
                                placeholder="Buscar por nome ou descricao"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">

                            <Button
                                type="button"
                                variant={viewMode === "kanban" ? "default" : "outline"}
                                onClick={() => handleViewChange("kanban")}
                                disabled={isRefreshing || isLoading}
                            >
                                <Columns3Icon className="size-4"/>
                                Kanban
                            </Button>
                            <Button
                                type="button"
                                variant={viewMode === "grade" ? "default" : "outline"}
                                onClick={() => handleViewChange("grade")}
                                disabled={isRefreshing || isLoading}
                            >
                                <LayoutGridIcon className="size-4"/>
                                Grade
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                        <Select value={projetoFilter} onValueChange={(value) => setProjetoFilter(value ?? "todos")}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Todos os projetos"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos os projetos</SelectItem>
                                {projetos.map((projeto) => (
                                    <SelectItem key={projeto.id} value={String(projeto.id)}>
                                        {projeto.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter}
                                onValueChange={(value) => setStatusFilter((value as StatusFilter) ?? "todos")}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Todos os status"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos os status</SelectItem>
                                <SelectItem value="pendente">Pendente</SelectItem>
                                <SelectItem value="em andamento">Em andamento</SelectItem>
                                <SelectItem value="revisao">Em revisao</SelectItem>
                                <SelectItem value="finalizado">Finalizado</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={prioridadeFilter}
                                onValueChange={(value) => setPrioridadeFilter((value as PrioridadeFilter) ?? "todos")}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Todas as prioridades"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todas as prioridades</SelectItem>
                                <SelectItem value="baixa">Baixa</SelectItem>
                                <SelectItem value="media">Media</SelectItem>
                                <SelectItem value="alta">Alta</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={responsavelFilter}
                                onValueChange={(value) => setResponsavelFilter(value ?? "todos")}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Todos os responsaveis"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos os responsaveis</SelectItem>
                                {responsaveis.map((responsavel) => (
                                    <SelectItem key={responsavel.id} value={String(responsavel.id)}>
                                        {responsavel.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Popover>
                            <PopoverTrigger
                                render={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        data-empty={!agendamentoFilter}
                                        className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                                    >
                                        {agendamentoFilter ? format(agendamentoFilter, "dd/MM/yyyy") :
                                            <span>Agendamento</span>}
                                        <ChevronDownIcon data-icon="inline-end"/>
                                    </Button>
                                }
                            />
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    locale={ptBR}
                                    selected={agendamentoFilter}
                                    onSelect={setAgendamentoFilter}
                                    defaultMonth={agendamentoFilter}
                                />
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger
                                render={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        data-empty={!inicioFilter}
                                        className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                                    >
                                        {inicioFilter ? format(inicioFilter, "dd/MM/yyyy") : <span>Inicio</span>}
                                        <ChevronDownIcon data-icon="inline-end"/>
                                    </Button>
                                }
                            />
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    locale={ptBR}
                                    selected={inicioFilter}
                                    onSelect={setInicioFilter}
                                    defaultMonth={inicioFilter}
                                />
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger
                                render={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        data-empty={!fimFilter}
                                        className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                                    >
                                        {fimFilter ? format(fimFilter, "dd/MM/yyyy") : <span>Fim</span>}
                                        <ChevronDownIcon data-icon="inline-end"/>
                                    </Button>
                                }
                            />
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    locale={ptBR}
                                    selected={fimFilter}
                                    onSelect={setFimFilter}
                                    defaultMonth={fimFilter}
                                />
                            </PopoverContent>
                        </Popover>



                    </div>

                    <div className={'flex justify-end'}>
                        <Button type="button" variant="outline" onClick={handleLimparFiltros} disabled={isRefreshing || isLoading}>
                            Limpar filtros
                        </Button>
                        <Button type="button" onClick={handleBuscar} disabled={isRefreshing || isLoading}>
                            <SearchIcon className="size-4"/>
                            Buscar
                        </Button>
                    </div>


                    <p className="text-sm text-muted-foreground">{total} tarefas encontradas</p>
                </CardContent>
            </Card>

            {isLoading ? (
                <TarefasListSkeleton/>
            ) : viewMode === "grade" ? (
                <>
                    <TarefasGradeView tarefas={tarefasGrade}/>
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPage((value) => Math.max(1, value - 1))}
                            disabled={page === 1}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground">
              Pagina {page} de {lastPage}
            </span>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPage((value) => Math.min(lastPage, value + 1))}
                            disabled={page >= lastPage}
                        >
                            Proxima
                        </Button>
                    </div>
                </>
            ) : (
                <TarefasKanbanView
                    tarefas={tarefasKanban}
                    movingTaskId={movingTaskId}
                    onMove={handleKanbanMove}
                />
            )}
        </div>
    )
}
