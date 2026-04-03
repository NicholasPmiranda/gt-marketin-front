"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronDownIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { listarEtiquetasConfig, listarUsersConfig } from "@/lib/configuracoes-api"
import { listarProjetos } from "@/lib/projetos-api"
import { criarTarefa } from "@/lib/tarefas-api"
import type { EtiquetaConfigItem, UserConfigItem } from "@/types/configuracoes"
import type { ProjetoItem } from "@/types/projetos"
import type { TarefaPrioridade, TarefaStatus } from "@/types/tarefas"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type CreateTarefaFormData = {
  projetoId: string
  nome: string
  descricao: string
  status: TarefaStatus
  prioridade: TarefaPrioridade
  agendamento: Date | undefined
  responsavelIds: number[]
  etiquetaIds: number[]
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

export function CriarTarefaModal({ onCreated }: { onCreated: () => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoadingDados, setIsLoadingDados] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [projetos, setProjetos] = useState<ProjetoItem[]>([])
  const [usuarios, setUsuarios] = useState<UserConfigItem[]>([])
  const [etiquetas, setEtiquetas] = useState<EtiquetaConfigItem[]>([])

  const form = useForm<CreateTarefaFormData>({
    defaultValues: {
      projetoId: "",
      nome: "",
      descricao: "",
      status: "pendente",
      prioridade: "baixo",
      agendamento: undefined,
      responsavelIds: [],
      etiquetaIds: [],
    },
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    async function carregarDadosModal() {
      try {
        setIsLoadingDados(true)
        const [projetosResponse, usuariosResponse, etiquetasResponse] = await Promise.all([
          listarProjetos({ page: 1 }),
          listarUsersConfig(),
          listarEtiquetasConfig(),
        ])

        setProjetos(projetosResponse.data)
        setUsuarios(usuariosResponse)
        setEtiquetas(etiquetasResponse)
      } catch (error) {
        toast.error(getErrorMessage(error, "Nao foi possivel carregar os dados do formulario."))
      } finally {
        setIsLoadingDados(false)
      }
    }

    void carregarDadosModal()
  }, [isOpen])

  async function onSubmit(values: CreateTarefaFormData) {
    try {
      setIsSaving(true)

      await criarTarefa({
        projeto_id: Number(values.projetoId),
        nome: values.nome,
        descricao: values.descricao,
        status: values.status,
        prioridade: values.prioridade,
        agendamento_inicio: values.agendamento ? format(values.agendamento, "yyyy-MM-dd") : undefined,
        responsavel_ids: values.responsavelIds,
        etiqueta_ids: values.etiquetaIds,
      })

      toast.success("Tarefa criada com sucesso.")
      form.reset({
        projetoId: "",
        nome: "",
        descricao: "",
        status: "pendente",
        prioridade: "baixo",
        agendamento: undefined,
        responsavelIds: [],
        etiquetaIds: [],
      })
      setIsOpen(false)
      await onCreated()
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel criar a tarefa."))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button type="button">Criar tarefa</Button>} />
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nova tarefa</DialogTitle>
          <DialogDescription>Preencha os dados para cadastrar uma nova tarefa.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="px-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field className="md:col-span-2">
                <FieldLabel htmlFor="tarefa-nome">Titulo</FieldLabel>
                <Input
                  id="tarefa-nome"
                  placeholder="Digite o titulo da tarefa"
                  {...form.register("nome", {
                    required: "Titulo e obrigatorio.",
                  })}
                />
                <FieldError errors={[form.formState.errors.nome]} />
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel htmlFor="tarefa-descricao">Descricao</FieldLabel>
                <Textarea
                  id="tarefa-descricao"
                  rows={4}
                  placeholder="Descreva a tarefa"
                  {...form.register("descricao")}
                />
              </Field>

              <Field>
                <FieldLabel>Projeto</FieldLabel>
                <Controller
                  name="projetoId"
                  control={form.control}
                  rules={{ required: "Projeto e obrigatorio." }}
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um projeto">
                          {projetos.find((projeto) => String(projeto.id) === field.value)?.nome}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {projetos.map((projeto) => (
                          <SelectItem key={projeto.id} value={String(projeto.id)}>
                            {projeto.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[form.formState.errors.projetoId]} />
              </Field>

              <Field>
                <FieldLabel>Status</FieldLabel>
                <Controller
                  name="status"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value ?? "pendente"} onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em andamento">Em andamento</SelectItem>
                        <SelectItem value="revisao">Em revisao</SelectItem>
                        <SelectItem value="finalizado">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel>Prioridade</FieldLabel>
                <Controller
                  name="prioridade"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value ?? "baixo"} onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixo">Baixo</SelectItem>
                        <SelectItem value="medio">Medio</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel>Agendamento</FieldLabel>
                <Controller
                  name="agendamento"
                  control={form.control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            data-empty={!field.value}
                            className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                          >
                            {field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione a data</span>}
                            <ChevronDownIcon data-icon="inline-end" />
                          </Button>
                        }
                      />
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          locale={ptBR}
                          selected={field.value}
                          onSelect={field.onChange}
                          defaultMonth={field.value}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel>Responsaveis</FieldLabel>
                <Controller
                  name="responsavelIds"
                  control={form.control}
                  rules={{
                    validate: (value) => value.length > 0 || "Selecione ao menos um responsavel.",
                  }}
                  render={({ field }) => {
                    const responsaveisSelecionados = usuarios.filter((usuario) =>
                      field.value.includes(usuario.id)
                    )

                    return (
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button type="button" variant="outline" className="w-full justify-start">
                              {responsaveisSelecionados.length > 0
                                ? responsaveisSelecionados.map((usuario) => usuario.nome).join(", ")
                                : "Selecione os responsaveis"}
                            </Button>
                          }
                        />
                        <PopoverContent className="w-[var(--anchor-width)] p-0">
                          <div className="grid max-h-56 gap-2 overflow-y-auto p-3">
                            {usuarios.map((usuario) => {
                              const isChecked = field.value.includes(usuario.id)

                              return (
                                <label key={usuario.id} className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(value) => {
                                      if (value === true) {
                                        field.onChange([...field.value, usuario.id])
                                        return
                                      }

                                      field.onChange(
                                        field.value.filter((item: number) => item !== usuario.id)
                                      )
                                    }}
                                  />
                                  {usuario.nome}
                                </label>
                              )
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )
                  }}
                />
                <FieldError errors={[form.formState.errors.responsavelIds]} />
              </Field>

              <Field>
                <FieldLabel>Etiquetas</FieldLabel>
                <Controller
                  name="etiquetaIds"
                  control={form.control}
                  render={({ field }) => {
                    const etiquetasSelecionadas = etiquetas.filter((etiqueta) =>
                      field.value.includes(etiqueta.id)
                    )

                    return (
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button type="button" variant="outline" className="w-full justify-start">
                              {etiquetasSelecionadas.length > 0
                                ? etiquetasSelecionadas.map((etiqueta) => etiqueta.nome).join(", ")
                                : "Selecione as etiquetas"}
                            </Button>
                          }
                        />
                        <PopoverContent className="w-[var(--anchor-width)] p-0">
                          <div className="grid max-h-56 gap-2 overflow-y-auto p-3">
                            {etiquetas.map((etiqueta) => {
                              const isChecked = field.value.includes(etiqueta.id)

                              return (
                                <label key={etiqueta.id} className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(value) => {
                                      if (value === true) {
                                        field.onChange([...field.value, etiqueta.id])
                                        return
                                      }

                                      field.onChange(
                                        field.value.filter((item: number) => item !== etiqueta.id)
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
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isSaving || isLoadingDados}>
              {isSaving ? "Salvando..." : "Salvar tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
