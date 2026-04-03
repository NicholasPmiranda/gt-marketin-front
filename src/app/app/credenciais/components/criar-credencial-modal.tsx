"use client"

import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { CreateCredencialPayload } from "@/types/credenciais"
import type { UserConfigItem } from "@/types/configuracoes"

type FormData = {
  nome: string
  url: string
  acesso: string
  senha: string
  liberadoIds: number[]
}

type CriarCredencialModalProps = {
  open: boolean
  users: UserConfigItem[]
  onOpenChange: (open: boolean) => void
  onCreate: (payload: CreateCredencialPayload) => Promise<void>
}

export function CriarCredencialModal({
  open,
  users,
  onOpenChange,
  onCreate,
}: CriarCredencialModalProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      nome: "",
      url: "",
      acesso: "",
      senha: "",
      liberadoIds: [],
    },
  })

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  async function onSubmit(data: FormData) {
    await onCreate({
      nome: data.nome,
      url: data.url,
      acesso: data.acesso,
      senha: data.senha,
      liberado_ids: data.liberadoIds,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar credencial</DialogTitle>
          <DialogDescription>
            Cadastre uma nova credencial e compartilhe com os usuarios necessarios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="credencial-nome">Nome</FieldLabel>
                <Input
                  id="credencial-nome"
                  placeholder="Digite o nome da credencial"
                  {...register("nome", { required: "Nome e obrigatorio." })}
                />
                <FieldError>{errors.nome?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="credencial-url">URL</FieldLabel>
                <Input
                  id="credencial-url"
                  placeholder="Digite a URL de acesso"
                  {...register("url", { required: "URL e obrigatoria." })}
                />
                <FieldError>{errors.url?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="credencial-acesso">Usuario de acesso</FieldLabel>
                <Input
                  id="credencial-acesso"
                  placeholder="Digite o usuario/email de acesso"
                  {...register("acesso", { required: "Acesso e obrigatorio." })}
                />
                <FieldError>{errors.acesso?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="credencial-senha">Senha</FieldLabel>
                <Input
                  id="credencial-senha"
                  type="password"
                  placeholder="Digite a senha"
                  {...register("senha", { required: "Senha e obrigatoria." })}
                />
                <FieldError>{errors.senha?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel>Liberar acesso para</FieldLabel>
                <Controller
                  name="liberadoIds"
                  control={control}
                  render={({ field }) => {
                    const selecionados = users.filter((user) => field.value.includes(user.id))

                    return (
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button type="button" variant="outline" className="w-full justify-start">
                              {selecionados.length > 0
                                ? selecionados.map((user) => user.nome).join(", ")
                                : "Selecione os usuarios"}
                            </Button>
                          }
                        />
                        <PopoverContent className="w-[var(--anchor-width)] p-0">
                          <div className="grid max-h-56 gap-2 overflow-y-auto p-3">
                            {users.map((user) => {
                              const isChecked = field.value.includes(user.id)

                              return (
                                <label key={user.id} className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(value) => {
                                      if (value === true) {
                                        field.onChange([...field.value, user.id])
                                        return
                                      }

                                      field.onChange(
                                        field.value.filter((item: number) => item !== user.id)
                                      )
                                    }}
                                  />
                                  {user.nome}
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} aria-disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar credencial"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
