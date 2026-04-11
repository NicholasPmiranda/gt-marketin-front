"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { DashboardBarrasPrioridade } from "@/app/app/components/dashboard/dashboard-barras-prioridade"
import { DashboardBarrasProjeto } from "@/app/app/components/dashboard/dashboard-barras-projeto"
import { DashboardBarrasResponsavel } from "@/app/app/components/dashboard/dashboard-barras-responsavel"
import { DashboardBarrasSetor } from "@/app/app/components/dashboard/dashboard-barras-setor"
import { DashboardBarrasStatus } from "@/app/app/components/dashboard/dashboard-barras-status"
import { DashboardCards } from "@/app/app/components/dashboard/dashboard-cards"
import { DashboardFiltros } from "@/app/app/components/dashboard/dashboard-filtros"
import { DashboardLinhasAtrasosPorPeriodo } from "@/app/app/components/dashboard/dashboard-linhas-atrasos-por-periodo"
import { DashboardLinhasBacklogPorPeriodo } from "@/app/app/components/dashboard/dashboard-linhas-backlog-por-periodo"
import { DashboardLinhasConcluidasPorPeriodo } from "@/app/app/components/dashboard/dashboard-linhas-concluidas-por-periodo"
import { DashboardLinhasCriadasPorPeriodo } from "@/app/app/components/dashboard/dashboard-linhas-criadas-por-periodo"
import { DashboardLinhasLeadTimeMedioPorPeriodo } from "@/app/app/components/dashboard/dashboard-linhas-lead-time-medio-por-periodo"
import { DashboardLinhasTaxaConclusaoPorPeriodo } from "@/app/app/components/dashboard/dashboard-linhas-taxa-conclusao-por-periodo"
import { useAuth } from "@/contexts/auth-context"
import type { DashFiltros } from "@/types/dash"


export default function Page() {
  const router = useRouter()
  const { user, loadingProfile } = useAuth()
  const [filtros, setFiltros] = useState<DashFiltros>({
    periodo: "mes",
    limite: 10,
  })

  useEffect(() => {
    if (!loadingProfile && user?.perfil === "funcionario") {
      router.replace("/app/tarefas")
    }
  }, [loadingProfile, user?.perfil, router])

  if (loadingProfile || user?.perfil === "funcionario") {
    return null
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <DashboardFiltros filtros={filtros} setFiltros={setFiltros} />
        <DashboardCards filtros={filtros} />
        <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
          <DashboardBarrasStatus filtros={filtros} />
          <DashboardBarrasPrioridade filtros={filtros} />
          <DashboardBarrasProjeto filtros={filtros} />
          <DashboardBarrasSetor filtros={filtros} />
          <DashboardBarrasResponsavel filtros={filtros} />
          <DashboardLinhasCriadasPorPeriodo filtros={filtros} />
          <DashboardLinhasConcluidasPorPeriodo filtros={filtros} />
          <DashboardLinhasBacklogPorPeriodo filtros={filtros} />
          <DashboardLinhasTaxaConclusaoPorPeriodo filtros={filtros} />
          <DashboardLinhasAtrasosPorPeriodo filtros={filtros} />
          <DashboardLinhasLeadTimeMedioPorPeriodo filtros={filtros} />
        </div>
      </div>
    </div>
  )
}
