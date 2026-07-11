"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { criarProjeto, listarGruposWhatsappProjeto, listarUsuariosEquipe } from "@/lib/projetos-api"
import type { ProjetoEquipeItem, ProjetoWhatsappGrupoItem } from "@/types/projetos"
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
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type CreateProjetoFormData = {
  nome: string
  descricao: string
  accountId: string
  ativo: boolean
  contatoGrupo: string
  equipeIds: number[]
}

const SEM_GRUPO_VALUE = "sem-grupo"

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

export function CriarProjetoModal({ onCreated }: { onCreated: () => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingEquipe, setIsLoadingEquipe] = useState(false)
  const [isLoadingGrupos, setIsLoadingGrupos] = useState(false)
  const [isGrupoComboboxOpen, setIsGrupoComboboxOpen] = useState(false)
  const [grupoBusca, setGrupoBusca] = useState("")
  const [equipe, setEquipe] = useState<ProjetoEquipeItem[]>([])
  const [gruposWhatsapp, setGruposWhatsapp] = useState<ProjetoWhatsappGrupoItem[]>([])

  const form = useForm<CreateProjetoFormData>({
    defaultValues: {
      nome: "",
      descricao: "",
      accountId: "",
      ativo: true,
      contatoGrupo: SEM_GRUPO_VALUE,
      equipeIds: [],
    },
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    async function carregarEquipe() {
      setIsLoadingEquipe(true)
      setIsLoadingGrupos(true)

      try {
        const [equipeResponse, gruposResponse] = await Promise.allSettled([
          listarUsuariosEquipe(),
          listarGruposWhatsappProjeto(),
        ])

        if (equipeResponse.status === "fulfilled") {
          setEquipe(equipeResponse.value)
        } else {
          setEquipe([])
          toast.error(getErrorMessage(equipeResponse.reason, "Nao foi possivel carregar a equipe."))
        }

        if (gruposResponse.status === "fulfilled") {
          setGruposWhatsapp(gruposResponse.value)
        } else {
          setGruposWhatsapp([])
          toast.error(getErrorMessage(gruposResponse.reason, "Nao foi possivel carregar os grupos do WhatsApp."))
        }
      } finally {
        setIsLoadingEquipe(false)
        setIsLoadingGrupos(false)
      }
    }

    void carregarEquipe()
  }, [isOpen])

  const gruposFiltrados = useMemo(() => {
    const termo = grupoBusca.trim().toLowerCase()

    if (!termo) {
      return gruposWhatsapp
    }

    return gruposWhatsapp.filter((grupo) => grupo.nome.toLowerCase().includes(termo))
  }, [grupoBusca, gruposWhatsapp])

  async function onSubmit(values: CreateProjetoFormData) {
    try {
      setIsSaving(true)

      await criarProjeto({
        nome: values.nome,
        descricao: values.descricao,
        account_id: values.accountId,
        ativo: values.ativo,
        contato_grupo: values.contatoGrupo === SEM_GRUPO_VALUE ? undefined : values.contatoGrupo,
        equipe_ids: values.equipeIds,
      })

      toast.success("Projeto criado com sucesso.")
      setIsOpen(false)
      form.reset()
      await onCreated()
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel criar o projeto."))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button type="button">Criar projeto</Button>} />
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Novo projeto</DialogTitle>
          <DialogDescription>Preencha os dados para cadastrar um novo projeto.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="px-4">
            <Field>
              <FieldLabel htmlFor="projeto-nome">Nome</FieldLabel>
              <Input
                id="projeto-nome"
                placeholder="Digite o nome do projeto"
                {...form.register("nome", {
                  required: "O nome do projeto e obrigatorio.",
                })}
              />
              <FieldError errors={[form.formState.errors.nome]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="projeto-descricao">Descricao</FieldLabel>
              <Input
                id="projeto-descricao"
                placeholder="Digite a descricao do projeto"
                {...form.register("descricao")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="projeto-account-id">Account ID</FieldLabel>
              <Input
                id="projeto-account-id"
                placeholder="Digite o account ID"
                {...form.register("accountId")}
              />
            </Field>

            <Field>
              <FieldLabel>Grupo do WhatsApp</FieldLabel>
              <Controller
                control={form.control}
                name="contatoGrupo"
                render={({ field }) => (
                  <Popover open={isGrupoComboboxOpen} onOpenChange={setIsGrupoComboboxOpen}>
                    <PopoverTrigger
                      render={
                        <Button type="button" variant="outline" className="w-full justify-between" disabled={isLoadingGrupos}>
                          <span className="truncate">
                            {field.value === SEM_GRUPO_VALUE
                              ? "Sem grupo"
                              : gruposWhatsapp.find((grupo) => grupo.jid === field.value)?.nome ?? "Selecione um grupo"}
                          </span>
                          <ChevronsUpDownIcon data-icon="inline-end" />
                        </Button>
                      }
                    />
                    <PopoverContent className="w-[var(--anchor-width)] p-2">
                      <FieldGroup className="gap-2">
                        <Input
                          placeholder="Buscar grupo do WhatsApp"
                          value={grupoBusca}
                          onChange={(event) => setGrupoBusca(event.target.value)}
                        />
                        <div className="max-h-56 overflow-y-auto">
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              field.onChange(SEM_GRUPO_VALUE)
                              setIsGrupoComboboxOpen(false)
                            }}
                          >
                            <CheckIcon className={cn(field.value === SEM_GRUPO_VALUE ? "opacity-100" : "opacity-0")} />
                            Sem grupo
                          </Button>
                          {gruposFiltrados.map((grupo) => (
                            <Button
                              key={grupo.jid}
                              type="button"
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => {
                                field.onChange(grupo.jid)
                                setIsGrupoComboboxOpen(false)
                              }}
                            >
                              <CheckIcon className={cn(field.value === grupo.jid ? "opacity-100" : "opacity-0")} />
                              {grupo.nome}
                            </Button>
                          ))}
                        </div>
                      </FieldGroup>
                    </PopoverContent>
                  </Popover>
                )}
              />
            </Field>

            <Field>
              <FieldLabel>Equipe</FieldLabel>
              <Controller
                control={form.control}
                name="equipeIds"
                render={({ field }) => {
                  const selecionados = equipe.filter((membro) =>
                    field.value.includes(membro.id)
                  )

                  return (
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button type="button" variant="outline" className="w-full justify-start">
                            {selecionados.length > 0
                              ? selecionados.map((membro) => membro.name).join(", ")
                              : "Selecione a equipe"}
                          </Button>
                        }
                      />
                      <PopoverContent className="w-[var(--anchor-width)] p-0">
                        <div className="grid max-h-56 gap-2 overflow-y-auto p-3">
                          {isLoadingEquipe ? (
                            <p className="text-sm text-muted-foreground">Carregando equipe...</p>
                          ) : (
                            equipe.map((membro) => {
                              const isChecked = field.value.includes(membro.id)

                              return (
                                <label key={membro.id} className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(value) => {
                                      if (value === true) {
                                        field.onChange([...field.value, membro.id])
                                        return
                                      }

                                      field.onChange(
                                        field.value.filter((item: number) => item !== membro.id)
                                      )
                                    }}
                                  />
                                  {membro.name}
                                </label>
                              )
                            })
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )
                }}
              />
            </Field>

            <Field>
              <div className="flex items-center gap-2">
                <Controller
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(value) => field.onChange(value === true)}
                    />
                  )}
                />
                <FieldLabel>Projeto ativo</FieldLabel>
              </div>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
