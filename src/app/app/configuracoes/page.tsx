"use client"

import { useState } from "react"
import { LayersIcon, TagsIcon, UsersIcon } from "lucide-react"

import type { ConfigTab } from "@/types/configuracoes"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  EtiquetasTabContent,
  SetoresTabContent,
  UsersTabContent,
} from "./components/configuracoes-tabs"

export default function Page() {
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

        {activeTab === "users" && <UsersTabContent />}
        {activeTab === "setores" && <SetoresTabContent />}
        {activeTab === "etiquetas" && <EtiquetasTabContent />}
      </Tabs>
    </div>
  )
}
