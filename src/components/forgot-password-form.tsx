"use client"

import Link from "next/link"
import { AxiosError } from "axios"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type EsqueciSenhaForm = {
  email: string
}

type ApiError = {
  message?: string
}

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EsqueciSenhaForm>()

  async function onSubmit(data: EsqueciSenhaForm) {
    try {
      const response = await api.post<{ message: string }>("/api/forgot-password", {
        email: data.email,
      })

      toast.success(response.data.message || "Email de recuperacao enviado com sucesso")
    } catch (error) {
      const mensagemPadrao = "Nao foi possivel enviar o email de recuperacao."
      const apiError = error as AxiosError<ApiError>
      const message = apiError.response?.data?.message || mensagemPadrao

      toast.error(message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Esqueci minha senha</CardTitle>
        <CardDescription>
          Informe seu email para receber o link de redefinicao de senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                aria-invalid={errors.email ? true : undefined}
                {...register("email", {
                  required: "Informe seu email",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Informe um email valido",
                  },
                })}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </Field>

            <Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar link"}
              </Button>
              <FieldDescription className="text-center">
                <Link href="/auth">Voltar para o login</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
