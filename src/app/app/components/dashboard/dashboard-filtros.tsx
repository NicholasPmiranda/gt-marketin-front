"use client"

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { AxiosError } from "axios"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { listarProjetosTodosDash, listarUsersTodosDash } from "@/lib/dash-api"
import { cn } from "@/lib/utils"
import type { DashFiltros, DashOpcaoFiltro } from "@/types/dash"

type DashboardFiltrosProps = {
  filtros: DashFiltros
  setFiltros: Dispatch<SetStateAction<DashFiltros>>
}

type ComboboxFiltroProps = {
  id: string
  label: string
  placeholder: string
  valor?: number
  opcoes: DashOpcaoFiltro[]
  carregando: boolean
  onSelecionar: (valor?: number) => void
}

type ComboboxMultiFiltroProps = {
  id: string
  label: string
  placeholder: string
  valores: number[]
  opcoes: DashOpcaoFiltro[]
  carregando: boolean
  onSelecionar: (valores: number[]) => void
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message

    if (typeof message === "string" && message.trim().length > 0) {
      return message
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallback
}

function ComboboxFiltro({
  id,
  label,
  placeholder,
  valor,
  opcoes,
  carregando,
  onSelecionar,
}: ComboboxFiltroProps) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState("")

  const itemSelecionado = useMemo(
    () => opcoes.find((opcao) => opcao.id === valor),
    [opcoes, valor]
  )

  const opcoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    if (!termo) {
      return opcoes
    }

    return opcoes.filter((opcao) => opcao.nome.toLowerCase().includes(termo))
  }, [busca, opcoes])

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              className="w-full justify-between"
              disabled={carregando}
            >
              {itemSelecionado?.nome ?? placeholder}
              <ChevronsUpDownIcon data-icon="inline-end" />
            </Button>
          }
        />
        <PopoverContent className="w-[var(--anchor-width)] p-2">
          <FieldGroup className="gap-2">
            <Input
              placeholder={`Buscar ${label.toLowerCase()}`}
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
            <div className="max-h-56 overflow-y-auto">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onSelecionar(undefined)
                  setAberto(false)
                }}
              >
                <CheckIcon className={cn(!valor && "opacity-100", valor && "opacity-0")} />
                Todos
              </Button>
              {opcoesFiltradas.map((opcao) => (
                <Button
                  key={opcao.id}
                  type="button"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    onSelecionar(opcao.id)
                    setAberto(false)
                  }}
                >
                  <CheckIcon className={cn(valor === opcao.id && "opacity-100", valor !== opcao.id && "opacity-0")} />
                  {opcao.nome}
                </Button>
              ))}
            </div>
          </FieldGroup>
        </PopoverContent>
      </Popover>
    </Field>
  )
}

function ComboboxMultiFiltro({
  id,
  label,
  placeholder,
  valores,
  opcoes,
  carregando,
  onSelecionar,
}: ComboboxMultiFiltroProps) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState("")

  const opcoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    if (!termo) {
      return opcoes
    }

    return opcoes.filter((opcao) => opcao.nome.toLowerCase().includes(termo))
  }, [busca, opcoes])

  const textoSelecionado = useMemo(() => {
    if (valores.length === 0) {
      return placeholder
    }

    const nomes = opcoes
      .filter((opcao) => valores.includes(opcao.id))
      .map((opcao) => opcao.nome)

    return nomes.join(", ")
  }, [opcoes, placeholder, valores])

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              className="w-full justify-between"
              disabled={carregando}
            >
              <span className="truncate">{textoSelecionado}</span>
              <ChevronsUpDownIcon data-icon="inline-end" />
            </Button>
          }
        />
        <PopoverContent className="w-[var(--anchor-width)] p-2">
          <FieldGroup className="gap-2">
            <Input
              placeholder={`Buscar ${label.toLowerCase()}`}
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />

            <div className="max-h-56 overflow-y-auto">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
                onClick={() => onSelecionar([])}
              >
                Limpar selecao
              </Button>

              {opcoesFiltradas.map((opcao) => {
                const selecionado = valores.includes(opcao.id)

                return (
                  <label key={opcao.id} className="flex items-center gap-2 px-2 py-1.5 text-sm">
                    <Checkbox
                      checked={selecionado}
                      onCheckedChange={(value) => {
                        if (value === true) {
                          onSelecionar([...valores, opcao.id])
                          return
                        }

                        onSelecionar(valores.filter((item) => item !== opcao.id))
                      }}
                    />
                    <span>{opcao.nome}</span>
                  </label>
                )
              })}
            </div>
          </FieldGroup>
        </PopoverContent>
      </Popover>
    </Field>
  )
}

export function DashboardFiltros({ filtros, setFiltros }: DashboardFiltrosProps) {
  const [projetos, setProjetos] = useState<DashOpcaoFiltro[]>([])
  const [users, setUsers] = useState<DashOpcaoFiltro[]>([])
  const [loadingOpcoes, setLoadingOpcoes] = useState(true)

  useEffect(() => {
    let mounted = true

    async function carregarOpcoes() {
      try {
        const [listaProjetos, listaUsers] = await Promise.all([
          listarProjetosTodosDash(),
          listarUsersTodosDash(),
        ])

        if (!mounted) {
          return
        }

        setProjetos(listaProjetos)
        setUsers(listaUsers)
      } catch (error) {
        toast.error(getErrorMessage(error, "Nao foi possivel carregar os filtros do dashboard."))
      } finally {
        if (mounted) {
          setLoadingOpcoes(false)
        }
      }
    }

    carregarOpcoes()

    return () => {
      mounted = false
    }
  }, [])

  function atualizarCampo<K extends keyof DashFiltros>(campo: K, valor: DashFiltros[K]) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  return (
    <FieldGroup className="grid grid-cols-1 gap-3 px-4 lg:grid-cols-4 lg:px-6">
      <ComboboxFiltro
        id="dashboard-projeto"
        label="Projeto"
        placeholder={loadingOpcoes ? "Carregando projetos..." : "Todos os projetos"}
        valor={filtros.projetoId}
        opcoes={projetos}
        carregando={loadingOpcoes}
        onSelecionar={(valor) => atualizarCampo("projetoId", valor)}
      />

      <ComboboxMultiFiltro
        id="dashboard-responsaveis"
        label="Responsaveis"
        placeholder={loadingOpcoes ? "Carregando responsaveis..." : "Todos os responsaveis"}
        valores={filtros.responsavelIds ?? []}
        opcoes={users}
        carregando={loadingOpcoes}
        onSelecionar={(valores) => atualizarCampo("responsavelIds", valores)}
      />

      <Field>
        <FieldLabel htmlFor="dashboard-data-inicio">Data inicio</FieldLabel>
        <Input
          id="dashboard-data-inicio"
          placeholder="Selecione a data inicial"
          type="date"
          value={filtros.dataInicio ?? ""}
          onChange={(event) => atualizarCampo("dataInicio", event.target.value || undefined)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="dashboard-data-fim">Data fim</FieldLabel>
        <Input
          id="dashboard-data-fim"
          placeholder="Selecione a data final"
          type="date"
          value={filtros.dataFim ?? ""}
          onChange={(event) => atualizarCampo("dataFim", event.target.value || undefined)}
        />
      </Field>
    </FieldGroup>
  )
}
