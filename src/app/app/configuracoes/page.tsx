"use client"

import { useState } from "react"
import { KeyRoundIcon, LayersIcon, ListTodoIcon, TagsIcon, UsersIcon } from "lucide-react"

import { usePermissaoPerfil } from "@/hooks/use-permissao-perfil"
import type { ConfigTab } from "@/types/configuracoes"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  EtiquetasTabContent,
  MeuPerfilTabContent,
  SetoresTabContent,
  UsersTabContent,
} from "./components/configuracoes-tabs"
import { TarefasModeloTabContent } from "./components/tarefas-modelo-tab-content"

export default function Page() {
  const { podeAcessarUsuario, podeAcessarSetor, podeAcessarEtiqueta } = usePermissaoPerfil()
  const [activeTab, setActiveTab] = useState<ConfigTab>("users")

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ConfigTab)}
        orientation="vertical"
        className="gap-6"
      >
        <TabsList variant="line" className="min-w-52 items-start">
          {podeAcessarUsuario ? (
            <TabsTrigger value="users">
              <UsersIcon className="size-4" />
              Equipe
            </TabsTrigger>
          ) : null}
          {podeAcessarSetor ? (
            <TabsTrigger value="setores">
              <LayersIcon className="size-4" />
              Setores
            </TabsTrigger>
          ) : null}
          {podeAcessarEtiqueta ? (
            <TabsTrigger value="etiquetas">
              <TagsIcon className="size-4" />
              Etiquetas
            </TabsTrigger>
          ) : null}
          <TabsTrigger value="tarefas-modelo">
            <ListTodoIcon className="size-4" />
            Tarefa modelo
          </TabsTrigger>
          <TabsTrigger value="meu-perfil">
            <KeyRoundIcon className="size-4" />
            Meu perfil
          </TabsTrigger>
        </TabsList>

        {activeTab === "users" && podeAcessarUsuario && <UsersTabContent />}
        {activeTab === "setores" && podeAcessarSetor && <SetoresTabContent />}
        {activeTab === "etiquetas" && podeAcessarEtiqueta && <EtiquetasTabContent />}
        {activeTab === "tarefas-modelo" && <TarefasModeloTabContent />}
        {activeTab === "meu-perfil" && <MeuPerfilTabContent />}
      </Tabs>
    </div>
  )
}
