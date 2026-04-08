export type PerfilUsuario = "administrativo" | "admin" | "gerente" | "funcionario"

export type AcaoPermissaoPerfil =
  | "usuario-acessar"
  | "usuario-criar"
  | "usuario-gerenciar"
  | "projeto-acessar"
  | "projeto-criar"
  | "projeto-gerenciar"
  | "tarefa-acessar"
  | "tarefa-criar"
  | "tarefa-gerenciar"
  | "etiqueta-acessar"
  | "etiqueta-criar"
  | "etiqueta-gerenciar"
  | "setor-acessar"
  | "setor-criar"
  | "setor-gerenciar"

const perfisAdmin: PerfilUsuario[] = ["administrativo", "admin"]

const permissoesPorAcao: Record<AcaoPermissaoPerfil, PerfilUsuario[]> = {
  "usuario-acessar": ["administrativo", "admin", "gerente", "funcionario"],
  "usuario-criar": ["administrativo", "admin"],
  "usuario-gerenciar": ["administrativo", "admin"],
  "projeto-acessar": ["administrativo", "admin", "gerente", "funcionario"],
  "projeto-criar": ["administrativo", "admin", "gerente"],
  "projeto-gerenciar": ["administrativo", "admin"],
  "tarefa-acessar": ["administrativo", "admin", "gerente", "funcionario"],
  "tarefa-criar": ["administrativo", "admin", "gerente", "funcionario"],
  "tarefa-gerenciar": ["administrativo", "admin"],
  "etiqueta-acessar": ["administrativo", "admin", "gerente", "funcionario"],
  "etiqueta-criar": ["administrativo", "admin", "gerente"],
  "etiqueta-gerenciar": ["administrativo", "admin"],
  "setor-acessar": ["administrativo", "admin", "gerente", "funcionario"],
  "setor-criar": ["administrativo", "admin", "gerente"],
  "setor-gerenciar": ["administrativo", "admin"],
}

function normalizarPerfil(perfil: string | null | undefined): PerfilUsuario | null {
  if (!perfil) {
    return null
  }

  const perfilNormalizado = perfil.toLowerCase().trim()

  if (
    perfilNormalizado === "administrativo" ||
    perfilNormalizado === "admin" ||
    perfilNormalizado === "gerente" ||
    perfilNormalizado === "funcionario"
  ) {
    return perfilNormalizado
  }

  return null
}

export function podeExecutarAcaoPerfil(
  acao: AcaoPermissaoPerfil,
  perfil: string | null | undefined
): boolean {
  const perfilNormalizado = normalizarPerfil(perfil)

  if (!perfilNormalizado) {
    return false
  }

  if (perfisAdmin.includes(perfilNormalizado)) {
    return true
  }

  return permissoesPorAcao[acao].includes(perfilNormalizado)
}
