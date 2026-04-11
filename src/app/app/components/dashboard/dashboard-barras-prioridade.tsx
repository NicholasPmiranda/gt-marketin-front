"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { buscarDashBarrasPrioridade } from "@/lib/dash-api"
import type { DashBarraPrioridade, DashFiltros } from "@/types/dash"

const chartConfig = { total: { label: "Total", color: "var(--primary)" } } satisfies ChartConfig

export function DashboardBarrasPrioridade({ filtros }: { filtros: DashFiltros }) {
  const [dados, setDados] = useState<DashBarraPrioridade[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        setIsLoading(true)
        setDados(await buscarDashBarrasPrioridade(filtros))
      } catch {
        toast.error("Nao foi possivel carregar o grafico de prioridade.")
      } finally {
        setIsLoading(false)
      }
    }

    void carregar()
  }, [filtros])

  return (
    <Card>
      <CardHeader><CardTitle>Prioridade das tarefas</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-[260px] w-full" /> : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart data={dados}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="prioridade" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="total" fill="var(--color-total)" radius={8} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
