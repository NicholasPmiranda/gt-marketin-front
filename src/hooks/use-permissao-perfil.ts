"use client"

import { useMemo } from "react"

import { useAuth } from "@/contexts/auth-context"
import { podeExecutarAcaoPerfil } from "@/lib/permissao-perfil"

export function usePermissaoPerfil() {
  const { user } = useAuth()

  const perfil = user?.perfil ?? null

  return useMemo(
    () => ({
      perfil,
      podeAcessarUsuario: podeExecutarAcaoPerfil("usuario-acessar", perfil),
      podeCriarUsuario: podeExecutarAcaoPerfil("usuario-criar", perfil),
      podeGerenciarUsuario: podeExecutarAcaoPerfil("usuario-gerenciar", perfil),
      podeAcessarProjeto: podeExecutarAcaoPerfil("projeto-acessar", perfil),
      podeCriarProjeto: podeExecutarAcaoPerfil("projeto-criar", perfil),
      podeGerenciarProjeto: podeExecutarAcaoPerfil("projeto-gerenciar", perfil),
      podeAcessarTarefa: podeExecutarAcaoPerfil("tarefa-acessar", perfil),
      podeCriarTarefa: podeExecutarAcaoPerfil("tarefa-criar", perfil),
      podeGerenciarTarefa: podeExecutarAcaoPerfil("tarefa-gerenciar", perfil),
      podeAcessarEtiqueta: podeExecutarAcaoPerfil("etiqueta-acessar", perfil),
      podeCriarEtiqueta: podeExecutarAcaoPerfil("etiqueta-criar", perfil),
      podeGerenciarEtiqueta: podeExecutarAcaoPerfil("etiqueta-gerenciar", perfil),
      podeAcessarSetor: podeExecutarAcaoPerfil("setor-acessar", perfil),
      podeCriarSetor: podeExecutarAcaoPerfil("setor-criar", perfil),
      podeGerenciarSetor: podeExecutarAcaoPerfil("setor-gerenciar", perfil),
    }),
    [perfil]
  )
}
