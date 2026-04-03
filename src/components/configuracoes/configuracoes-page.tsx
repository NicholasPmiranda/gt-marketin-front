"use client"

import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  PencilIcon,
  PlusIcon,
  TagsIcon,
  Trash2Icon,
  UsersIcon,
  LayersIcon,
  SearchIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  atualizarEtiquetaConfig,
  atualizarSetorConfig,
  atualizarUserConfig,
  criarEtiquetaConfig,
  criarSetorConfig,
  criarUserConfig,
  excluirEtiquetaConfig,
  excluirSetorConfig,
  excluirUserConfig,
  listarEtiquetasConfig,
  listarSetoresConfig,
  listarSetoresTodosConfig,
  listarUsersConfig,
} from "@/lib/configuracoes-api"
import type {
  ConfigTab,
  EtiquetaConfigItem,
  SetorConfigItem,
  UserConfigItem,
} from "@/types/configuracoes"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type UserFormData = {
  nome: string
  email: string
  telefone: string
  setorId: string
  perfil: string
}

type SetorFormData = {
  nome: string
}

type EtiquetaFormData = {
  nome: string
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

function getSafeText(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value
  }

  if (typeof value === "number") {
    return String(value)
  }

  return fallback
}

function limparTelefone(value: string) {
  return value.replace(/\D/g, "")
}

function formatarTelefone(value: string) {
  const numeros = limparTelefone(value).slice(0, 11)

  if (numeros.length <= 2) {
    return numeros
  }

  if (numeros.length <= 6) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`
  }

  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
}

function UserCard({
  user,
  onEdit,
  onDelete,
  isDeleting,
}: {
  user: UserConfigItem
  onEdit: (user: UserConfigItem) => void
  onDelete: (user: UserConfigItem) => void
  isDeleting: boolean
}) {
  const nome = getSafeText(user.nome, "Sem nome")
  const email = getSafeText(user.email, "Sem email")
  const status = getSafeText(user.status, "Ativo")
  const perfil = getSafeText(user.perfil, "Padrao")
  const setor = getSafeText(user.setor, "Sem setor")
  const telefone = getSafeText(user.telefone, "Sem telefone")

  const initials = useMemo(() => {
    return nome
      .split(" ")
      .slice(0, 2)
      .map((item) => item.charAt(0).toUpperCase())
      .join("")
  }, [nome])

  return (
    <Card>
      <CardContent className="flex items-start gap-4 pt-6">
        <div className="flex size-12 items-center justify-center rounded-full border text-sm font-semibold">
          {initials}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="space-y-1">
            <p className="truncate text-sm font-semibold">{nome}</p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{status}</Badge>
            <Badge variant="outline">{perfil}</Badge>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{setor}</p>
            <p>{telefone}</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onEdit(user)}>
              <PencilIcon className="size-4" />
              Editar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDelete(user)}
              disabled={isDeleting}
              aria-disabled={isDeleting}
            >
              <Trash2Icon className="size-4 text-destructive" />
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SetorCard({
  setor,
  onEdit,
  onDelete,
  isDeleting,
}: {
  setor: SetorConfigItem
  onEdit: (setor: SetorConfigItem) => void
  onDelete: (setor: SetorConfigItem) => void
  isDeleting: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{setor.nome}</CardTitle>
        <CardDescription>Setor da organizacao</CardDescription>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onEdit(setor)}>
            <PencilIcon className="size-4" />
            Editar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete(setor)}
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

function EtiquetaCard({
  etiqueta,
  onEdit,
  onDelete,
  isDeleting,
}: {
  etiqueta: EtiquetaConfigItem
  onEdit: (etiqueta: EtiquetaConfigItem) => void
  onDelete: (etiqueta: EtiquetaConfigItem) => void
  isDeleting: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{etiqueta.nome}</CardTitle>
        <CardDescription>Etiqueta da organizacao</CardDescription>
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(etiqueta)}
          >
            <PencilIcon className="size-4" />
            Editar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete(etiqueta)}
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

export function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<ConfigTab>("users")
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [users, setUsers] = useState<UserConfigItem[]>([])
  const [setores, setSetores] = useState<SetorConfigItem[]>([])
  const [setoresTodos, setSetoresTodos] = useState<SetorConfigItem[]>([])
  const [etiquetas, setEtiquetas] = useState<EtiquetaConfigItem[]>([])

  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false)
  const [isSetorModalOpen, setIsSetorModalOpen] = useState(false)
  const [isSetorEditModalOpen, setIsSetorEditModalOpen] = useState(false)
  const [isEtiquetaModalOpen, setIsEtiquetaModalOpen] = useState(false)
  const [isEtiquetaEditModalOpen, setIsEtiquetaEditModalOpen] = useState(false)
  const [isUsuarioAtivo, setIsUsuarioAtivo] = useState(true)
  const [isUsuarioEditAtivo, setIsUsuarioEditAtivo] = useState(true)

  const [userSelecionado, setUserSelecionado] = useState<UserConfigItem | null>(null)
  const [setorSelecionado, setSetorSelecionado] = useState<SetorConfigItem | null>(null)
  const [etiquetaSelecionada, setEtiquetaSelecionada] = useState<EtiquetaConfigItem | null>(null)

  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
  const [deletingSetorId, setDeletingSetorId] = useState<number | null>(null)
  const [deletingEtiquetaId, setDeletingEtiquetaId] = useState<number | null>(null)
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false)
  const [isDeleteSetorDialogOpen, setIsDeleteSetorDialogOpen] = useState(false)
  const [isDeleteEtiquetaDialogOpen, setIsDeleteEtiquetaDialogOpen] = useState(false)
  const [userParaExcluir, setUserParaExcluir] = useState<UserConfigItem | null>(null)
  const [setorParaExcluir, setSetorParaExcluir] = useState<SetorConfigItem | null>(null)
  const [etiquetaParaExcluir, setEtiquetaParaExcluir] = useState<EtiquetaConfigItem | null>(null)

  const {
    control: controlUser,
    register: registerUser,
    handleSubmit: handleSubmitUser,
    formState: { errors: userErrors, isSubmitting: isSubmittingUser },
    reset: resetUser,
  } = useForm<UserFormData>({
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      setorId: "",
      perfil: "",
    },
  })

  const {
    control: controlUserEdit,
    register: registerUserEdit,
    handleSubmit: handleSubmitUserEdit,
    formState: { errors: userEditErrors, isSubmitting: isSubmittingUserEdit },
    reset: resetUserEdit,
  } = useForm<UserFormData>({
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      setorId: "",
      perfil: "",
    },
  })

  const {
    register: registerSetor,
    handleSubmit: handleSubmitSetor,
    formState: { errors: setorErrors, isSubmitting: isSubmittingSetor },
    reset: resetSetor,
  } = useForm<SetorFormData>({
    defaultValues: {
      nome: "",
    },
  })

  const {
    register: registerSetorEdit,
    handleSubmit: handleSubmitSetorEdit,
    formState: { errors: setorEditErrors, isSubmitting: isSubmittingSetorEdit },
    reset: resetSetorEdit,
  } = useForm<SetorFormData>({
    defaultValues: {
      nome: "",
    },
  })

  const {
    register: registerEtiqueta,
    handleSubmit: handleSubmitEtiqueta,
    formState: { errors: etiquetaErrors, isSubmitting: isSubmittingEtiqueta },
    reset: resetEtiqueta,
  } = useForm<EtiquetaFormData>({
    defaultValues: {
      nome: "",
    },
  })

  const {
    register: registerEtiquetaEdit,
    handleSubmit: handleSubmitEtiquetaEdit,
    formState: {
      errors: etiquetaEditErrors,
      isSubmitting: isSubmittingEtiquetaEdit,
    },
    reset: resetEtiquetaEdit,
  } = useForm<EtiquetaFormData>({
    defaultValues: {
      nome: "",
    },
  })

  async function carregarConfiguracoes() {
    setIsLoading(true)

    try {
      const [listaUsers, listaSetores, listaSetoresTodos, listaEtiquetas] = await Promise.all([
        listarUsersConfig(),
        listarSetoresConfig(),
        listarSetoresTodosConfig(),
        listarEtiquetasConfig(),
      ])

      setUsers(listaUsers)
      setSetores(listaSetores)
      setSetoresTodos(listaSetoresTodos)
      setEtiquetas(listaEtiquetas)
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, "Nao foi possivel carregar as configuracoes.")
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void carregarConfiguracoes()
  }, [])

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase()
    return users.filter(
      (item) =>
        getSafeText(item.nome).toLowerCase().includes(query) ||
        getSafeText(item.email).toLowerCase().includes(query)
    )
  }, [search, users])

  const filteredSetores = useMemo(() => {
    const query = search.toLowerCase()
    return setores.filter(
      (item) =>
        getSafeText(item.nome).toLowerCase().includes(query)
    )
  }, [search, setores])

  const filteredEtiquetas = useMemo(() => {
    const query = search.toLowerCase()
    return etiquetas.filter(
      (item) =>
        getSafeText(item.nome).toLowerCase().includes(query)
    )
  }, [search, etiquetas])

  async function onSubmitUser(data: UserFormData) {
    try {
      const novoUser = await criarUserConfig({
        name: data.nome,
        email: data.email,
        telefone: limparTelefone(data.telefone),
        setor_id: Number(data.setorId),
        perfil: data.perfil,
        ativo: isUsuarioAtivo,
      })

      setUsers((oldState) => [novoUser, ...oldState])
      setIsUserModalOpen(false)
      resetUser()
      setIsUsuarioAtivo(true)
      toast.success("Usuario cadastrado com sucesso.")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel cadastrar o usuario."))
    }
  }

  async function onSubmitUserEdicao(data: UserFormData) {
    if (!userSelecionado) {
      return
    }

    try {
      const userAtualizado = await atualizarUserConfig(userSelecionado.id, {
        name: data.nome,
        email: data.email,
        telefone: limparTelefone(data.telefone),
        setor_id: Number(data.setorId),
        perfil: data.perfil,
        ativo: isUsuarioEditAtivo,
      })

      setUsers((oldState) =>
        oldState.map((item) => (item.id === userAtualizado.id ? userAtualizado : item))
      )
      setUserSelecionado(null)
      setIsUserEditModalOpen(false)
      resetUserEdit()
      toast.success("Usuario atualizado com sucesso.")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel atualizar o usuario."))
    }
  }

  async function onSubmitSetor(data: SetorFormData) {
    try {
      const novoSetor = await criarSetorConfig({
        nome: data.nome,
      })

      setSetores((oldState) => [novoSetor, ...oldState])
      setSetoresTodos((oldState) => [novoSetor, ...oldState])
      setIsSetorModalOpen(false)
      resetSetor()
      toast.success("Setor cadastrado com sucesso.")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel cadastrar o setor."))
    }
  }

  async function onSubmitSetorEdicao(data: SetorFormData) {
    if (!setorSelecionado) {
      return
    }

    try {
      const setorAtualizado = await atualizarSetorConfig(setorSelecionado.id, {
        nome: data.nome,
      })

      setSetores((oldState) =>
        oldState.map((item) => (item.id === setorAtualizado.id ? setorAtualizado : item))
      )
      setSetoresTodos((oldState) =>
        oldState.map((item) => (item.id === setorAtualizado.id ? setorAtualizado : item))
      )
      setUsers((oldState) =>
        oldState.map((item) =>
          item.setorId === setorAtualizado.id ? { ...item, setor: setorAtualizado.nome } : item
        )
      )
      setSetorSelecionado(null)
      setIsSetorEditModalOpen(false)
      resetSetorEdit()
      toast.success("Setor atualizado com sucesso.")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel atualizar o setor."))
    }
  }

  async function onSubmitEtiqueta(data: EtiquetaFormData) {
    try {
      const novaEtiqueta = await criarEtiquetaConfig({
        nome: data.nome,
      })

      setEtiquetas((oldState) => [novaEtiqueta, ...oldState])
      setIsEtiquetaModalOpen(false)
      resetEtiqueta()
      toast.success("Etiqueta cadastrada com sucesso.")
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, "Nao foi possivel cadastrar a etiqueta.")
      )
    }
  }

  async function onSubmitEtiquetaEdicao(data: EtiquetaFormData) {
    if (!etiquetaSelecionada) {
      return
    }

    try {
      const etiquetaAtualizada = await atualizarEtiquetaConfig(etiquetaSelecionada.id, {
        nome: data.nome,
      })

      setEtiquetas((oldState) =>
        oldState.map((item) => (item.id === etiquetaAtualizada.id ? etiquetaAtualizada : item))
      )
      setEtiquetaSelecionada(null)
      setIsEtiquetaEditModalOpen(false)
      resetEtiquetaEdit()
      toast.success("Etiqueta atualizada com sucesso.")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel atualizar a etiqueta."))
    }
  }

  function abrirModalEdicaoUser(user: UserConfigItem) {
    setUserSelecionado(user)
    setIsUsuarioEditAtivo(Boolean(user.ativo))
    resetUserEdit({
      nome: user.nome,
      email: user.email,
      telefone: formatarTelefone(getSafeText(user.telefone)),
      setorId: String(user.setorId ?? ""),
      perfil: user.perfil ?? "",
    })
    setIsUserEditModalOpen(true)
  }

  function abrirModalEdicaoSetor(setor: SetorConfigItem) {
    setSetorSelecionado(setor)
    resetSetorEdit({
      nome: setor.nome,
    })
    setIsSetorEditModalOpen(true)
  }

  function abrirModalEdicaoEtiqueta(etiqueta: EtiquetaConfigItem) {
    setEtiquetaSelecionada(etiqueta)
    resetEtiquetaEdit({
      nome: etiqueta.nome,
    })
    setIsEtiquetaEditModalOpen(true)
  }

  function solicitarExclusaoUser(user: UserConfigItem) {
    setUserParaExcluir(user)
    setIsDeleteUserDialogOpen(true)
  }

  async function confirmarExclusaoUser() {
    if (!userParaExcluir) {
      return
    }

    setDeletingUserId(userParaExcluir.id)

    try {
      await excluirUserConfig(userParaExcluir.id)
      setUsers((oldState) => oldState.filter((item) => item.id !== userParaExcluir.id))
      toast.success("Usuario excluido com sucesso.")
      setIsDeleteUserDialogOpen(false)
      setUserParaExcluir(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel excluir o usuario."))
    } finally {
      setDeletingUserId(null)
    }
  }

  function solicitarExclusaoSetor(setor: SetorConfigItem) {
    setSetorParaExcluir(setor)
    setIsDeleteSetorDialogOpen(true)
  }

  async function confirmarExclusaoSetor() {
    if (!setorParaExcluir) {
      return
    }

    setDeletingSetorId(setorParaExcluir.id)

    try {
      await excluirSetorConfig(setorParaExcluir.id)
      setSetores((oldState) => oldState.filter((item) => item.id !== setorParaExcluir.id))
      setSetoresTodos((oldState) =>
        oldState.filter((item) => item.id !== setorParaExcluir.id)
      )
      toast.success("Setor excluido com sucesso.")
      setIsDeleteSetorDialogOpen(false)
      setSetorParaExcluir(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel excluir o setor."))
    } finally {
      setDeletingSetorId(null)
    }
  }

  function solicitarExclusaoEtiqueta(etiqueta: EtiquetaConfigItem) {
    setEtiquetaParaExcluir(etiqueta)
    setIsDeleteEtiquetaDialogOpen(true)
  }

  async function confirmarExclusaoEtiqueta() {
    if (!etiquetaParaExcluir) {
      return
    }

    setDeletingEtiquetaId(etiquetaParaExcluir.id)

    try {
      await excluirEtiquetaConfig(etiquetaParaExcluir.id)
      setEtiquetas((oldState) =>
        oldState.filter((item) => item.id !== etiquetaParaExcluir.id)
      )
      toast.success("Etiqueta excluida com sucesso.")
      setIsDeleteEtiquetaDialogOpen(false)
      setEtiquetaParaExcluir(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Nao foi possivel excluir a etiqueta."))
    } finally {
      setDeletingEtiquetaId(null)
    }
  }

  const activeCount =
    activeTab === "users"
      ? users.length
      : activeTab === "setores"
        ? setores.length
        : etiquetas.length

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          {activeTab === "users" ? <UsersIcon className="size-5" /> : null}
          {activeTab === "setores" ? <LayersIcon className="size-5" /> : null}
          {activeTab === "etiquetas" ? <TagsIcon className="size-5" /> : null}
          <div>
            <p className="text-sm text-muted-foreground">Total cadastrado</p>
            <p className="text-2xl font-semibold">{activeCount}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setSearch("")
          setActiveTab(value as ConfigTab)
        }}
        orientation="vertical"
        className="gap-6"
      >
        <TabsList variant="line" className="min-w-52 items-start">
          <TabsTrigger value="users">
            <UsersIcon className="size-4" />
            Equipe
          </TabsTrigger>
          <TabsTrigger value="setores">
            <LayersIcon className="size-4" />
            Setores
          </TabsTrigger>
          <TabsTrigger value="etiquetas">
            <TagsIcon className="size-4" />
            Etiquetas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="w-full">
          <Card>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Membros da equipe</CardTitle>
                <CardDescription>
                  Todos os usuarios cadastrados no sistema
                </CardDescription>
              </div>
              <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
                <DialogTrigger className={buttonVariants()}>
                  <PlusIcon />
                  Adicionar usuario
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Usuario</DialogTitle>
                    <DialogDescription>
                      Preencha os dados abaixo para criar um novo usuario no sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitUser(onSubmitUser)}>
                    <div className="p-4">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="nome-user">Nome Completo *</FieldLabel>
                          <Input
                            id="nome-user"
                            placeholder="Ex: Joao da Silva"
                            {...registerUser("nome", {
                              required: "Nome e obrigatorio.",
                            })}
                          />
                          <FieldDescription>
                            Nome completo do usuario (minimo 3 caracteres)
                          </FieldDescription>
                          <FieldError>{userErrors.nome?.message}</FieldError>
                        </Field>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Field>
                            <FieldLabel htmlFor="email-user">Email</FieldLabel>
                            <Input
                              id="email-user"
                              type="email"
                              placeholder="usuario@exemplo.com"
                              {...registerUser("email", {
                                required: "Email e obrigatorio.",
                              })}
                            />
                            <FieldDescription>
                              Email para contato (opcional)
                            </FieldDescription>
                            <FieldError>{userErrors.email?.message}</FieldError>
                          </Field>

                          <Field>
                            <FieldLabel htmlFor="telefone-user">Telefone *</FieldLabel>
                            <Input
                              id="telefone-user"
                              placeholder="(11) 99999-9999"
                              {...registerUser("telefone", {
                                required: "Telefone e obrigatorio.",
                                validate: (value) => {
                                  const telefoneLimpo = limparTelefone(value)
                                  if (telefoneLimpo.length < 10) {
                                    return "Informe um telefone com DDD valido."
                                  }

                                  return true
                                },
                                onChange: (event) => {
                                  event.target.value = formatarTelefone(event.target.value)
                                },
                              })}
                            />
                            <FieldDescription>
                              Telefone para autenticacao
                            </FieldDescription>
                            <FieldError>{userErrors.telefone?.message}</FieldError>
                          </Field>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Field>
                            <FieldLabel>Perfil/Permissao *</FieldLabel>
                            <Controller
                              name="perfil"
                              control={controlUser}
                              rules={{ required: "Perfil e obrigatorio." }}
                              render={({ field }) => (
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione um perfil" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectItem value="administrativo">
                                        Administrador
                                      </SelectItem>
                                      <SelectItem value="gerente">Gerente</SelectItem>
                                      <SelectItem value="funcionario">
                                        Funcionario
                                      </SelectItem>
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            <FieldDescription>
                              Define o nivel de acesso do usuario
                            </FieldDescription>
                            <FieldError>{userErrors.perfil?.message}</FieldError>
                          </Field>

                          <Field>
                            <FieldLabel>Setor *</FieldLabel>
                            <Controller
                              name="setorId"
                              control={controlUser}
                              rules={{ required: "Setor e obrigatorio." }}
                              render={({ field }) => (
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione um setor">
                                      {setoresTodos.find(
                                        (setor) => String(setor.id) === field.value
                                      )?.nome}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {setoresTodos.map((setor) => (
                                        <SelectItem
                                          key={setor.id}
                                          value={String(setor.id)}
                                        >
                                          {setor.nome}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            <FieldDescription>
                              Setor de atuacao do usuario
                            </FieldDescription>
                            <FieldError>{userErrors.setorId?.message}</FieldError>
                          </Field>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <p className="text-sm font-medium">Usuario Ativo</p>
                            <p className="text-sm text-muted-foreground">
                              Usuarios inativos nao podem acessar o sistema
                            </p>
                          </div>
                          <Checkbox
                            checked={isUsuarioAtivo}
                            onCheckedChange={(checked) =>
                              setIsUsuarioAtivo(Boolean(checked))
                            }
                          />
                        </div>
                      </FieldGroup>
                    </div>
                    <DialogFooter>
                      <DialogClose render={<Button type="button" variant="outline" />}>
                        Cancelar
                      </DialogClose>
                      <Button
                        type="submit"
                        disabled={isSubmittingUser}
                        aria-disabled={isSubmittingUser}
                      >
                        {isSubmittingUser ? "Salvando..." : "Salvar Usuario"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={isUserEditModalOpen} onOpenChange={setIsUserEditModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Usuario</DialogTitle>
                    <DialogDescription>
                      Atualize os dados do usuario selecionado.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitUserEdit(onSubmitUserEdicao)}>
                    <div className="p-4">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="nome-user-edicao">Nome Completo *</FieldLabel>
                          <Input
                            id="nome-user-edicao"
                            placeholder="Ex: Joao da Silva"
                            {...registerUserEdit("nome", {
                              required: "Nome e obrigatorio.",
                            })}
                          />
                          <FieldError>{userEditErrors.nome?.message}</FieldError>
                        </Field>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Field>
                            <FieldLabel htmlFor="email-user-edicao">Email</FieldLabel>
                            <Input
                              id="email-user-edicao"
                              type="email"
                              placeholder="usuario@exemplo.com"
                              {...registerUserEdit("email", {
                                required: "Email e obrigatorio.",
                              })}
                            />
                            <FieldError>{userEditErrors.email?.message}</FieldError>
                          </Field>

                          <Field>
                            <FieldLabel htmlFor="telefone-user-edicao">Telefone *</FieldLabel>
                            <Input
                              id="telefone-user-edicao"
                              placeholder="(11) 99999-9999"
                              {...registerUserEdit("telefone", {
                                required: "Telefone e obrigatorio.",
                                validate: (value) => {
                                  const telefoneLimpo = limparTelefone(value)
                                  if (telefoneLimpo.length < 10) {
                                    return "Informe um telefone com DDD valido."
                                  }

                                  return true
                                },
                                onChange: (event) => {
                                  event.target.value = formatarTelefone(event.target.value)
                                },
                              })}
                            />
                            <FieldError>{userEditErrors.telefone?.message}</FieldError>
                          </Field>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Field>
                            <FieldLabel>Perfil/Permissao *</FieldLabel>
                            <Controller
                              name="perfil"
                              control={controlUserEdit}
                              rules={{ required: "Perfil e obrigatorio." }}
                              render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione um perfil" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectItem value="administrativo">Administrador</SelectItem>
                                      <SelectItem value="gerente">Gerente</SelectItem>
                                      <SelectItem value="funcionario">Funcionario</SelectItem>
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            <FieldError>{userEditErrors.perfil?.message}</FieldError>
                          </Field>

                          <Field>
                            <FieldLabel>Setor *</FieldLabel>
                            <Controller
                              name="setorId"
                              control={controlUserEdit}
                              rules={{ required: "Setor e obrigatorio." }}
                              render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione um setor">
                                      {setoresTodos.find(
                                        (setor) => String(setor.id) === field.value
                                      )?.nome}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {setoresTodos.map((setor) => (
                                        <SelectItem key={setor.id} value={String(setor.id)}>
                                          {setor.nome}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            <FieldError>{userEditErrors.setorId?.message}</FieldError>
                          </Field>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <p className="text-sm font-medium">Usuario Ativo</p>
                            <p className="text-sm text-muted-foreground">
                              Usuarios inativos nao podem acessar o sistema
                            </p>
                          </div>
                          <Checkbox
                            checked={isUsuarioEditAtivo}
                            onCheckedChange={(checked) =>
                              setIsUsuarioEditAtivo(Boolean(checked))
                            }
                          />
                        </div>
                      </FieldGroup>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={isSubmittingUserEdit}
                        aria-disabled={isSubmittingUserEdit}
                      >
                        {isSubmittingUserEdit ? "Salvando..." : "Salvar alteracoes"}
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
                  placeholder="Buscar membros da equipe"
                  className="pl-10"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {isLoading ? (
                <ConfiguracoesSkeleton />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredUsers.map((item) => (
                    <UserCard
                      key={item.id}
                      user={item}
                      onEdit={abrirModalEdicaoUser}
                      onDelete={solicitarExclusaoUser}
                      isDeleting={deletingUserId === item.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setores" className="w-full">
          <Card>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Setores</CardTitle>
                <CardDescription>
                  Gerencie os setores da sua organizacao
                </CardDescription>
              </div>
              <Dialog open={isSetorModalOpen} onOpenChange={setIsSetorModalOpen}>
                <DialogTrigger className={buttonVariants()}>
                  <PlusIcon />
                  Adicionar setor
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar setor</DialogTitle>
                    <DialogDescription>
                      Informe os dados para incluir um novo setor.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitSetor(onSubmitSetor)}>
                    <div className="p-4">
                      <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="nome-setor">Nome</FieldLabel>
                        <Input
                          id="nome-setor"
                          placeholder="Digite o nome do setor"
                          {...registerSetor("nome", {
                            required: "Nome e obrigatorio.",
                          })}
                        />
                        <FieldError>{setorErrors.nome?.message}</FieldError>
                      </Field>
                      </FieldGroup>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={isSubmittingSetor}
                        aria-disabled={isSubmittingSetor}
                      >
                        {isSubmittingSetor ? "Salvando..." : "Salvar setor"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={isSetorEditModalOpen} onOpenChange={setIsSetorEditModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar setor</DialogTitle>
                    <DialogDescription>
                      Atualize os dados do setor selecionado.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitSetorEdit(onSubmitSetorEdicao)}>
                    <div className="p-4">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="nome-setor-edicao">Nome</FieldLabel>
                          <Input
                            id="nome-setor-edicao"
                            placeholder="Digite o nome do setor"
                            {...registerSetorEdit("nome", {
                              required: "Nome e obrigatorio.",
                            })}
                          />
                          <FieldError>{setorEditErrors.nome?.message}</FieldError>
                        </Field>
                      </FieldGroup>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={isSubmittingSetorEdit}
                        aria-disabled={isSubmittingSetorEdit}
                      >
                        {isSubmittingSetorEdit ? "Salvando..." : "Salvar alteracoes"}
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
                  placeholder="Buscar setores"
                  className="pl-10"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {isLoading ? (
                <ConfiguracoesSkeleton />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredSetores.map((item) => (
                    <SetorCard
                      key={item.id}
                      setor={item}
                      onEdit={abrirModalEdicaoSetor}
                      onDelete={solicitarExclusaoSetor}
                      isDeleting={deletingSetorId === item.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="etiquetas" className="w-full">
          <Card>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Etiquetas</CardTitle>
                <CardDescription>
                  Gerencie as etiquetas da sua organizacao
                </CardDescription>
              </div>
              <Dialog
                open={isEtiquetaModalOpen}
                onOpenChange={setIsEtiquetaModalOpen}
              >
                <DialogTrigger className={buttonVariants()}>
                  <PlusIcon />
                  Adicionar etiqueta
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar etiqueta</DialogTitle>
                    <DialogDescription>
                      Informe os dados para incluir uma nova etiqueta.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitEtiqueta(onSubmitEtiqueta)}>
                    <div className="p-4">
                      <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="nome-etiqueta">Nome</FieldLabel>
                        <Input
                          id="nome-etiqueta"
                          placeholder="Digite o nome da etiqueta"
                          {...registerEtiqueta("nome", {
                            required: "Nome e obrigatorio.",
                          })}
                        />
                        <FieldError>{etiquetaErrors.nome?.message}</FieldError>
                      </Field>
                      </FieldGroup>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={isSubmittingEtiqueta}
                        aria-disabled={isSubmittingEtiqueta}
                      >
                        {isSubmittingEtiqueta
                          ? "Salvando..."
                          : "Salvar etiqueta"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog
                open={isEtiquetaEditModalOpen}
                onOpenChange={setIsEtiquetaEditModalOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar etiqueta</DialogTitle>
                    <DialogDescription>
                      Atualize os dados da etiqueta selecionada.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitEtiquetaEdit(onSubmitEtiquetaEdicao)}>
                    <div className="p-4">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="nome-etiqueta-edicao">Nome</FieldLabel>
                          <Input
                            id="nome-etiqueta-edicao"
                            placeholder="Digite o nome da etiqueta"
                            {...registerEtiquetaEdit("nome", {
                              required: "Nome e obrigatorio.",
                            })}
                          />
                          <FieldError>{etiquetaEditErrors.nome?.message}</FieldError>
                        </Field>
                      </FieldGroup>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={isSubmittingEtiquetaEdit}
                        aria-disabled={isSubmittingEtiquetaEdit}
                      >
                        {isSubmittingEtiquetaEdit ? "Salvando..." : "Salvar alteracoes"}
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
                  placeholder="Buscar etiquetas"
                  className="pl-10"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {isLoading ? (
                <ConfiguracoesSkeleton />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredEtiquetas.map((item) => (
                    <EtiquetaCard
                      key={item.id}
                      etiqueta={item}
                      onEdit={abrirModalEdicaoEtiqueta}
                      onDelete={solicitarExclusaoEtiqueta}
                      isDeleting={deletingEtiquetaId === item.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao vai excluir o usuario {userParaExcluir?.nome}. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button type="button" variant="outline" />}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              render={<Button type="button" variant="destructive" />}
              onClick={confirmarExclusaoUser}
              disabled={deletingUserId !== null}
            >
              {deletingUserId !== null ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteSetorDialogOpen} onOpenChange={setIsDeleteSetorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir setor</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao vai excluir o setor {setorParaExcluir?.nome}. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button type="button" variant="outline" />}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              render={<Button type="button" variant="destructive" />}
              onClick={confirmarExclusaoSetor}
              disabled={deletingSetorId !== null}
            >
              {deletingSetorId !== null ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isDeleteEtiquetaDialogOpen}
        onOpenChange={setIsDeleteEtiquetaDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir etiqueta</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao vai excluir a etiqueta {etiquetaParaExcluir?.nome}. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button type="button" variant="outline" />}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              render={<Button type="button" variant="destructive" />}
              onClick={confirmarExclusaoEtiqueta}
              disabled={deletingEtiquetaId !== null}
            >
              {deletingEtiquetaId !== null ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
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
