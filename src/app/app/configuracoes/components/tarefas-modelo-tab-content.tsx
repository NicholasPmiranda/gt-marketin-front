"use client"

import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import {
  atualizarTarefaModeloConfig,
  criarTarefaModeloConfig,
  excluirTarefaModeloConfig,
  listarEtiquetasTodosConfig,
  listarTarefasModeloConfig,
  listarUsersTodosConfig,
} from "@/lib/configuracoes-api"
import type {
  EtiquetaConfigItem,
  TarefaModeloConfigItem,
  UserConfigItem,
} from "@/types/configuracoes"
import type { TarefaStatus } from "@/types/tarefas"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

type TarefaModeloFormData = {
  nome: string
  descricao: string
  status: TarefaStatus
  responsavelIds: number[]
  etiquetaIds: number[]
}

const STATUS_OPTIONS: Array<{ value: TarefaStatus; label: string }> = [
  { value: "pendente", label: "Pendente" },
  { value: "em andamento", label: "Em andamento" },
  { value: "revisao", label: "Em revisao" },
  { value: "finalizado", label: "Finalizado" },
]

function getStatusLabel(status: TarefaStatus) {
  return STATUS_OPTIONS.find((item) => item.value === status)?.label ?? "Pendente"
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

function ConfiguracoesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

function TarefaModeloCard({
  tarefaModelo,
  onEdit,
  onDelete,
  isDeleting,
}: {
  tarefaModelo: TarefaModeloConfigItem
  onEdit: (item: TarefaModeloConfigItem) => void
  onDelete: (item: TarefaModeloConfigItem) => void
  isDeleting: boolean
}) {
  const nomesResponsaveis = tarefaModelo.responsaveis.map((responsavel) => responsavel.name)
  const nomesEtiquetas = tarefaModelo.etiquetas.map((etiqueta) => etiqueta.nome)

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base">{tarefaModelo.nome}</CardTitle>
          <CardDescription>{tarefaModelo.descricao || "Sem descricao"}</CardDescription>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{getStatusLabel(tarefaModelo.status)}</Badge>
          {nomesResponsaveis.length > 0 ? (
            <Badge variant="outline">{nomesResponsaveis.join(", ")}</Badge>
          ) : (
            <Badge variant="outline">Sem responsavel</Badge>
          )}
          {nomesEtiquetas.length > 0 ? (
            <Badge variant="outline">{nomesEtiquetas.join(", ")}</Badge>
          ) : (
            <Badge variant="outline">Sem etiqueta</Badge>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onEdit(tarefaModelo)}>
            <PencilIcon className="size-4" />
            Editar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete(tarefaModelo)}
            disabled={isDeleting}
            aria-disabled={isDeleting}
          >
            <Trash2Icon className="size-4 text-destructive" />
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}

export function TarefasModeloTabContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tarefasModelo, setTarefasModelo] = useState<TarefaModeloConfigItem[]>([])
  const [responsaveis, setResponsaveis] = useState<UserConfigItem[]>([])
  const [etiquetas, setEtiquetas] = useState<EtiquetaConfigItem[]>([])
  const [isModalCriacaoOpen, setIsModalCriacaoOpen] = useState(false)
  const [isModalEdicaoOpen, setIsModalEdicaoOpen] = useState(false)
  const [tarefaModeloSelecionada, setTarefaModeloSelecionada] =
    useState<TarefaModeloConfigItem | null>(null)
  const [deletingTarefaModeloId, setDeletingTarefaModeloId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [tarefaModeloParaExcluir, setTarefaModeloParaExcluir] =
    useState<TarefaModeloConfigItem | null>(null)

  const {
    register: registerTarefaModelo,
    handleSubmit: handleSubmitTarefaModelo,
    control: controlTarefaModelo,
    formState: {
      errors: tarefaModeloErrors,
      isSubmitting: isSubmittingTarefaModelo,
    },
    reset: resetTarefaModelo,
  } = useForm<TarefaModeloFormData>({
    defaultValues: {
      nome: "",
      descricao: "",
      status: "pendente",
      responsavelIds: [],
      etiquetaIds: [],
    },
  })

  const {
    register: registerTarefaModeloEdit,
    handleSubmit: handleSubmitTarefaModeloEdit,
    control: controlTarefaModeloEdit,
    formState: {
      errors: tarefaModeloEditErrors,
      isSubmitting: isSubmittingTarefaModeloEdit,
    },
    reset: resetTarefaModeloEdit,
  } = useForm<TarefaModeloFormData>({
    defaultValues: {
      nome: "",
      descricao: "",
      status: "pendente",
      responsavelIds: [],
      etiquetaIds: [],
    },
  })

  async function carregarDados() {
    setIsLoading(true)
    try {
      const [listaTarefasModelo, listaResponsaveis, listaEtiquetas] = await Promise.all([
        listarTarefasModeloConfig(),
        listarUsersTodosConfig(),
        listarEtiquetasTodosConfig(),
      ])

      setTarefasModelo(listaTarefasModelo)
      setResponsaveis(listaResponsaveis)
      setEtiquetas(listaEtiquetas)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel carregar as tarefas modelo."))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void carregarDados()
  }, [])

  const tarefasModeloFiltradas = useMemo(() => {
    const query = search.toLowerCase()

    return tarefasModelo.filter((item) => {
      const nome = item.nome.toLowerCase()
      const descricao = (item.descricao ?? "").toLowerCase()
      const status = item.status.toLowerCase()
      const nomesResponsaveis = item.responsaveis
        .map((responsavel) => responsavel.name)
        .join(" ")
        .toLowerCase()
      const nomesEtiquetas = item.etiquetas
        .map((etiqueta) => etiqueta.nome)
        .join(" ")
        .toLowerCase()

      return (
        nome.includes(query) ||
        descricao.includes(query) ||
        status.includes(query) ||
        nomesResponsaveis.includes(query) ||
        nomesEtiquetas.includes(query)
      )
    })
  }, [search, tarefasModelo])

  async function onSubmitTarefaModelo(values: TarefaModeloFormData) {
    try {
      const novaTarefaModelo = await criarTarefaModeloConfig({
        nome: values.nome,
        descricao: values.descricao || undefined,
        status: values.status,
        responsavel_ids: values.responsavelIds,
        etiqueta_ids: values.etiquetaIds.length > 0 ? values.etiquetaIds : undefined,
      })

      setTarefasModelo((oldState) => [novaTarefaModelo, ...oldState])
      setIsModalCriacaoOpen(false)
      resetTarefaModelo()
      toast.success("Tarefa modelo cadastrada com sucesso.")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel cadastrar a tarefa modelo."))
    }
  }

  async function onSubmitTarefaModeloEdicao(values: TarefaModeloFormData) {
    if (!tarefaModeloSelecionada) {
      return
    }

    try {
      const tarefaModeloAtualizada = await atualizarTarefaModeloConfig(
        tarefaModeloSelecionada.id,
        {
          nome: values.nome,
          descricao: values.descricao || undefined,
          status: values.status,
          responsavel_ids: values.responsavelIds,
          etiqueta_ids: values.etiquetaIds.length > 0 ? values.etiquetaIds : undefined,
        }
      )

      setTarefasModelo((oldState) =>
        oldState.map((item) =>
          item.id === tarefaModeloAtualizada.id ? tarefaModeloAtualizada : item
        )
      )
      setTarefaModeloSelecionada(null)
      setIsModalEdicaoOpen(false)
      resetTarefaModeloEdit()
      toast.success("Tarefa modelo atualizada com sucesso.")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel atualizar a tarefa modelo."))
    }
  }

  function abrirModalEdicao(item: TarefaModeloConfigItem) {
    setTarefaModeloSelecionada(item)
    resetTarefaModeloEdit({
      nome: item.nome,
      descricao: item.descricao ?? "",
      status: item.status,
      responsavelIds: item.responsaveis.map((responsavel) => responsavel.id),
      etiquetaIds: item.etiquetas.map((etiqueta) => etiqueta.id),
    })
    setIsModalEdicaoOpen(true)
  }

  function solicitarExclusao(item: TarefaModeloConfigItem) {
    setTarefaModeloParaExcluir(item)
    setIsDeleteDialogOpen(true)
  }

  async function confirmarExclusao() {
    if (!tarefaModeloParaExcluir) {
      return
    }

    setDeletingTarefaModeloId(tarefaModeloParaExcluir.id)
    try {
      await excluirTarefaModeloConfig(tarefaModeloParaExcluir.id)
      setTarefasModelo((oldState) =>
        oldState.filter((item) => item.id !== tarefaModeloParaExcluir.id)
      )
      setIsDeleteDialogOpen(false)
      setTarefaModeloParaExcluir(null)
      toast.success("Tarefa modelo excluida com sucesso.")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel excluir a tarefa modelo."))
    } finally {
      setDeletingTarefaModeloId(null)
    }
  }

  return (
    <TabsContent value="tarefas-modelo" className="w-full">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Tarefa modelo</CardTitle>
            <CardDescription>Gerencie templates de tarefas com status, responsaveis e etiquetas</CardDescription>
          </div>

          <Dialog open={isModalCriacaoOpen} onOpenChange={setIsModalCriacaoOpen}>
            <DialogTrigger className={buttonVariants()}>
              <PlusIcon />
              Adicionar tarefa modelo
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar tarefa modelo</DialogTitle>
                <DialogDescription>
                  Informe os dados para criar um novo modelo de tarefa.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitTarefaModelo(onSubmitTarefaModelo)}>
                <div className="p-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="nome-tarefa-modelo">Nome</FieldLabel>
                      <Input
                        id="nome-tarefa-modelo"
                        placeholder="Digite o nome da tarefa modelo"
                        {...registerTarefaModelo("nome", {
                          required: "Nome e obrigatorio.",
                        })}
                      />
                      <FieldError>{tarefaModeloErrors.nome?.message}</FieldError>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="descricao-tarefa-modelo">Descricao</FieldLabel>
                      <Textarea
                        id="descricao-tarefa-modelo"
                        rows={4}
                        placeholder="Digite a descricao da tarefa modelo"
                        {...registerTarefaModelo("descricao")}
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Status</FieldLabel>
                      <Controller
                        name="status"
                        control={controlTarefaModelo}
                        rules={{ required: "Status e obrigatorio." }}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError>{tarefaModeloErrors.status?.message}</FieldError>
                    </Field>

                    <Field>
                      <FieldLabel>Responsaveis</FieldLabel>
                      <Controller
                        name="responsavelIds"
                        control={controlTarefaModelo}
                        rules={{
                          validate: (value) =>
                            value.length > 0 || "Selecione ao menos um responsavel.",
                        }}
                        render={({ field }) => {
                          const responsaveisSelecionados = responsaveis.filter((responsavel) =>
                            field.value.includes(responsavel.id)
                          )

                          return (
                            <Popover>
                              <PopoverTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-start"
                                  >
                                    {responsaveisSelecionados.length > 0
                                      ? responsaveisSelecionados
                                          .map((responsavel) => responsavel.nome)
                                          .join(", ")
                                      : "Selecione os responsaveis"}
                                  </Button>
                                }
                              />
                              <PopoverContent className="w-[var(--anchor-width)] p-0">
                                <div className="grid max-h-56 gap-2 overflow-y-auto p-3">
                                  {responsaveis.map((responsavel) => {
                                    const isChecked = field.value.includes(responsavel.id)

                                    return (
                                      <label
                                        key={responsavel.id}
                                        className="flex items-center gap-2 text-sm"
                                      >
                                        <Checkbox
                                          checked={isChecked}
                                          onCheckedChange={(value) => {
                                            if (value === true) {
                                              field.onChange([
                                                ...field.value,
                                                responsavel.id,
                                              ])
                                              return
                                            }

                                            field.onChange(
                                              field.value.filter(
                                                (item: number) => item !== responsavel.id
                                              )
                                            )
                                          }}
                                        />
                                        {responsavel.nome}
                                      </label>
                                    )
                                  })}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )
                        }}
                      />
                      <FieldDescription>
                        Escolha os responsaveis padrao para este modelo.
                      </FieldDescription>
                      <FieldError>{tarefaModeloErrors.responsavelIds?.message}</FieldError>
                    </Field>

                    <Field>
                      <FieldLabel>Etiquetas</FieldLabel>
                      <Controller
                        name="etiquetaIds"
                        control={controlTarefaModelo}
                        render={({ field }) => {
                          const etiquetasSelecionadas = etiquetas.filter((etiqueta) =>
                            field.value.includes(etiqueta.id)
                          )

                          return (
                            <Popover>
                              <PopoverTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-start"
                                  >
                                    {etiquetasSelecionadas.length > 0
                                      ? etiquetasSelecionadas
                                          .map((etiqueta) => etiqueta.nome)
                                          .join(", ")
                                      : "Selecione as etiquetas"}
                                  </Button>
                                }
                              />
                              <PopoverContent className="w-[var(--anchor-width)] p-0">
                                <div className="grid max-h-56 gap-2 overflow-y-auto p-3">
                                  {etiquetas.map((etiqueta) => {
                                    const isChecked = field.value.includes(etiqueta.id)

                                    return (
                                      <label
                                        key={etiqueta.id}
                                        className="flex items-center gap-2 text-sm"
                                      >
                                        <Checkbox
                                          checked={isChecked}
                                          onCheckedChange={(value) => {
                                            if (value === true) {
                                              field.onChange([...field.value, etiqueta.id])
                                              return
                                            }

                                            field.onChange(
                                              field.value.filter(
                                                (item: number) => item !== etiqueta.id
                                              )
                                            )
                                          }}
                                        />
                                        {etiqueta.nome}
                                      </label>
                                    )
                                  })}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )
                        }}
                      />
                    </Field>
                  </FieldGroup>
                </div>
                <DialogFooter>
                  <DialogClose render={<Button type="button" variant="outline" />}>
                    Cancelar
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={isSubmittingTarefaModelo}
                    aria-disabled={isSubmittingTarefaModelo}
                  >
                    {isSubmittingTarefaModelo ? "Salvando..." : "Salvar tarefa modelo"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isModalEdicaoOpen} onOpenChange={setIsModalEdicaoOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar tarefa modelo</DialogTitle>
                <DialogDescription>
                  Atualize os dados da tarefa modelo selecionada.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitTarefaModeloEdit(onSubmitTarefaModeloEdicao)}>
                <div className="p-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="nome-tarefa-modelo-edicao">Nome</FieldLabel>
                      <Input
                        id="nome-tarefa-modelo-edicao"
                        placeholder="Digite o nome da tarefa modelo"
                        {...registerTarefaModeloEdit("nome", {
                          required: "Nome e obrigatorio.",
                        })}
                      />
                      <FieldError>{tarefaModeloEditErrors.nome?.message}</FieldError>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="descricao-tarefa-modelo-edicao">Descricao</FieldLabel>
                      <Textarea
                        id="descricao-tarefa-modelo-edicao"
                        rows={4}
                        placeholder="Digite a descricao da tarefa modelo"
                        {...registerTarefaModeloEdit("descricao")}
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Status</FieldLabel>
                      <Controller
                        name="status"
                        control={controlTarefaModeloEdit}
                        rules={{ required: "Status e obrigatorio." }}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError>{tarefaModeloEditErrors.status?.message}</FieldError>
                    </Field>

                    <Field>
                      <FieldLabel>Responsaveis</FieldLabel>
                      <Controller
                        name="responsavelIds"
                        control={controlTarefaModeloEdit}
                        rules={{
                          validate: (value) =>
                            value.length > 0 || "Selecione ao menos um responsavel.",
                        }}
                        render={({ field }) => {
                          const responsaveisSelecionados = responsaveis.filter((responsavel) =>
                            field.value.includes(responsavel.id)
                          )

                          return (
                            <Popover>
                              <PopoverTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-start"
                                  >
                                    {responsaveisSelecionados.length > 0
                                      ? responsaveisSelecionados
                                          .map((responsavel) => responsavel.nome)
                                          .join(", ")
                                      : "Selecione os responsaveis"}
                                  </Button>
                                }
                              />
                              <PopoverContent className="w-[var(--anchor-width)] p-0">
                                <div className="grid max-h-56 gap-2 overflow-y-auto p-3">
                                  {responsaveis.map((responsavel) => {
                                    const isChecked = field.value.includes(responsavel.id)

                                    return (
                                      <label
                                        key={responsavel.id}
                                        className="flex items-center gap-2 text-sm"
                                      >
                                        <Checkbox
                                          checked={isChecked}
                                          onCheckedChange={(value) => {
                                            if (value === true) {
                                              field.onChange([
                                                ...field.value,
                                                responsavel.id,
                                              ])
                                              return
                                            }

                                            field.onChange(
                                              field.value.filter(
                                                (item: number) => item !== responsavel.id
                                              )
                                            )
                                          }}
                                        />
                                        {responsavel.nome}
                                      </label>
                                    )
                                  })}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )
                        }}
                      />
                      <FieldDescription>
                        Escolha os responsaveis padrao para este modelo.
                      </FieldDescription>
                      <FieldError>{tarefaModeloEditErrors.responsavelIds?.message}</FieldError>
                    </Field>

                    <Field>
                      <FieldLabel>Etiquetas</FieldLabel>
                      <Controller
                        name="etiquetaIds"
                        control={controlTarefaModeloEdit}
                        render={({ field }) => {
                          const etiquetasSelecionadas = etiquetas.filter((etiqueta) =>
                            field.value.includes(etiqueta.id)
                          )

                          return (
                            <Popover>
                              <PopoverTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-start"
                                  >
                                    {etiquetasSelecionadas.length > 0
                                      ? etiquetasSelecionadas
                                          .map((etiqueta) => etiqueta.nome)
                                          .join(", ")
                                      : "Selecione as etiquetas"}
                                  </Button>
                                }
                              />
                              <PopoverContent className="w-[var(--anchor-width)] p-0">
                                <div className="grid max-h-56 gap-2 overflow-y-auto p-3">
                                  {etiquetas.map((etiqueta) => {
                                    const isChecked = field.value.includes(etiqueta.id)

                                    return (
                                      <label
                                        key={etiqueta.id}
                                        className="flex items-center gap-2 text-sm"
                                      >
                                        <Checkbox
                                          checked={isChecked}
                                          onCheckedChange={(value) => {
                                            if (value === true) {
                                              field.onChange([...field.value, etiqueta.id])
                                              return
                                            }

                                            field.onChange(
                                              field.value.filter(
                                                (item: number) => item !== etiqueta.id
                                              )
                                            )
                                          }}
                                        />
                                        {etiqueta.nome}
                                      </label>
                                    )
                                  })}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )
                        }}
                      />
                    </Field>
                  </FieldGroup>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isSubmittingTarefaModeloEdit}
                    aria-disabled={isSubmittingTarefaModeloEdit}
                  >
                    {isSubmittingTarefaModeloEdit ? "Salvando..." : "Salvar alteracoes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefa modelo"
              className="pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {isLoading ? (
            <ConfiguracoesSkeleton />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tarefasModeloFiltradas.map((item) => (
                <TarefaModeloCard
                  key={item.id}
                  tarefaModelo={item}
                  onEdit={abrirModalEdicao}
                  onDelete={solicitarExclusao}
                  isDeleting={deletingTarefaModeloId === item.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa modelo</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao vai excluir a tarefa modelo {tarefaModeloParaExcluir?.nome}. Deseja
              continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button type="button" variant="outline" />}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              render={<Button type="button" variant="destructive" />}
              onClick={confirmarExclusao}
              disabled={deletingTarefaModeloId !== null}
            >
              {deletingTarefaModeloId !== null ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TabsContent>
  )
}
