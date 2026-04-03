"use client"

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  atualizarCredencialConfig,
  detalharCredencialConfig,
  excluirCredencialConfig,
} from "@/lib/credenciais-api"
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
import { Skeleton } from "@/components/ui/skeleton"
import type { UpdateCredencialPayload } from "@/types/credenciais"
import type { UserConfigItem } from "@/types/configuracoes"

type FormData = {
  nome: string
  url: string
  acesso: string
  senha: string
  liberadoIds: number[]
}

type EditarCredencialModalProps = {
  open: boolean
  credencialId: number | null
  users: UserConfigItem[]
  onOpenChange: (open: boolean) => void
  onChanged: () => Promise<void>
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

export function EditarCredencialModal({
  open,
  credencialId,
  users,
  onOpenChange,
  onChanged,
}: EditarCredencialModalProps) {
  const [isLoadingCredencial, setIsLoadingCredencial] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
    async function carregarCredencial() {
      if (!credencialId || !open) {
        return
      }

      setIsLoadingCredencial(true)

      try {
        const credencial = await detalharCredencialConfig(credencialId)

        reset({
          nome: credencial.nome,
          url: credencial.url,
          acesso: credencial.acesso,
          senha: credencial.senha,
          liberadoIds: credencial.liberados.map((liberado) => liberado.id),
        })
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Nao foi possivel carregar a credencial."))
        onOpenChange(false)
      } finally {
        setIsLoadingCredencial(false)
      }
    }

    void carregarCredencial()
  }, [credencialId, onOpenChange, open, reset])

  async function onSubmit(data: FormData) {
    if (!credencialId) {
      return
    }

    const payload: UpdateCredencialPayload = {
      nome: data.nome,
      url: data.url,
      acesso: data.acesso,
      senha: data.senha,
      liberado_ids: data.liberadoIds,
    }

    try {
      const result = await atualizarCredencialConfig(credencialId, payload)

      if (result.tipo === "credencial") {
        toast.success("Credencial atualizada com sucesso.")
      } else {
        toast.success("Solicitacao de edicao enviada para analise.")
      }

      await onChanged()
      onOpenChange(false)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel salvar a credencial."))
    }
  }

  async function onDelete() {
    if (!credencialId) {
      return
    }

    setIsDeleting(true)

    try {
      await excluirCredencialConfig(credencialId)
      toast.success("Credencial excluida com sucesso.")
      await onChanged()
      setIsDeleteDialogOpen(false)
      onOpenChange(false)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel excluir a credencial."))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar credencial</DialogTitle>
            <DialogDescription>
              Atualize os dados e os usuarios liberados para acesso.
            </DialogDescription>
          </DialogHeader>

          {isLoadingCredencial ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="credencial-edit-nome">Nome</FieldLabel>
                    <Input
                      id="credencial-edit-nome"
                      placeholder="Digite o nome da credencial"
                      {...register("nome", { required: "Nome e obrigatorio." })}
                    />
                    <FieldError>{errors.nome?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="credencial-edit-url">URL</FieldLabel>
                    <Input
                      id="credencial-edit-url"
                      placeholder="Digite a URL de acesso"
                      {...register("url", { required: "URL e obrigatoria." })}
                    />
                    <FieldError>{errors.url?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="credencial-edit-acesso">Usuario de acesso</FieldLabel>
                    <Input
                      id="credencial-edit-acesso"
                      placeholder="Digite o usuario/email de acesso"
                      {...register("acesso", { required: "Acesso e obrigatorio." })}
                    />
                    <FieldError>{errors.acesso?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="credencial-edit-senha">Senha</FieldLabel>
                    <Input
                      id="credencial-edit-senha"
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
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-start"
                                >
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
                                            field.value.filter(
                                              (item: number) => item !== user.id
                                            )
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

              <DialogFooter className="justify-between sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isSubmitting}
                >
                  Excluir
                </Button>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting} aria-disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar alteracoes"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir credencial?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa acao remove a credencial permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
