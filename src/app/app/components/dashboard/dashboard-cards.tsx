"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { buscarDashCards } from "@/lib/dash-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashCards, DashFiltros } from "@/types/dash"

type DashboardCardsProps = {
  filtros: DashFiltros
}

const cardsIniciais: DashCards = {
  total_tarefas: 0,
  tarefas_ativas: 0,
  tarefas_concluidas: 0,
  taxa_conclusao: 0,
  projetos_unicos: 0,
  setores_unicos: 0,
  responsaveis_unicos: 0,
}

export function DashboardCards({ filtros }: DashboardCardsProps) {
  const [dados, setDados] = useState<DashCards>(cardsIniciais)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        setIsLoading(true)
        const response = await buscarDashCards(filtros)
        setDados(response)
      } catch {
        toast.error("Nao foi possivel carregar os cards do dashboard.")
      } finally {
        setIsLoading(false)
      }
    }

    void carregar()
  }, [filtros])

  const itens = [
    { titulo: "Total de tarefas", valor: dados.total_tarefas },
    { titulo: "Tarefas ativas", valor: dados.tarefas_ativas },
    { titulo: "Tarefas concluidas", valor: dados.tarefas_concluidas },
    { titulo: "Taxa de conclusao", valor: `${dados.taxa_conclusao.toFixed(2)}%` },
    { titulo: "Projetos unicos", valor: dados.projetos_unicos },
    { titulo: "Setores unicos", valor: dados.setores_unicos },
    { titulo: "Responsaveis unicos", valor: dados.responsaveis_unicos },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-4 lg:px-6">
      {itens.map((item) => (
        <Card key={item.titulo}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{item.titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-semibold tabular-nums">{item.valor}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
