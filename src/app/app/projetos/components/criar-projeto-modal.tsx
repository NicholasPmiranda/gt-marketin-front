"use client"

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { criarProjeto, listarUsuariosEquipe } from "@/lib/projetos-api"
import type { ProjetoEquipeItem } from "@/types/projetos"
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

type CreateProjetoFormData = {
  nome: string
  descricao: string
  ativo: boolean
  equipeIds: number[]
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

export function CriarProjetoModal({ onCreated }: { onCreated: () => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingEquipe, setIsLoadingEquipe] = useState(false)
  const [equipe, setEquipe] = useState<ProjetoEquipeItem[]>([])

  const form = useForm<CreateProjetoFormData>({
    defaultValues: {
      nome: "",
      descricao: "",
      ativo: true,
      equipeIds: [],
    },
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    async function carregarEquipe() {
      try {
        setIsLoadingEquipe(true)
        const response = await listarUsuariosEquipe()
        setEquipe(response)
      } catch (error) {
        toast.error(getErrorMessage(error, "Nao foi possivel carregar a equipe."))
      } finally {
        setIsLoadingEquipe(false)
      }
    }

    void carregarEquipe()
  }, [isOpen])

  async function onSubmit(values: CreateProjetoFormData) {
    try {
      setIsSaving(true)

      await criarProjeto({
        nome: values.nome,
        descricao: values.descricao,
        ativo: values.ativo,
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
