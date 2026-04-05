"use client"

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { listarProjetos } from "@/lib/projetos-api"
import { converterTarefasAiPorIds } from "@/lib/reunioes-api"
import type { ProjetoItem } from "@/types/projetos"
import { Button } from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AprovarTarefasAiFormData = {
  projetoId: string
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

export function AprovarTarefasAiModal({
  tarefaAiIds,
  onSuccess,
}: {
  tarefaAiIds: number[]
  onSuccess?: () => Promise<void> | void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoadingProjetos, setIsLoadingProjetos] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [projetos, setProjetos] = useState<ProjetoItem[]>([])

  const form = useForm<AprovarTarefasAiFormData>({
    defaultValues: {
      projetoId: "",
    },
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    async function carregarProjetos() {
      try {
        setIsLoadingProjetos(true)
        const todosProjetos: ProjetoItem[] = []
        let paginaAtual = 1
        let ultimaPagina = 1

        do {
          const response = await listarProjetos({ page: paginaAtual })
          todosProjetos.push(...response.data)
          ultimaPagina = response.lastPage
          paginaAtual += 1
        } while (paginaAtual <= ultimaPagina)

        setProjetos(todosProjetos)
      } catch (error) {
        toast.error(getErrorMessage(error, "Nao foi possivel carregar os projetos."))
      } finally {
        setIsLoadingProjetos(false)
      }
    }

    void carregarProjetos()
  }, [isOpen])

  async function onSubmit(values: AprovarTarefasAiFormData) {
    try {
      setIsSaving(true)

      await converterTarefasAiPorIds({
        projeto_id: Number(values.projetoId),
        tarefa_ai_ids: tarefaAiIds,
      })

      toast.success("Tarefas aprovadas e convertidas com sucesso.")
      setIsOpen(false)
      form.reset({ projetoId: "" })

      if (onSuccess) {
        await onSuccess()
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Nao foi possivel converter as tarefas selecionadas."))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button type="button" disabled={tarefaAiIds.length === 0}>
            Aprovar selecionadas
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprovar tarefas de IA</DialogTitle>
          <DialogDescription>
            Selecione o projeto de destino para salvar as tarefas reais selecionadas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="px-4">
            <Field>
              <FieldLabel>Projeto</FieldLabel>
              <Controller
                name="projetoId"
                control={form.control}
                rules={{ required: "Projeto e obrigatorio." }}
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" disabled={isLoadingProjetos}>
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
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isSaving || isLoadingProjetos || tarefaAiIds.length === 0}>
              {isSaving ? "Salvando..." : "Salvar tarefas no projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
