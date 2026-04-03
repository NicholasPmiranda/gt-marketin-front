"use client"

import { useForm } from "react-hook-form"

import type { TarefaComentario } from "@/types/tarefas"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

type ComentarioFormData = {
  comentario: string
}

function getInitials(name: string) {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item.charAt(0).toUpperCase())
    .join("")
}

export function TarefaComentariosCard({
  comentarios,
  isSaving,
  onSubmit,
}: {
  comentarios: TarefaComentario[]
  isSaving: boolean
  onSubmit: (comentario: string) => Promise<void>
}) {
  const form = useForm<ComentarioFormData>({
    defaultValues: {
      comentario: "",
    },
  })

  async function handleSubmit(values: ComentarioFormData) {
    await onSubmit(values.comentario)
    form.reset({ comentario: "" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comentarios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comentarios.length > 0 ? (
          <div className="space-y-3">
            {comentarios.map((comentario) => (
              <div key={comentario.id} className="rounded-md border p-3">
                <div className="flex items-start gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>{getInitials(comentario.user?.name ?? "Usuario")}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{comentario.user?.name ?? "Usuario"}</p>
                    <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground">
                      {comentario.comentario}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Nenhum comentario cadastrado para esta tarefa.
          </div>
        )}

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="novo-comentario">Novo comentario</FieldLabel>
              <Textarea
                id="novo-comentario"
                placeholder="Digite um comentario para a tarefa"
                rows={4}
                {...form.register("comentario", {
                  required: "Comentario e obrigatorio.",
                })}
              />
              <FieldError errors={[form.formState.errors.comentario]} />
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Salvando..." : "Adicionar comentario"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
