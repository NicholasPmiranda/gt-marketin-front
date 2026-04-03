"use client"

import Link from "next/link"
import { AxiosError } from "axios"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import api from "@/lib/axios"
import { useAuth } from "@/contexts/auth-context"
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

type RedefinirSenhaForm = {
  token: string
  email: string
  password: string
  password_confirmation: string
}

type ApiError = {
  message?: string
}

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RedefinirSenhaForm>({
    defaultValues: {
      token: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  })

  const senhaAtual = watch("password")

  useEffect(() => {
    const token = searchParams.get("token") || ""
    const email = searchParams.get("email") || ""

    setValue("token", token)
    setValue("email", email)
  }, [searchParams, setValue])

  async function onSubmit(data: RedefinirSenhaForm) {
    try {
      const response = await api.post<{ message: string }>("/api/reset-password", {
        token: data.token,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })

      toast.success(response.data.message || "Senha redefinida com sucesso")

      const loginResult = await login({
        email: data.email,
        password: data.password,
      })

      if (!loginResult.success) {
        toast.error(loginResult.message || "Senha atualizada, mas nao foi possivel autenticar")
        return
      }

      router.push("/app")
    } catch (error) {
      const mensagemPadrao = "Nao foi possivel redefinir a senha."
      const apiError = error as AxiosError<ApiError>
      const message = apiError.response?.data?.message || mensagemPadrao

      toast.error(message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redefinir senha</CardTitle>
        <CardDescription>Digite seus dados para criar uma nova senha</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <input type="hidden" {...register("token", { required: "Token invalido" })} />

            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                readOnly
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
              <FieldLabel htmlFor="password">Nova senha</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua nova senha"
                aria-invalid={errors.password ? true : undefined}
                {...register("password", {
                  required: "Informe a nova senha",
                  minLength: {
                    value: 8,
                    message: "A senha deve ter no minimo 8 caracteres",
                  },
                })}
              />
              <FieldError>{errors.password?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="password_confirmation">Confirmar senha</FieldLabel>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="Confirme sua nova senha"
                aria-invalid={errors.password_confirmation ? true : undefined}
                {...register("password_confirmation", {
                  required: "Confirme sua nova senha",
                  validate: (value) =>
                    value === senhaAtual || "A confirmacao precisa ser igual a senha",
                })}
              />
              <FieldError>{errors.password_confirmation?.message}</FieldError>
            </Field>

            <FieldError>{errors.token?.message}</FieldError>

            <Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Redefinir senha"}
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
